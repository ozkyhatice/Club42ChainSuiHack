/**
 * Registration feature types
 */

export interface RegistrationState {
  isRegistering: boolean;
  error: string;
  success: boolean;
}

export interface UserRegistrationData {
  intraId: number;
  username: string;
  email: string;
}

