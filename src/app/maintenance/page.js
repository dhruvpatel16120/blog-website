"use client";

import Script from 'next/script';
import Image from 'next/image';

export const dynamic = 'force-static';

export default function MaintenancePage() {
  const brand = process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Tech Blog';
  const primary = process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR || '#2563eb';
  // Prefer explicit public env, else fall back to local logo API at /logo
  const logo = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || '/logo';
  const contact = (process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com').replace(/^https?:\/\//, '');

  // Public maintenance animation JSON (use a permissive CDN). Poster ensures graceful fallback.
  const lottieJson = 'https://assets2.lottiefiles.com/packages/lf20_tll0j4bb.json';
  const fallbackImg = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=60';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black p-6">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="afterInteractive" />
      <div className="max-w-4xl w-full">
        <div className="flex items-center justify-center gap-3 mb-6">
          {logo ? (
            // Use img to avoid Next Image domain constraints for arbitrary logos
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={brand} className="h-8 w-8 rounded-md ring-1 ring-white/20 object-contain bg-white/5 p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="h-8 w-8 rounded-md ring-1 ring-white/20 flex items-center justify-center bg-white/5">
              <span className="text-white text-sm font-semibold">{brand.substring(0,1)}</span>
            </div>
          )}
          <span className="text-white/80 text-sm tracking-wide">{brand}</span>
        </div>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
            We&apos;re making things even better
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Our site is temporarily down for scheduled maintenance. We&apos;re working hard to bring everything back online as soon as possible.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
              <div className="absolute inset-0 hidden md:flex items-center justify-center">
                <lottie-player autoplay loop mode="normal" background="transparent" speed="1" src={lottieJson} style={{ width: '100%', height: '100%' }} />
              </div>
              <div className="absolute inset-0 md:hidden">
                <Image src={fallbackImg} alt="Maintenance illustration" fill sizes="100vw" className="object-cover" priority />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full" style={{ backgroundColor: primary + '22' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 p-1.5" style={{ color: primary }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">What&apos;s happening</p>
                  <p className="text-white/70 text-sm mt-1">We&apos;re upgrading infrastructure, improving performance, and rolling out enhancements.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full" style={{ backgroundColor: primary + '22' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 p-1.5" style={{ color: primary }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 1M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Estimated time</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-white/60 to-white animate-pulse" />
                  </div>
                  <p className="text-white/60 text-xs mt-2">Most services will be back shortly.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-8 w-8 rounded-full" style={{ backgroundColor: primary + '22' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 p-1.5" style={{ color: primary }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 2a9 9 0 1 1-9-9" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Need help?</p>
                  <p className="text-white/70 text-sm mt-1">Reach us at <a className="underline" href={`mailto:${contact}`}>{contact}</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm" style={{ backgroundColor: primary }}>
            Refresh
          </button>
          <a href="#" onClick={(e) => { e.preventDefault(); window.location.assign('/'); }} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white/80 ring-1 ring-white/15 hover:bg-white/5 transition">
            Go to homepage
          </a>
        </div>
      </div>
    </div>
  );
}

