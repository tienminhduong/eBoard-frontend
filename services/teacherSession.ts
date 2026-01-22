// src/services/teacherSession.ts
const KEY = "teacherId";

function getStorage() {
  if (typeof window === "undefined") return null;

  if (window.localStorage.getItem(KEY)) return window.localStorage;
  if (window.sessionStorage.getItem(KEY)) return window.sessionStorage;

  return null;
}

export const teacherSession = {
  setTeacherId(id: string, remember: boolean) {
    if (typeof window === "undefined") return;
    const store = remember ? window.localStorage : window.sessionStorage;
    store.setItem(KEY, id);
  },

  getTeacherId(): string | null {
    const store = getStorage();
    if (!store) return null;
    return store.getItem(KEY);
  },

  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(KEY);
  },
};
