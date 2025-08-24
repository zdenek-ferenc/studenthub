import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 flex justify-between items-center py-5">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          StudentHub
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/challenges" className="text-gray-600 hover:text-blue-600">Výzvy</Link>
          <Link href="/#pro-studenty" className="text-gray-600 hover:text-blue-600">Pro studenty</Link>
          <Link href="/#pro-startupy" className="text-gray-600 hover:text-blue-600">Pro startupy</Link>
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          <Link href="/login" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">Přihlásit se</Link>
          <Link href="/register" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Registrovat</Link>
        </div>
      </div>
    </header>
  );
}