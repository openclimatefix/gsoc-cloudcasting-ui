import { jwtDecode } from 'jwt-decode';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface DecodedToken {
  exp: number;
}

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private tokenPromise: Promise<string> | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async getAccessToken(): Promise<string> {
    // If we're already fetching a token, return that promise
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // If we have a token that's not expired, return it
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Otherwise, fetch a new token
    this.tokenPromise = this.fetchNewToken();

    try {
      const token = await this.tokenPromise;
      return token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
      }

      const data: TokenResponse = await response.json();
      this.accessToken = data.access_token;

      // Set token expiry time from JWT or fallback to expires_in
      try {
        const decoded = jwtDecode<DecodedToken>(data.access_token);
        this.tokenExpiry = decoded.exp * 1000; // Convert to milliseconds
      } catch (e) {
        // If decoding fails, use expires_in from response
        this.tokenExpiry = Date.now() + data.expires_in * 1000;
      }

      return this.accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
