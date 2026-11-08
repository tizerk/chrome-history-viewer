// Apple Human Interface Guidelines: subtle, refined semantic tints
export function getDomainColor(_domain: string) {
  return {
    bg: 'bg-black/[0.04] dark:bg-white/[0.08]',
    text: 'text-[#1D1D1F] dark:text-[#E5E5EA]',
    border: 'border-black/[0.06] dark:border-white/[0.08]',
  };
}

export function getFaviconUrl(domain: string, existingFavicon?: string): string {
  if (existingFavicon && existingFavicon.startsWith('http')) {
    return existingFavicon;
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}
