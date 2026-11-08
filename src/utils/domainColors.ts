const BRAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'google.com': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'youtube.com': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  'reddit.com': { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  'github.com': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700' },
  'instagram.com': { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  'tiktok.com': { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  'twitter.com': { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
  'x.com': { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700' },
  'wikipedia.org': { bg: 'bg-stone-50 dark:bg-stone-900', text: 'text-stone-700 dark:text-stone-300', border: 'border-stone-200 dark:border-stone-700' },
  'nytimes.com': { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-800 dark:text-neutral-200', border: 'border-neutral-300 dark:border-neutral-700' },
  'arduino.cc': { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  'linkedin.com': { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'stackoverflow.com': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  'amazon.com': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-900 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-800' },
};

const PALETTE = [
  { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  { bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', text: 'text-fuchsia-700 dark:text-fuchsia-300', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
];

export function getDomainColor(domain: string) {
  const clean = domain.toLowerCase().replace(/^www\./, '');
  if (BRAND_COLORS[clean]) {
    return BRAND_COLORS[clean];
  }

  // Hash string to pick palette item
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export function getFaviconUrl(domain: string, existingFavicon?: string): string {
  if (existingFavicon && existingFavicon.startsWith('http')) {
    return existingFavicon;
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

