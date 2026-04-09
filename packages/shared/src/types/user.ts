export interface User {
  id: string;
  email: string;
  creditBalance: number;
  tosAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
}
