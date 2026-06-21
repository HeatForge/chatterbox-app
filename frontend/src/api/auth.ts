import { api } from "./client";

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  displayName: string;
  password: string;
}

export const authApi = {
  me: () => api.get<AuthUser>("/api/auth/me"),
  login: (payload: LoginPayload) =>
    api.post<AuthUser>("/api/auth/login", payload),
  signup: (payload: SignupPayload) =>
    api.post<AuthUser>("/api/auth/signup", payload),
  logout: () => api.post<void>("/api/auth/logout", {}),
};
