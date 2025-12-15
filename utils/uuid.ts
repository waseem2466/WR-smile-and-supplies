export function uuid(): string {
  // Use native randomUUID when available
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      // @ts-ignore
      return (crypto as any).randomUUID();
    }
  } catch (e) {
    // ignore
  }

  // Fallback to crypto.getRandomValues-based UUID v4
  if (typeof crypto !== 'undefined' && typeof (crypto as any).getRandomValues === 'function') {
    const buf = new Uint8Array(16);
    (crypto as any).getRandomValues(buf);
    // Per RFC4122 v4
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substr(0,8)}-${hex.substr(8,4)}-${hex.substr(12,4)}-${hex.substr(16,4)}-${hex.substr(20,12)}`;
  }

  // Fallback to Math.random (not cryptographically secure)
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}
