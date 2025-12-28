    "use client";

    import { useEffect, useState } from 'react';
    import { notFound } from 'next/navigation';
    import dynamic from 'next/dynamic';
    import { supabase } from '@/lib/supabaseClient';
    import LoadingSpinner from '@/components/LoadingSpinner';
    import { Tables } from '@/types/supabase'; 


    export type ChallengeDetailData = Tables<'Challenge'> & {
    StartupProfile: {
        company_name: string | null;
        logo_url: string | null;
    } | null;
    ChallengeSkill: {
        Skill: {
        id: string;
        name: string;
        } | null;
    }[];
    Submission: (Tables<'Submission'> & {
        StudentProfile: Tables<'StudentProfile'> | null;
    })[];
    };

    const ChallengeDetailView = dynamic(() => import('./ChallengeDetailView'), {
    loading: () => <LoadingSpinner />,
    });

    export default function ChallengePageClient({ id }: { id: string }) {
    const [challenge, setChallenge] = useState<ChallengeDetailData | null>(null);
    const [applicantCount, setApplicantCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchChallengeData() {
        try {
            const { data, error: challengeError } = await supabase
            .from('Challenge') 
            .select(`
                *,
                StartupProfile ( company_name, logo_url ),
                ChallengeSkill ( Skill ( id, name ) ),
                Submission ( *, StudentProfile ( * ) )
            `)
            .eq('id', id)
            .single();

            if (challengeError) throw challengeError;
            if (!data) {
            setError('not_found');
            return;
            }

            setChallenge(data as unknown as ChallengeDetailData);

            const { data: countData, error: countError } = await supabase
            .rpc('get_challenge_applicant_count', { challenge_id: id });

            if (!countError && countData !== null) {
            setApplicantCount(countData);
            }

        } catch (err) {
            console.error('Error fetching challenge:', err);
            setError('Error loading challenge');
        } finally {
            setLoading(false);
        }
        }

        fetchChallengeData();
    }, [id]);

    if (loading) return <div className="pt-32"><LoadingSpinner /></div>;
    if (error === 'not_found') return notFound();
    if (error) return <div className="pt-32 text-center text-red-500">Chyba při načítání výzvy.</div>;
    
    return (
        <ChallengeDetailView 
        challenge={challenge} 
        applicantCount={applicantCount} 
        />
    );
    }