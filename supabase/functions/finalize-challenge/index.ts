import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestData {
  challenge_id: string;
  winners: { [key: string]: string }; // key je pozice ("1", "2"), value je submission_id
}

Deno.serve(async (req) => {
  // 1. CORS Handle
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Init Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Parse Data
    const { challenge_id, winners } = await req.json() as RequestData;

    console.log(`Finalizing challenge ${challenge_id} with winners:`, winners);

    // 4. UPDATE VÍTĚZŮ
    // Toto je standardní update databáze. 
    // !!! TOTO SPUSTÍ WEBHOOK PRO XP (process-submission-review) !!!
    const winnerUpdates = Object.entries(winners).map(async ([place, submissionId]) => {
      const { error } = await supabase
        .from('Submission')
        .update({ 
          position: parseInt(place), 
          status: 'winner' 
        })
        .eq('id', submissionId);
      
      if (error) throw new Error(`Failed to update winner ${submissionId}: ${error.message}`);
    });

    // Počkáme, až jsou vítězové označeni (aby se spustily webhooky)
    await Promise.all(winnerUpdates);

    // 5. UZAVŘENÍ VÝZVY
    // Toto spustí webhook pro e-maily (send-challenge-emails)
    const { error: closeError } = await supabase
      .from('Challenge')
      .update({ status: 'closed' })
      .eq('id', challenge_id);

    if (closeError) throw new Error(`Failed to close challenge: ${closeError.message}`);

    // 6. Return Success
    return new Response(
      JSON.stringify({ message: 'Challenge finalized successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    console.error('Finalize error:', error);
    
    // STRICT MODE FIX:
    // Error v catch bloku je 'unknown'. Musíme zjistit, jestli je to objekt Error.
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})