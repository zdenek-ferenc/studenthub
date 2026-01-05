type Props = {
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    isSubmitting: boolean;
};

export default function WizardNavigation({ currentStep, totalSteps, onNext, onPrev, isSubmitting }: Props) {
    return (
        <div className="px-8 md:px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            {currentStep > 1 ? (
                <button
                    type="button"
                    onClick={onPrev}
                    className="px-6 py-2.5 rounded-full font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    Zpět
                </button>
            ) : (
                <div></div> // Empty div to keep Next button on the right
            )}

            {currentStep < totalSteps ? (
                <button
                    type="button"
                    onClick={onNext}
                    className="px-8 py-3 rounded-full font-bold text-white bg-[var(--barva-primarni)] hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                    Pokračovat
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-full font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Ukládám...' : 'Vytvořit Předmět'}
                </button>
            )}
        </div>
    );
}