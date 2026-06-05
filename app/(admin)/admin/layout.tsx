import Link from 'next/link';
import { signOut } from '@/auth/actions';

const NAV_LINKS = [
  { href: '/admin/photos', label: 'Photos' },
  { href: '/admin/uploads', label: 'Upload' },
  { href: '/admin/albums', label: 'Albums' },
  { href: '/admin/tags', label: 'Tags' },
  { href: '/admin/storage', label: 'Storage' },
  { href: '/admin/configuration', label: 'Config' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b">
        <nav className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold text-sm">
              Admin
            </Link>
            <div className="flex gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto bg-[#f7f5f2]">
        {children}
      </main>
    </div>
  );
}
