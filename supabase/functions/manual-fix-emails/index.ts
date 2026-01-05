// supabase/functions/manual-fix-emails/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

// !!! ZDE DOPLŇ DATA !!!
const CHALLENGE_ID = "eecfe240-258a-4156-94f7-ca1407313593"; 
const EMAILS_TO_SKIP = [
  "notklasik@gmail.com",
  "258951@vutbr.cz",
  "nymburskab@gmail.com",
  "marek.kostal1@gmail.com",
  "trojankova.e@gmail.com",
  "antekirt2@gmail.com",
  "jirka4870@gmail.com",
  "pavlikova.26o@gymspk.cz",
]; 
// !!!!!!!!!!!!!!!!!!!!!!

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') 

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null
const supabase = (SUPABASE_URL && SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY) 
  : null

// Pomocná funkce pro pauzu (Throttle)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const COLORS = {
  primary: '#2563EB', textMain: '#111827', textMuted: '#6B7280', border: '#E5E7EB',
  bgBadgeWinner: '#FFFBEB', textBadgeWinner: '#B45309', bgBadgePartic: '#EFF6FF', textBadgePartic: '#2563EB'
};

const getEmailHtml = (name: string, title: string, type: 'winner' | 'participant', challengeTitle: string) => {
  // ... (TENTO KÓD ZŮSTÁVÁ STEJNÝ JAKO PŘEDTÍM - DESIGN) ...
  // Pro úsporu místa zde v chatu to neopisuji celé, 
  // NECH TAM TEN HTML GENERÁTOR, CO JSI TAM MĚL
  const isWinner = type === 'winner';
  const badgeText = isWinner ? 'VÍTĚZSTVÍ' : 'HODNOCENÍ';
  const badgeBg = isWinner ? COLORS.bgBadgeWinner : COLORS.bgBadgePartic;
  const badgeColor = isWinner ? COLORS.textBadgeWinner : COLORS.textBadgePartic;
  const heading = isWinner ? 'Gratulujeme k výhře' : 'Nová zpětná vazba';
  
  const bodyText = isWinner
    ? `Tohle je velký úspěch. Konkurence byla silná, ale tvé řešení ve výzvě <strong>${challengeTitle}</strong> startup oslovilo nejvíce. Je vidět, že máš talent a cit pro detail. Tvá práce měla přesně tu kvalitu, kterou hledali.`
    : `Konkurence ve výzvě <strong>${challengeTitle}</strong> byla obrovská a rozhodovaly detaily. Tentokrát vyhrálo jiné řešení, ale nenech se odradit. Každý pokus tě posouvá dál. Podívej se na hodnocení, vylepši svůj skill a příště to urvi ty.`;

  const ctaLink = "https://risehigh.io/dashboard"; 
  const ctaText = isWinner ? "Přejít na detail výzvy" : "Zobrazit zpětnou vazbu";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; } .btn:hover { opacity: 0.9; }</style></head>
<body style="background-color: #ffffff; color: ${COLORS.textMain}; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto;">
    <div style="margin-bottom: 32px;"><a href="https://risehigh.io" style="color: ${COLORS.primary}; font-weight: 800; font-size: 20px; text-decoration: none; letter-spacing: -0.5px;">RiseHigh</a></div>
    <div style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; margin-bottom: 20px;">${badgeText}</div>
    <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${COLORS.textMain}; letter-spacing: -0.5px; line-height: 1.3;">${heading}</h1>
    <p style="margin: 0 0 32px; font-size: 15px; line-height: 26px; color: ${COLORS.textMain};">${bodyText}</p>
    <div style="border-top: 1px solid ${COLORS.border}; border-bottom: 1px solid ${COLORS.border}; padding: 20px 0; margin-bottom: 32px;">
      ${isWinner ? 
        `<div style="font-size: 14px; color: ${COLORS.textMuted}; margin-bottom: 4px;">Další krok</div><div style="font-size: 15px; color: ${COLORS.textMain}; font-weight: 500;">Startup tě bude kontaktovat ohledně odměny.</div>` 
        : 
        `<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td style="padding-bottom: 12px;"><div style="font-size: 14px; color: ${COLORS.textMain}; font-weight: 600;">💬 Zpětná vazba</div><div style="font-size: 14px; color: ${COLORS.textMuted};">Zjisti, v čem se můžeš příště zlepšit.</div></td></tr><tr><td><div style="font-size: 14px; color: ${COLORS.textMain}; font-weight: 600;">💼 Portfolio update</div><div style="font-size: 14px; color: ${COLORS.textMuted};">Tvé řešení bylo přidáno do tvého profilu.</div></td></tr></table>`
      }
    </div>
    <div style="margin-bottom: 40px;"><a href="${ctaLink}" class="btn" style="background-color: ${COLORS.primary}; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">${ctaText}</a></div>
    <div style="border-top: 1px solid ${COLORS.border}; padding-top: 24px; font-size: 12px; color: #9CA3AF; line-height: 20px;"><p style="margin: 0;">Automatická notifikace k výzvě ${challengeTitle}.<br><a href="https://risehigh.io" style="color: #9CA3AF; text-decoration: underline;">RiseHigh.io</a></p></div>
  </div>
</body>
</html>
  `;
};

// --- MANUAL EXECUTION HANDLER ---
Deno.serve(async (req) => {
  try {
    if (!RESEND_API_KEY || !supabase) throw new Error("Missing Keys");

    const { data: challenge } = await supabase.from('Challenge').select('title').eq('id', CHALLENGE_ID).single();
    if (!challenge) return new Response("Challenge not found", { status: 404 });

    const { data: submissions } = await supabase
      .from('Submission')
      .select(`id, status, position, StudentProfile ( first_name, User ( email ) )`)
      .eq('challenge_id', CHALLENGE_ID)
      .neq('status', 'applied');

    if (!submissions?.length) return new Response('No submissions found', { status: 200 });

    const results = [];

    // TADY JE TA ZMĚNA - PAUZA V CYKLU
    for (const sub of submissions) {
      const email = sub.StudentProfile?.User?.email;
      const name = sub.StudentProfile?.first_name || 'Studente';
      
      if (!email) continue;

      // FILTR PROTI DUPLICITÁM
      if (EMAILS_TO_SKIP.includes(email)) {
        console.log(`Skipping ${email} - already sent.`);
        results.push({ email, status: 'skipped' });
        continue; // Jde na dalšího, bez čekání
      }

      const isWinner = sub.status === 'winner' || (sub.position !== null && sub.position > 0);
      const subject = isWinner ? `Výhra ve výzvě: ${challenge.title}` : `Zpětná vazba: ${challenge.title}`;
      
      try {
        await resend.emails.send({
          from: 'RiseHigh <info@risehigh.io>',
          to: email,
          subject: subject,
          html: getEmailHtml(name, subject, isWinner ? 'winner' : 'participant', challenge.title)
        });
        console.log(`Email sent to ${email}`);
        results.push({ email, status: 'sent' });

        // !!! TADY JE TA BRZDA !!!
        // Čekáme 1000ms (1 sekundu) než pošleme další mail, abychom nenaštvali Resend
        await sleep(1000); 

      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        results.push({ email, status: 'error', error: error.message });
        
        // I po chybě chvíli počkáme
        await sleep(1000);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});