'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/leads', label: 'Leads' },
  { href: '/customers', label: 'Customers' },
  { href: '/estimates', label: 'Estimates' },
  { href: '/contracts', label: 'Contracts' }
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<{ email?: string; name?: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(async response => (response.ok ? response.json() : null))
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav className="grid gap-1">
        {LINKS.map(link => {
          const active =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium',
                active
                  ? 'border-l-4 border-primary bg-primary/10 text-primary'
                  : 'text-foreground hover:text-primary'
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 shadow-md backdrop-blur">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant="ghost" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center">
            <Image
              src="/header-logo.webp"
              alt="Mr Demo Pro"
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {me?.email ? <span className="hidden text-muted sm:inline">{me.name || me.email}</span> : null}
          <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </header>
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-r border-border bg-white p-4 md:block">
          <NavLinks />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
