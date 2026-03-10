import type { AuthRequest, AuthResponse, OnboardingResponse } from "@shared/schema";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface ApiError {
  message: string;
  field?: string;
}

class AuthClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = "/login";
      }
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  }

  async signup(data: {
    username: string;
    password: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    activityLevel?: string;
    dietPreference?: string;
    gender?: string;
    healthIssues?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });

    this.setToken(response.token);
    return response;
  }

  async login(data: AuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    this.setToken(response.token);
    return response;
  }

  logout() {
    this.clearToken();
  }

  async generateOnboarding(): Promise<OnboardingResponse> {
    return this.request<OnboardingResponse>("/api/auth/generate-onboarding", {
      method: "POST",
    });
  }
}

export const authClient = new AuthClient();
