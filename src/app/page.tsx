import Link from 'next/link';
import Image from 'next/image';
import StatsSection from '../components/StatsSection';

export default function HomePage() {
  return (
    <div className="mx-auto px-4 bg-[var(--barva-svetle-pozadi)] w-f">
      <section className="py-24 sm:py-32 px-32 flex">
        <div className='text-left w-1/2'>
        <h1 className="text-4xl sm:text-7xl font-semibold text-[var(--barva-primarni)] leading-tight">
          Rozvíjej své dovednosti <br></br> na reálných výzvách.
        </h1>
        <h2 className="text-4xl sm:text-7xl font-semibold text-[var(--barva-tmava)] leading-tight">
          Nebo objev talenty a <br></br> získej inovativní řešení.
        </h2>
        <p className="mt-6 text-3xl text-[var(--barva-tmava)] font-light opacity-60 leading-loose">
          Platforma pro studenty vysokých škol a startupy. Získávejte zkušenosti, budujte portfolio a najděte si práci.
        </p>
        <div className="mt-10 flex gap-x-6">
          <Link href="/register/student" className="px-8 py-4 rounded-2xl bg-[var(--barva-primarni)] text-2xl text-white font-semibold shadow-sm hover:opacity-90 transition-all duration-300 ease-in-out">
            Přidej se jako student
          </Link>
          <Link href="/register/startup" className="px-8 py-4 rounded-2xl font-semibold bg-[var(--barva-tmava)] text-2xl text-white hover:opacity-90 transition-all duration-300 ease-in-out">
            Přidej se jako startup
          </Link>
        </div>
        </div>
        <div>
      <Image
        src="/hero-image.svg"
        alt="Student a startup spolupracují na projektu"
        width={750}
        height={500}
        className="w-4xl h-8xl rounded-lg"
      />
    </div>
      </section>
      <StatsSection />
      <Image
        src="/sponzori.png"
        alt="Partnerské startupy."
        width={1900}
        height={343}
        className="w-1/2 mx-auto py-12 h-8xl rounded-lg"
      />
    </div>
  );
}