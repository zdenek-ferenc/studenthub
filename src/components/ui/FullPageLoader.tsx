    import Image from "next/image";

    export default function FullPageLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#EFF8FF]">
        <div className="relative w-32 h-32 animate-pulse">
            <Image 
            src="/logo.svg" 
            alt="RiseHigh" 
            fill 
            className="object-contain"
            priority 
            />
        </div>
        </div>
    );
    }