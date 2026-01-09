import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// --- KONFIGURACE XP ---
const calculateNextLevelXp = (level: number) => Math.floor(100 * (level ** 1.6));
const calculateSkillNextLevelXp = (level: number) => Math.floor(75 * (level ** 1.4));

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: {
    id: string;
    title: string;
    status: string;
    startup_id: string;
  };
  old_record: {
    status: string;
  };
  schema: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // OPRAVA: Použití SERVICE_ROLE_KEY místo SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '' 
    )

    const payload: WebhookPayload = await req.json();
    const { record, old_record } = payload;

    // 1. BEZPEČNOSTNÍ KONTROLA
    if (record.status !== 'closed' || old_record.status === 'closed') {
      return new Response(JSON.stringify({ message: 'Ignored: Not a closing event' }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      });
    }

    const challengeId = record.id;
    console.log(`🔒 Zpracovávám uzavření výzvy: ${challengeId} (${record.title})`);

    // 2. NAČTENÍ DAT
    const [submissionsRes, challengeSkillsRes] = await Promise.all([
      supabase
        .from('Submission')
        .select('id, student_id, rating, position, status')
        .eq('challenge_id', challengeId)
        .neq('status', 'applied'),
      
      supabase
        .from('ChallengeSkill')
        .select('skill_id')
        .eq('challenge_id', challengeId)
    ]);

    if (submissionsRes.error) throw submissionsRes.error;
    const submissions = submissionsRes.data || [];
    
    if (submissions.length === 0) {
      return new Response(JSON.stringify({ message: 'No submissions to process' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const skillIds = challengeSkillsRes.data?.map(s => s.skill_id) || [];
    const studentIds = submissions.map(s => s.student_id);

    const [profilesRes, studentSkillsRes] = await Promise.all([
      supabase.from('StudentProfile').select('user_id, level, xp').in('user_id', studentIds),
      supabase.from('StudentSkill').select('student_id, skill_id, level, xp').in('student_id', studentIds).in('skill_id', skillIds)
    ]);

    const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]) || []);
    const skillsMap = new Map(studentSkillsRes.data?.map(s => [`${s.student_id}_${s.skill_id}`, s]) || []);

    // 3. VÝPOČTY
    const profileUpdates = [];
    const skillUpserts = [];
    const xpEvents = [];
    const notifications = [];

    for (const sub of submissions) {
      if (sub.rating === null) continue;

      // A. VÝPOČET XP PROFILU
      const baseXp = 25;
      const qualityBonus = Math.floor(((sub.rating / 10) ** 2) * 25);
      const positionBonus = sub.position === 1 ? 100 : sub.position === 2 ? 75 : sub.position === 3 ? 50 : 0;
      const totalXpGain = baseXp + qualityBonus + positionBonus;

      const profile = profilesMap.get(sub.student_id);
      if (profile) {
        let { level, xp } = profile;
        const oldLevel = level;
        xp += totalXpGain;
        
        let nextLevelXp = calculateNextLevelXp(level);
        while (xp >= nextLevelXp) {
          xp -= nextLevelXp;
          level++;
          nextLevelXp = calculateNextLevelXp(level);
        }

        profileUpdates.push({
          user_id: sub.student_id,
          level,
          xp,
          updated_at: new Date().toISOString()
        });

        xpEvents.push({
          student_id: sub.student_id,
          submission_id: sub.id,
          event_type: 'student_xp',
          xp_gained: totalXpGain,
          new_level: level > oldLevel ? level : null,
          is_seen: false
        });
      }

      // B. VÝPOČET XP SKILLŮ
      const isWinner = sub.position !== null && sub.position <= 3;
      const multiplier = isWinner ? 75 : 50;
      const skillXpGain = Math.floor((sub.rating / 10) * multiplier);

      for (const skillId of skillIds) {
        const mapKey = `${sub.student_id}_${skillId}`;
        const skillData = skillsMap.get(mapKey);

        let sLevel = skillData ? skillData.level : 1;
        let sXp = skillData ? skillData.xp : 0;
        const oldSLevel = sLevel;

        sXp += skillXpGain;
        
        let nextSkillXp = calculateSkillNextLevelXp(sLevel);
        while (sXp >= nextSkillXp) {
          sXp -= nextSkillXp;
          sLevel++;
          nextSkillXp = calculateSkillNextLevelXp(sLevel);
        }

        skillUpserts.push({
          student_id: sub.student_id,
          skill_id: skillId,
          level: sLevel,
          xp: sXp,
          updated_at: new Date().toISOString()
        });

        xpEvents.push({
          student_id: sub.student_id,
          submission_id: sub.id,
          event_type: skillData ? 'skill_xp' : 'new_skill',
          skill_id: skillId,
          xp_gained: skillXpGain,
          new_level: sLevel > oldSLevel ? sLevel : null,
          is_seen: false
        });
      }

      // C. NOTIFIKACE
      let notifMsg = `Výzva "${record.title}" byla ukončena. Tvé řešení bylo ohodnoceno.`;
      let notifType = 'challenge_closed';
      
      if (sub.position && sub.position <= 3) {
        notifMsg = `Gratulujeme! Ve výzvě "${record.title}" ses umístil na ${sub.position}. místě!`;
        notifType = 'challenge_winner';
      }

      notifications.push({
        user_id: sub.student_id,
        message: notifMsg,
        link_url: `/challenges/${challengeId}`,
        type: notifType,
        is_read: false
      });
    }

    // 4. ULOŽENÍ DO DB
    console.log(`💾 Ukládám: ${profileUpdates.length} profilů, ${skillUpserts.length} skillů, ${xpEvents.length} eventů.`);

    if (skillUpserts.length > 0) await supabase.from('StudentSkill').upsert(skillUpserts);
    if (profileUpdates.length > 0) await supabase.from('StudentProfile').upsert(profileUpdates);
    if (xpEvents.length > 0) await supabase.from('XpEvent').insert(xpEvents);
    if (notifications.length > 0) await supabase.from('notifications').insert(notifications);

    // 5. ODESLÁNÍ E-MAILŮ
    const emailPayload = {
      record: record,
      old_record: old_record,
      table: 'Challenge',
      type: 'UPDATE',
      manual_trigger: true
    };

    const emailFunctionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-challenge-emails`;
    
    console.log(`🚀 Odpaluji e-maily na URL: ${emailFunctionUrl}`);
    
    const emailPromise = fetch(emailFunctionUrl, {
      method: 'POST',
      headers: {
        // OPRAVA: Použití SERVICE_ROLE_KEY pro autorizaci
        'Authorization': `Bearer ${Deno.env.get('SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })
    .then(async (res) => {
        if (res.ok) {
            console.log("✅ Email function invoked successfully (200 OK)");
        } else {
            const errText = await res.text();
            console.error(`❌ Email function failed with status ${res.status}: ${errText}`);
        }
    })
    .catch(err => console.error("❌ Network error invoking email function:", err));

    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(emailPromise);
    }

    return new Response(JSON.stringify({ success: true, processed: submissions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
})