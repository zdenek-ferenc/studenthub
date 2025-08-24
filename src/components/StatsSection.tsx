"use client";

import CountUp from 'react-countup';

export default function StatsSection() {
  return (
    <section className="flex flex-col sm:flex-row justify-center gap-x-16 sm:gap-x-24 text-center py-12 text-[var(--barva-tmava)]">
      
      {/* První statistika */}
      <div className='flex justify-center items-center gap-4'>
        <p className="text-6xl font-bold">
          <CountUp
            end={142}
            duration={2.5}
            enableScrollSpy={true} // Spustí animaci, až když je vidět
            scrollSpyOnce={true} // Spustí se jen jednou
            suffix="+"
          />
        </p>
        <p className="text-4xl sm:text-5xl">Hotových výzev</p>
      </div>
      
      {/* Druhá statistika */}
      <div className='flex justify-center items-center gap-4'>
        <p className="text-6xl font-bold">
          <CountUp
            end={47}
            duration={2.5}
            enableScrollSpy={true}
            scrollSpyOnce={true}
            suffix="+"
          />
        </p>
        <p className="text-4xl sm:text-5xl">partnerských startupů</p>
      </div>

    </section>
  );
}