/**
 * Authentication types for 42 OAuth integration
 */

export interface User42 {
  id: number;
  login: string;
  email: string;
  intraId: number;
}

export interface AuthSession {
  user: User42;
  expires: string;
}

