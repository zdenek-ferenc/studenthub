import React from 'react';

export default function ModernProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#001224] text-gray-100 font-sans relative md:pb-24 overflow-x-hidden selection:bg-blue-500/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full opacity-40"></div>
                <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full opacity-30"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-3 pb-12 md:pt-32 max-w-[1400px]">
                {children}
            </div>
        </div>
    );
}