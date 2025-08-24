// src/app/register/student/page.tsx (nebo v komponentě pro 4. krok registrace)

"use client";
 
import SkillSelection from '../student/steps/SkillSelection'

export default function StudentRegistrationStep4() {
  // Rodičovská komponenta si drží stav vybraných dovedností.
  // Tyto hodnoty pak pošleš do databáze.

  return (
    <section className='w-full my-12'>
    <SkillSelection/>
    </section>
  );
}