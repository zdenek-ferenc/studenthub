import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

// Helper funkce pro výpočty XP, aby byl kód čistý
const calculateXpForNextLevel = (level: number, base: number, exponent: number) => {
  return Math.floor(base * (level ** exponent));
};

// Definice typů pro robustnost
interface Submission {
  id: string;
  student_id: string;
  challenge_id: string;
  rating: number | null;
  position: number | null;
}

// Hlavní handler, který se postará o logiku
async function processXpUpdate(submission: Submission) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { id: submission_id, student_id, challenge_id, rating, position } = submission;

  if (rating === null) {
    console.log(`Submission ${submission.id} has no rating yet. Skipping XP processing.`);
    return;
  }

  // --- 1. Aktualizace celkové úrovně studenta (s novými hodnotami) ---
  const { data: studentProfile, error: profileError } = await supabaseAdmin
    .from('StudentProfile').select('level, xp').eq('user_id', student_id).single();

  if (profileError) {
    throw new Error(`[Profile] ${profileError.message}`);
  }
  
  const base_xp = 25; // Rebalanced
  const quality_bonus = Math.floor(((rating / 10) ** 2) * 25); // Rebalanced
  const position_bonus = position === 1 ? 100 : position === 2 ? 75 : position === 3 ? 50 : 0; // Rebalanced
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

  await supabaseAdmin.from('StudentProfile').update({ level, xp }).eq('user_id', student_id);

  // Zápis události
  await supabaseAdmin.from('XpEvent').insert({
      student_id, submission_id, event_type: 'student_xp', xp_gained: totalXpGain, new_level: level > originalLevel ? level : null
  });

  // --- 2. Aktualizace úrovní dovedností (s logikou pro přidání nového skillu) ---
  const { data: challengeSkills, error: skillsError } = await supabaseAdmin
    .from('ChallengeSkill').select('skill_id').eq('challenge_id', challenge_id);

  if (skillsError) {
    throw new Error(`[Skills] ${skillsError.message}`);
  }
  if (!challengeSkills) {
    return;
  }

  for (const { skill_id } of challengeSkills) {
    const { data: studentSkill, error: studentSkillError } = await supabaseAdmin
      .from('StudentSkill').select('level, xp').eq('student_id', student_id).eq('skill_id', skill_id).single();
    
    const isWinner = position !== null && position <= 3;
    const baseMultiplier = isWinner ? 75 : 50;
    const skillXpGain = Math.floor((rating / 10) * baseMultiplier);

    if (studentSkillError && studentSkillError.code === 'PGRST116') { // PGRST116 = not found
      // NOVÁ LOGIKA: Student skill nemá, tak mu ho vytvoříme
      let newSkillLevel = 1;
      let newSkillXp = skillXpGain;
      let xpForNextSkillLevel = calculateXpForNextLevel(newSkillLevel, 75, 1.4);
      
      while (newSkillXp >= xpForNextSkillLevel) {
          newSkillXp -= xpForNextSkillLevel;
          newSkillLevel++;
          xpForNextSkillLevel = calculateXpForNextLevel(newSkillLevel, 75, 1.4);
      }

      await supabaseAdmin.from('StudentSkill').insert({ student_id, skill_id, level: newSkillLevel, xp: newSkillXp });
      // Zápis události jako "nový skill"
      await supabaseAdmin.from('XpEvent').insert({
          student_id, submission_id, event_type: 'new_skill', xp_gained: skillXpGain, skill_id, new_level: newSkillLevel > 1 ? newSkillLevel : null
      });

    } else if (studentSkill) {
      // PŮVODNÍ LOGIKA: Student skill má, tak ho aktualizujeme
      let { level: skillLevel, xp: skillXp } = studentSkill;
      const originalSkillLevel = skillLevel;
      skillXp += skillXpGain;
      let xpForNextSkillLevel = calculateXpForNextLevel(skillLevel, 75, 1.4);

      while (skillXp >= xpForNextSkillLevel) {
        skillXp -= xpForNextSkillLevel;
        skillLevel++;
        xpForNextSkillLevel = calculateXpForNextLevel(skillLevel, 75, 1.4);
      }

      await supabaseAdmin.from('StudentSkill').update({ level: skillLevel, xp: skillXp }).eq('student_id', student_id).eq('skill_id', skill_id);
      // Zápis události jako "vylepšení skillu"
       await supabaseAdmin.from('XpEvent').insert({
          student_id, submission_id, event_type: 'skill_xp', xp_gained: skillXpGain, skill_id, new_level: skillLevel > originalSkillLevel ? skillLevel : null
      });
    }
  }
}

// Hlavní Deno server, který naslouchá požadavkům
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: submission } = await req.json();
    await processXpUpdate(submission as Submission);
    
    return new Response(JSON.stringify({ message: "XP processed successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});