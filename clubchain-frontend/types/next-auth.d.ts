import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      intraId: number;
      login: string;
    };
  }

  interface User {
    intraId: number;
    login: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    intraId: number;
    login: string;
  }
}

