import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
                try {
                  cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) => cookieStore.set(name, value, options));
                } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const body = await request.json();
    const { questionId, answer_text, is_pinned, challengeId } = body;
    if (!questionId || !challengeId) {
      return new NextResponse('Missing fields', { status: 400 });
    }
    const hasAnswerInBody = typeof answer_text !== 'undefined' && answer_text !== null && String(answer_text).trim() !== '';
    const hasPinnedInBody = typeof is_pinned !== 'undefined';
    if (!hasAnswerInBody && !hasPinnedInBody) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const { data: challenge, error: challengeErr } = await supabase
      .from('Challenge')
      .select('id, startup_id, title')
      .eq('id', challengeId)
      .single();

    if (challengeErr || !challenge) {
      return new NextResponse('Challenge not found', { status: 404 });
    }

    if (challenge.startup_id !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { data: existingQ, error: existingErr } = await supabase
      .from('ChallengeQuestion')
      .select('id, answer_text')
      .eq('id', questionId)
      .single();

    if (existingErr || !existingQ) {
      return new NextResponse('Question not found', { status: 404 });
    }

    if (hasAnswerInBody && existingQ.answer_text) {
      return new NextResponse('Question already answered', { status: 409 });
    }

    const updatePayload: Record<string, unknown> = {};
    if (hasAnswerInBody) {
      updatePayload.answer_text = answer_text;
      updatePayload.answered_at = new Date().toISOString();
    }
    if (typeof is_pinned !== 'undefined') {
      updatePayload.is_pinned = is_pinned;
    }

    if (Object.keys(updatePayload).length === 0) {
      return new NextResponse('Nothing to update', { status: 400 });
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

    try {
      if (hasAnswerInBody) {
        await supabase.from('notifications').insert({
          user_id: updated.student_id,
          message: `Startup odpověděl na tvou otázku k výzvě ${challenge.title || ''}`,
          link_url: `/challenges/${challengeId}`,
        });
      }
    } catch (err) {
      console.warn('Failed to insert notification for asker', err);
    }

    if (is_pinned) {
      try {
        const { data: subs } = await supabase.from('Submission').select('student_id').eq('challenge_id', challengeId);
        const { data: saved } = await supabase.from('SavedChallenge').select('student_id').eq('challenge_id', challengeId);

        const ids = new Set<string>();
        const subsArr = (subs ?? []) as Array<{ student_id?: string }>;
        const savedArr = (saved ?? []) as Array<{ student_id?: string }>; 
        subsArr.forEach(s => { if (s?.student_id) ids.add(s.student_id); });
        savedArr.forEach(s => { if (s?.student_id) ids.add(s.student_id); });

        ids.delete(updated.student_id);

        const toInsert = Array.from(ids).map(id => ({ user_id: id, message: `Nová veřejná odpověď u výzvy ${challenge.title || ''}`, link_url: `/challenges/${challengeId}` }));

        if (toInsert.length > 0) {
          await supabase.from('notifications').insert(toInsert);
        }
      } catch (err) {
        console.warn('Failed to insert bulk notifications', err);
      }
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (err) {
    console.error('Answer question error', err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
