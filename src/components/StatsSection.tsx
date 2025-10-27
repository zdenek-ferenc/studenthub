"use client";

import CountUp from 'react-countup';

export default function StatsSection() {
  return (
    <section className="flex flex-col sm:flex-row justify-center gap-x-16 sm:gap-x-24 text-center pt-24 text-white">
      <div className='flex justify-center items-center gap-4'>
        <p className="text-4xl font-bold">
          <CountUp
            end={142}
            duration={2.5}
            enableScrollSpy={true} 
            scrollSpyOnce={true}
            suffix="+"
          />
        </p>
        <p className="text-2xl sm:text-3xl">Hotových výzev</p>
      </div>
      <div className='flex justify-center items-center gap-4'>
        <p className="text-4xl font-bold">
          <CountUp
            end={47}
            duration={2.5}
            enableScrollSpy={true}
            scrollSpyOnce={true}
            suffix="+"
          />
        </p>
        <p className="text-2xl sm:text-3xl">Partnerských startupů</p>
      </div>

    </section>
  );
}