import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    isVerified?: boolean;
    email?: string;
    name?: string;
    role?: string;
    otpVerified?: boolean;
    avatar?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      isVerified?: boolean;
      email?: string;
      name?: string;
      otpVerified?: boolean;
      role?: string;
      avatar?: string;
    };
  }

  // Add this interface extension
  interface Profile {
    picture?: string;
    image?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isVerified?: boolean;
    otpVerified?: boolean;
    role?: string;
    avatar?: string;
  }
}