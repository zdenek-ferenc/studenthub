// supabase/functions/process-submission-review/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts';

// Helper funkce beze změny
const calculateXpForNextLevel = (level: number, base: number, exponent: number) => {
  return Math.floor(base * (level ** exponent));
};

interface Submission {
  id: string;
  student_id: string;
  challenge_id: string;
  rating: number | null;
  position: number | null;
}

async function processXpUpdate(submission: Submission) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { id: submission_id, student_id, challenge_id, rating, position } = submission;

  if (rating === null) {
    console.log(`Submission ${submission.id} has no rating yet. Skipping.`);
    return;
  }

  // --- 1. Aktualizace profilu (Zůstává stejné) ---
  const { data: studentProfile, error: profileError } = await supabaseAdmin
    .from('StudentProfile').select('level, xp').eq('user_id', student_id).single();

  if (profileError) throw new Error(`[Profile] ${profileError.message}`);
  
  const base_xp = 25;
  const quality_bonus = Math.floor(((rating / 10) ** 2) * 25);
  const position_bonus = position === 1 ? 100 : position === 2 ? 75 : position === 3 ? 50 : 0;
  const totalXpGain = base_xp + quality_bonus + position_bonus;

  let { level, xp } = studentProfile;
  const originalLevel = level;
  xp += totalXpGain;
  let xpForNextLevel = calculateXpForNextLevel(level, 100, 1.6);

  while (xp >= xpForNextLevel) {
    xp -= xpForNextLevel;
    level++;
    xpForNextLevel = calculateXpForNextLevel(level, 100, 1.6);
  }

  // Paralelní update profilu a insert XP eventu pro profil
  await Promise.all([
    supabaseAdmin.from('StudentProfile').update({ level, xp }).eq('user_id', student_id),
    supabaseAdmin.from('XpEvent').insert({
      student_id, submission_id, event_type: 'student_xp', xp_gained: totalXpGain, new_level: level > originalLevel ? level : null
    })
  ]);

  // --- 2. Aktualizace skills (OPTIMALIZOVÁNO) ---
  const { data: challengeSkills } = await supabaseAdmin
    .from('ChallengeSkill').select('skill_id').eq('challenge_id', challenge_id);

  if (challengeSkills && challengeSkills.length > 0) {
    
    // Zde použijeme Promise.all pro paralelní zpracování všech skillů najednou
    const skillUpdates = challengeSkills.map(async ({ skill_id }) => {
      const { data: studentSkill } = await supabaseAdmin
        .from('StudentSkill').select('level, xp').eq('student_id', student_id).eq('skill_id', skill_id).single();
      
      const isWinner = position !== null && position <= 3;
      const baseMultiplier = isWinner ? 75 : 50;
      const skillXpGain = Math.floor((rating / 10) * baseMultiplier);
      
      if (!studentSkill) {
        // Create new skill logic
        let newSkillLevel = 1;
        let newSkillXp = skillXpGain;
        let nextLvl = calculateXpForNextLevel(newSkillLevel, 75, 1.4);
        
        while (newSkillXp >= nextLvl) {
          newSkillXp -= nextLvl;
          newSkillLevel++;
          nextLvl = calculateXpForNextLevel(newSkillLevel, 75, 1.4);
        }

        // Paralelní insert skillu a eventu
        return Promise.all([
           supabaseAdmin.from('StudentSkill').insert({ student_id, skill_id, level: newSkillLevel, xp: newSkillXp }),
           supabaseAdmin.from('XpEvent').insert({
              student_id, submission_id, event_type: 'new_skill', xp_gained: skillXpGain, skill_id, new_level: newSkillLevel > 1 ? newSkillLevel : null
           })
        ]);

      } else {
        // Update existing skill logic
        let { level: sLevel, xp: sXp } = studentSkill;
        const origSLevel = sLevel;
        sXp += skillXpGain;
        let nextLvl = calculateXpForNextLevel(sLevel, 75, 1.4);

        while (sXp >= nextLvl) {
          sXp -= nextLvl;
          sLevel++;
          nextLvl = calculateXpForNextLevel(sLevel, 75, 1.4);
        }

        // Paralelní update skillu a eventu
        return Promise.all([
            supabaseAdmin.from('StudentSkill').update({ level: sLevel, xp: sXp }).eq('student_id', student_id).eq('skill_id', skill_id),
            supabaseAdmin.from('XpEvent').insert({
              student_id, submission_id, event_type: 'skill_xp', xp_gained: skillXpGain, skill_id, new_level: sLevel > origSLevel ? sLevel : null
            })
        ]);
      }
    });

    // Čekáme, až se zpracují všechny skilly
    await Promise.all(skillUpdates);
  }

  // --- 3. Notifikace ---
  const { data: challengeData } = await supabaseAdmin
    .from('Challenge').select('title').eq('id', challenge_id).single();

  let message = '';
  let type = 'submission_reviewed';

  if (position && position <= 3) {
    message = `Gratulujeme! Umístil ses na ${position}. místě ve výzvě "${challengeData?.title}".`;
    type = 'submission_winner';
  } else {
    message = `Tvoje řešení pro výzvu "${challengeData?.title}" bylo ohodnoceno. Podívej se na zpětnou vazbu.`;
  }

  await supabaseAdmin.from('notifications').insert({
    user_id: student_id,
    message,
    link_url: `/challenges/${challenge_id}`,
    type: type
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { record } = await req.json();
    await processXpUpdate(record as Submission);
    return new Response(JSON.stringify({ message: "Success" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return new Response(JSON.stringify({ error: msg }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});