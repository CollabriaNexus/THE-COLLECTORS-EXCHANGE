const TABLET_RE = /iPad|Tablet|PlayBook|Silk|Kindle|(Android(?!.*Mobile))/i;
const MOBILE_RE = /Mobi|iPh(one|ad)|iPod|Windows Phone|IEMobile|Opera Mini/i;

export function parseDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = String(userAgent);
  if (TABLET_RE.test(ua)) return 'tablet';
  if (MOBILE_RE.test(ua)) return 'mobile';
  if (/bot|crawler|spider|crawling|preview|slurp|facebookexternalhit/i.test(ua)) return 'bot';
  return 'desktop';
}

export function parseOs(userAgent) {
  if (!userAgent) return 'Unknown';
  const ua = String(userAgent);
  let match;
  if ((match = ua.match(/Windows NT ([\d.]+)/))) {
    const v = match[1];
    if (v.startsWith('10') || v.startsWith('11')) return 'Windows 10/11';
    if (v.startsWith('6.3')) return 'Windows 8.1';
    if (v.startsWith('6.2')) return 'Windows 8';
    if (v.startsWith('6.1')) return 'Windows 7';
    return 'Windows';
  }
  if (/iPhone|iPad|iPod/.test(ua)) {
    const v = ua.match(/OS (\d+[_\d]*)/);
    return v ? `iOS ${v[1].replace(/_/g, '.')}` : 'iOS';
  }
  if ((match = ua.match(/Android ([\d.]+)/))) return `Android ${match[1].split('.')[0]}`;
  if (/Mac OS X|Macintosh/.test(ua)) {
    const v = ua.match(/Mac OS X ([\d_]+)/);
    return v ? `macOS ${v[1].replace(/_/g, '.').split('.').slice(0, 2).join('.')}` : 'macOS';
  }
  if (/CrOS/.test(ua)) return 'ChromeOS';
  if (/Ubuntu/.test(ua)) return 'Ubuntu';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

export function parseBrowser(userAgent) {
  if (!userAgent) return 'Unknown';
  const ua = String(userAgent);
  if (/Edg(A|iOS)?\//.test(ua)) {
    const v = ua.match(/Edg(?:A|iOS)?\/([\d.]+)/);
    return v ? `Edge ${v[1].split('.')[0]}` : 'Edge';
  }
  if (/SamsungBrowser\//.test(ua)) {
    const v = ua.match(/SamsungBrowser\/([\d.]+)/);
    return v ? `Samsung Internet ${v[1].split('.')[0]}` : 'Samsung Internet';
  }
  if (/OPR\/|Opera/.test(ua)) {
    const v = ua.match(/(?:OPR|Opera)[/ ]([\d.]+)/);
    return v ? `Opera ${v[1].split('.')[0]}` : 'Opera';
  }
  if (/Firefox\/|FxiOS/.test(ua)) {
    const v = ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/);
    return v ? `Firefox ${v[1].split('.')[0]}` : 'Firefox';
  }
  // Chrome must be tested before Safari: Chrome UAs also contain "Safari/"
  if (/Chrome\/|CriOS/.test(ua)) {
    const v = ua.match(/(?:Chrome|CriOS)\/([\d.]+)/);
    return v ? `Chrome ${v[1].split('.')[0]}` : 'Chrome';
  }
  if (/Safari\//.test(ua)) {
    const v = ua.match(/Version\/([\d.]+)/);
    return v ? `Safari ${v[1].split('.')[0]}` : 'Safari';
  }
  return 'Other';
}
