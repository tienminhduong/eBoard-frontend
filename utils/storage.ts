function getExact(key: string): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(key) || localStorage.getItem(key) || "";
}

function getByPrefix(prefix: string): string {
  if (typeof window === "undefined") return "";

  // Ưu tiên sessionStorage trước
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k && k.startsWith(prefix + "_")) {
      const v = sessionStorage.getItem(k);
      if (v) return v;
    }
  }

  // Fallback localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix + "_")) {
      const v = localStorage.getItem(k);
      if (v) return v;
    }
  }

  return "";
}

/**
 * Lấy value theo key:
 * - Nếu có key exact -> lấy exact
 * - Nếu không có -> tìm key dạng prefix_<something>
 */
export function getFromStorage(keyOrPrefix: string): string {
  const exact = getExact(keyOrPrefix);
  if (exact) return exact;

  // nếu không có exact, thử theo prefix
  return getByPrefix(keyOrPrefix);
}
