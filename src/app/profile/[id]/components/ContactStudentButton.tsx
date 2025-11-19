import React, { useState, useEffect } from 'react';
import { Loader2, MessageSquare, CheckCircle, Handshake, Info } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth, Profile } from '../../../../contexts/AuthContext';
import ContactStudentModal from '../../../../components/ContactStudentModal';
import { StudentProfile } from '../types';

interface ContactStudentButtonProps {
    profile: StudentProfile;
    isOwner: boolean;
    viewerProfile: Profile | null;
}

const ContactStudentButton = ({ profile, isOwner, viewerProfile }: ContactStudentButtonProps) => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactState, setContactState] = useState<{
        loading: boolean;
        can_contact: boolean;
        reason: string | null;
        status: string | null;
        challenge_id: string | null;
    }>({
        loading: (viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') && !isOwner,
        can_contact: false,
        reason: null,
        status: null,
        challenge_id: null,
    });

    const startupCompanyName = (viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin')
        ? viewerProfile.company_name
        : 'Startup';

    useEffect(() => {
        if ((viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') && !isOwner && user) {
            setContactState(prev => ({ ...prev, loading: true }));

            const checkEligibility = async () => {
                const { data, error } = await supabase.rpc('check_contact_eligibility', {
                    p_startup_id: user.id,
                    p_student_id: profile.user_id
                });

                if (error) {
                    console.error("Chyba při kontrole oprávnění:", error);
                    setContactState({ loading: false, can_contact: false, reason: 'rpc_error', status: null, challenge_id: null });
                } else {
                    setContactState({ loading: false, ...data });
                }
            };
            checkEligibility();
        } else {
            setContactState(prev => ({ ...prev, loading: false }));
        }
    }, [isOwner, user?.id, profile.user_id, viewerProfile?.role]);

    if (!((viewerProfile?.role === 'startup' || viewerProfile?.role === 'admin') && !isOwner)) {
        return null;
    }

    const renderButton = () => {
        if (contactState.loading) {
            return (
                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-500 cursor-wait">
                    <Loader2 className="animate-spin" size={18} />
                    Načítám...
                </button>
            );
        }

        if (contactState.status === 'pending') {
            return (
                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500">
                    <MessageSquare size={18} />
                    Žádost odeslána
                </button>
            );
        }

        if (contactState.status === 'accepted') {
            return (
                <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700">
                    <CheckCircle size={18} />
                    Kontakt navázán
                </button>
            );
        }

        if (contactState.can_contact) {
            return (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex mx-auto items-center cursor-pointer justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--barva-primarni)] text-white text-sm font-semibold hover:opacity-90 transition-opacity ease-in-out duration-200"
                >
                    <Handshake size={18} />
                    Kontaktovat talent
                </button>
            );
        }

        if (contactState.reason === 'not_looking') {
            return (
                <button disabled title="Student si nepřeje být kontaktován" className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-500 cursor-not-allowed">
                    <Info size={18} />
                    Student momentálně nepříjmá kontakty
                </button>
            );
        }

        return null;
    };

    return (
        <>
            {renderButton()}
            {isModalOpen && (
                <ContactStudentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    studentId={profile.user_id}
                    studentName={`${profile.first_name} ${profile.last_name}`}
                    challengeId={contactState.challenge_id}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        setContactState(prev => ({ ...prev, status: 'pending', can_contact: false, reason: 'already_pending' }));
                    }}
                    startupCompanyName={startupCompanyName || 'Startup'}
                />
            )}
        </>
    );
};

export default ContactStudentButton;
