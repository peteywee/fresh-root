// Minimal ambient types to satisfy tests without pulling full admin types into the app build
// NOTE: Runtime uses the real firebase-admin package; this file is only for TypeScript.

declare namespace admin {
  namespace app {
    interface App {
      delete(): Promise<void>;
    }
  }

  const apps: app.App[];
  function initializeApp(options?: any): app.App;
  function app(name?: string): app.App;

  // Auth namespace and function for convenience
  namespace authNS {
    function deleteUser(uid: string): Promise<void>;
    function createUser(data: any): Promise<any>;
  }
  function auth(): typeof authNS;
}

declare module "firebase-admin" {
  export = admin;
}

// Keep these modules loosely typed for non-test usage
declare module "firebase-admin/auth" {
  const auth: any;
  export = auth;
}

declare module "firebase-admin/firestore" {
  const firestore: any;
  export = firestore;
}
