"use client";
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, ReactNode } from 'react';
import { Provider } from '@supabase/supabase-js';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';


const SocialButton = ({ provider, label, icon }: { provider: Provider, label: string, icon: ReactNode }) => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
  };

  return (
    <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      {icon}
      <span className="font-semibold text-gray-600 text-sm">{label}</span>
    </button>
  );
};

const ImageSlideshow = () => {
  const images = ['/login.png', '/login2.png'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); 
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt="Student a inovace"
          width={400}
          height={500}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        priority
        quality={100}/>
      ))}
    </div>
  );
};


export default function LoginView() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return; 
    if (user && profile) {
      if (profile.role === 'student') {
        router.replace('/dashboard');
      } else if (profile.role === 'startup') {
        router.replace('/challenges');
      } else {
        router.replace('/');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Neplatné přihlašovací údaje.");
      setLoading(false);
    } else {
      router.push('/challenges');
    }
  };

  if (authLoading || user) {
    return (
      <div className="w-full min-h-screen py-10 md:py-32 flex items-center justify-center bg-white sm:bg-[var(--barva-svetle-pozadi)] p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-10 md:py-32 flex items-start justify-center bg-white sm:bg-[var(--barva-svetle-pozadi)] p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 sm:bg-white rounded-2xl sm:shadow-sm md:border-2 md:border-gray-100 overflow-hidden">
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl font-bold text-[var(--barva-primarni)] sm:text-[var(--barva-tmava)]">Vítej zpět!</h1>
            <p className="text-gray-500 mt-4 texxt-sm">Zadej své přihlašovací údaje</p>
          </div>

          <form onSubmit={handleEmailLogin} className="mt-8 space-y-5">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input2 w-full pl-10" />
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input type="password" placeholder="Heslo" value={password} onChange={(e) => setPassword(e.target.value)} required className="input2 w-full pl-10" />
            </div>
            <div className='flex justify-center'>
              <button type="submit" disabled={loading} className="px-6 py-2 rounded-full bg-[var(--barva-primarni)] text-white cursor-pointer hover:bg-[#0069ccde] transition-all duration-300 ease-in-out">
              {loading ? 'Přihlašuji...' : 'Přihlásit se'}
              </button>
            </div>
            
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Nebo se přihlas s</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between ">
              <SocialButton provider="google" label="Google" icon={<svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.151,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>} />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          <p className="text-center text-sm text-gray-600 mt-8">
            Ještě nemáš účet?{' '}
            <Link href="/register/student" className="font-semibold text-[var(--barva-primarni)] hover:underline">
              Zaregistruj se
            </Link>
          </p>
        </div>
        <div className=" bg-[var(--barva-primarni)] relative">
            <ImageSlideshow />
        </div>
      </div>
    </div>
  );
}
