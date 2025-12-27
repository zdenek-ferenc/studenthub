"use client";

import StudentCard from '../StudentCard'; 
import { mockStudentData1, mockStudentData2 } from './mock-data';
import { Search } from 'lucide-react';

export default function DemoTalentView() {
  return (
    <div className="pb-2 py-2 pt-0 lg:p-4 rounded-lg sm:max-h-[500px] overflow-y-auto custom-scrollbar">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Hledat podle dovedností ..."
          className="w-full pl-8 sm:pl-10 pr-4 py-2 text-sm sm:text-base sm:py-3 rounded-full border border-gray-300 bg-gray-50"
          disabled
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StudentCard 
          student={mockStudentData1}
          customHref="/register"
        />
        <div className='hidden md:block'>
          <StudentCard 
            student={mockStudentData2}
            customHref="/register"
          />
        </div>
        
      </div>
    </div>
  );
}