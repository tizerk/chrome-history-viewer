// Apple Human Interface Guidelines: subtle, refined semantic tints
export function getDomainColor(_domain: string) {
  return {
    bg: 'bg-black/[0.04] dark:bg-white/[0.08]',
    text: 'text-[#1D1D1F] dark:text-[#E5E5EA]',
    border: 'border-black/[0.06] dark:border-white/[0.08]',
  };
}

export function isLocalOrPrivateHost(host: string): boolean {
  if (!host) return true;
  const cleanHost = host.toLowerCase().split(':')[0].trim();

  // localhost, loopback, special internal TLDs
  if (
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost === '0.0.0.0' ||
    cleanHost === '::1' ||
    cleanHost === 'other' ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.internal') ||
    cleanHost.endsWith('.lan') ||
    cleanHost.endsWith('.home') ||
    cleanHost.endsWith('.corp') ||
    cleanHost.endsWith('.test') ||
    cleanHost.endsWith('.example') ||
    cleanHost.endsWith('.invalid')
  ) {
    return true;
  }

  // IPv4 private ranges (RFC 1918 + loopback + link-local)
  if (/^127\./.test(cleanHost)) return true;
  if (/^10\./.test(cleanHost)) return true;
  if (/^192\.168\./.test(cleanHost)) return true;
  if (/^169\.254\./.test(cleanHost)) return true;
  const match172 = cleanHost.match(/^172\.(\d+)\./);
  if (match172) {
    const octet = parseInt(match172[1], 10);
    if (octet >= 16 && octet <= 31) return true;
  }

  // Pure single-word hostnames without dot (e.g. router, nas, server)
  if (!cleanHost.includes('.')) {
    return true;
  }

  return false;
}

export function getFaviconUrl(domain: string, existingFavicon?: string): string {
  // If the domain is local/private/intranet, NEVER attempt any local or network request
  if (isLocalOrPrivateHost(domain)) {
    return '';
  }

  // If existingFavicon is provided, ONLY allow it if it's HTTPS and targeting a public domain
  if (existingFavicon && existingFavicon.startsWith('https://')) {
    try {
      const parsed = new URL(existingFavicon);
      if (!isLocalOrPrivateHost(parsed.hostname)) {
        return existingFavicon;
      }
    } catch {
      // invalid URL
    }
  }

  // Safe public Google favicon CDN lookup over HTTPS
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}
