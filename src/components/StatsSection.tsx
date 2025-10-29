"use client";

import CountUp from 'react-countup';

export default function StatsSection() {
  return (
    <section className="flex flex-col md:flex-row justify-center gap-6 md:gap-7 gap-x-16 sm:gap-x-24 text-center pt-10 sm:pt-24 text-white mb-12">
      <div className='flex justify-center items-center gap-4'>
        <p className="text-3xl sm:text-2xl xl:text-4xl font-bold">
          <CountUp
            end={27}
            duration={2.5}
            enableScrollSpy={true} 
            scrollSpyOnce={true}
            suffix="+"
          />
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl">Hotových výzev</p>
      </div>
      <div className='flex justify-center items-center gap-4'>
        <p className="text-3xl sm:text-2xl xl:text-4xl font-bold">
          <CountUp
            end={10}
            duration={2.5}
            enableScrollSpy={true}
            scrollSpyOnce={true}
            suffix="+"
          />
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl">Partnerských startupů</p>
      </div>

    </section>
  );
}