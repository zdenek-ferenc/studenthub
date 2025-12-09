import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const AnswerQuestionSchema = z.object({
  questionId: z.string().uuid("Neplatné ID otázky"),
  challengeId: z.string().uuid("Neplatné ID výzvy"),
  answer_text: z.string().trim().min(1, "Odpověď nesmí být prázdná").optional(),
  is_pinned: z.boolean().optional(),
}).refine(data => data.answer_text !== undefined || data.is_pinned !== undefined, {
  message: "Musíte poskytnout buď odpověď, nebo změnit stav připnutí.",
  path: ["answer_text"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validationResult = AnswerQuestionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { questionId, challengeId, answer_text, is_pinned } = validationResult.data;

    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const [challengeRes, questionRes] = await Promise.all([
      supabase
        .from('Challenge')
        .select('id, startup_id, title')
        .eq('id', challengeId)
        .single(),
      
      supabase
        .from('ChallengeQuestion')
        .select('id, answer_text, student_id')
        .eq('id', questionId)
        .single()
    ]);

    const { data: challenge, error: challengeErr } = challengeRes;
    const { data: existingQ, error: existingErr } = questionRes;

    if (challengeErr || !challenge) {
      return new NextResponse('Challenge not found', { status: 404 });
    }
    if (existingErr || !existingQ) {
      return new NextResponse('Question not found', { status: 404 });
    }

    if (challenge.startup_id !== user.id) {
      return new NextResponse('Forbidden: Nejste vlastníkem této výzvy', { status: 403 });
    }

    if (answer_text && existingQ.answer_text) {
      return new NextResponse('Question already answered', { status: 409 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (answer_text) {
      updatePayload.answer_text = answer_text;
      updatePayload.answered_at = new Date().toISOString();
    }
    if (is_pinned !== undefined) {
      updatePayload.is_pinned = is_pinned;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('ChallengeQuestion')
      .update(updatePayload)
      .eq('id', questionId)
      .select('*')
      .single();

    if (updateErr || !updated) {
      console.error('Update error', updateErr);
      return new NextResponse('Failed to update question', { status: 500 });
    }

    const notificationsPromises = [];

    if (answer_text) {
      notificationsPromises.push(
        supabase.from('notifications').insert({
          user_id: updated.student_id,
          message: `Startup odpověděl na tvou otázku k výzvě ${challenge.title || ''}`,
          link_url: `/challenges/${challengeId}`,
        })
      );
    }

    if (is_pinned) {
      const bulkNotifyTask = async () => {
        const [subsRes, savedRes] = await Promise.all([
            supabase.from('Submission').select('student_id').eq('challenge_id', challengeId),
            supabase.from('SavedChallenge').select('student_id').eq('challenge_id', challengeId)
        ]);

        const ids = new Set<string>();
        
        type StudentRef = { student_id: string | null };
        
        const subs = (subsRes.data || []) as unknown as StudentRef[];
        const saved = (savedRes.data || []) as unknown as StudentRef[];

        subs.forEach(s => { if (s.student_id) ids.add(s.student_id); });
        saved.forEach(s => { if (s.student_id) ids.add(s.student_id); });

        ids.delete(updated.student_id);

        if (ids.size > 0) {
          const notificationsData = Array.from(ids).map(id => ({
            user_id: id,
            message: `Nová veřejná odpověď u výzvy ${challenge.title || ''}`,
            link_url: `/challenges/${challengeId}`
          }));
          
          await supabase.from('notifications').insert(notificationsData);
        }
      };
      
      notificationsPromises.push(bulkNotifyTask());
    }

    await Promise.allSettled(notificationsPromises);

    return NextResponse.json({ success: true, question: updated });

  } catch (err) {
    console.error('Answer question error', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}