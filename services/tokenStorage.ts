// src/services/token.storage.ts
import type { LoginResponseDto } from "./authService";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

function getStorage(remember: boolean) {
  return remember ? window.localStorage : window.sessionStorage;
}

export const tokenStorage = {
  save(tokens: LoginResponseDto, remember: boolean) {
    // nếu đổi remember, dọn cả 2 nơi cho sạch
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.sessionStorage.removeItem(ACCESS_KEY);
    window.sessionStorage.removeItem(REFRESH_KEY);

    const storage = getStorage(remember);
    storage.setItem(ACCESS_KEY, tokens.accessToken);
    storage.setItem(REFRESH_KEY, tokens.refreshToken);
  },

  getAccessToken() {
    return (
      window.localStorage.getItem(ACCESS_KEY) ||
      window.sessionStorage.getItem(ACCESS_KEY)
    );
  },

  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    window.sessionStorage.removeItem(ACCESS_KEY);
    window.sessionStorage.removeItem(REFRESH_KEY);
  },
};
