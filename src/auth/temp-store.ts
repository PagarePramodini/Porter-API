export type TempSession = {
  userType: 'owner' | 'customer' | 'driver';
  createdAt: number;
  expiresAt: number;
  payload: any;     // full registration payload (dto + document filenames)
  otpHash: string;  // sha256 hash of otp
  attempts: number; // verification attempts
};

const STORE = new Map<string, TempSession>();

export function setSession(id: string, session: TempSession) {
  STORE.set(id, session);
}

export function getSession(id: string): TempSession | undefined {
  return STORE.get(id);
}

export function deleteSession(id: string) {
  STORE.delete(id);
}
