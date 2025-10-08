'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

function CallbackInner() {
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = search.get('code');
    const err  = search.get('error_description') || search.get('error');

    (async () => {
      try {
        if (err) {
          router.replace('/auth?error=' + encodeURIComponent(err));
          return;
        }
        if (code) {
          const sb = supabaseBrowser();
          await sb.auth.exchangeCodeForSession(code);
          router.replace('/app/qa');
          return;
        }
        router.replace('/auth');
      } catch {
        router.replace('/auth?error=callback_failed');
      }
    })();
  }, [search, router]);

  return <div className="p-6 text-sm text-slate-600">Signing you in…</div>;
}

export default function CallbackClient() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
