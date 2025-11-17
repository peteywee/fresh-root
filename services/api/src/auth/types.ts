// [P0][AUTH][CODE] Types
// Tags: P0, AUTH, CODE
export interface UserToken {
  uid: string;
  orgId: string;
  roles: string[];
}

export interface AuthContext {
  currentUser(): Promise<UserToken | null>;
  requireManager(): Promise<UserToken>;
}
