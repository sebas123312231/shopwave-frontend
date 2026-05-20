export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
}

export interface JwtPayload {
  username: string;
  authorities: string;
  iat: number;
  exp: number;
  iss: string;
  sub: string;
}