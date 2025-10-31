export type UserToken = {
  uid: string;
  orgId: string;
  roles: string[];
};

export interface AuthContext {
  currentUser(): Promise<UserToken | null>;
  requireManager(): Promise<UserToken>;
}
