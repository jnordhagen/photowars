declare module 'express-session' {
  interface SessionData {
    loggedIn: boolean,
    userId: string
  }
}

export {};
