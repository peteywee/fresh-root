// [P0][AUTH][CODE] Types
// Tags: P0, AUTH, CODE

/**
 * @description Represents the decoded user token containing authentication and authorization information.
 */
export type UserToken = {
  /**
   * @description The unique identifier for the user.
   */
  uid: string;
  /**
   * @description The identifier of the organization the user belongs to.
   */
  orgId: string;
  /**
   * @description A list of roles assigned to the user.
   */
  roles: string[];
};

/**
 * @description Defines the contract for the authentication context, providing methods to access user information.
 */
export interface AuthContext {
  /**
   * @description Retrieves the current user's token.
   * @returns {Promise<UserToken | null>} A promise that resolves with the user token, or null if the user is not authenticated.
   */
  currentUser(): Promise<UserToken | null>;
  /**
   * @description Requires the current user to be a manager and retrieves their token.
   * Throws an error if the user is not a manager or is not authenticated.
   * @returns {Promise<UserToken>} A promise that resolves with the user token.
   */
  requireManager(): Promise<UserToken>;
}
