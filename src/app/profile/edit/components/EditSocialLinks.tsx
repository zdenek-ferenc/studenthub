"use client";

import { UseFormRegister } from 'react-hook-form';
import { Github, Linkedin, Dribbble, Link } from 'lucide-react';

const socialFields: {
  name: keyof SocialLinksForm;
  placeholder: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { name: 'linkedin_url', placeholder: 'https://linkedin.com/in/uzivatel', Icon: Linkedin, label: 'LinkedIn' },
  { name: 'github_url', placeholder: 'https://github.com/uzivatel', Icon: Github, label: 'GitHub' },
  { name: 'dribbble_url', placeholder: 'https://dribbble.com/uzivatel', Icon: Dribbble, label: 'Dribbble' },
  { name: 'personal_website_url', placeholder: 'https://mojestranky.cz', Icon: Link, label: 'Osobní web' },
];

type SocialLinksForm = {
  linkedin_url?: string;
  github_url?: string;
  dribbble_url?: string;
  personal_website_url?: string;
};

export default function EditSocialLinks({ register }: { register: UseFormRegister<SocialLinksForm> }) {
  return (
    <div className="space-y-4">
      {socialFields.map(({ name, placeholder, Icon, label }) => (
        <div key={name}>
          <label htmlFor={name} className="block mb-1 font-semibold text-gray-700">{label}</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Icon className="h-5 w-5 text-gray-400" />
            </span>
            <input 
              id={name}
              {...register(name)} 
              placeholder={placeholder}
              className="input !pl-10 !font-normal"
            />
          </div>
        </div>
      ))}
    </div>
  );
}