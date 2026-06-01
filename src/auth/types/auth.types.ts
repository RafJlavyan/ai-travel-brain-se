import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password' | 'refreshToken'>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface JwtPayloadWithRefresh extends JwtPayload {
  refreshToken: string;
}
