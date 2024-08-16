import type { NextAuthConfig, DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt';

/// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    name?: string | null;
    token?: string;
  }
}

// Extend the built-in JWT types
declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup'
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLoginPage = nextUrl.pathname.startsWith('/login')
      const isOnSignupPage = nextUrl.pathname.startsWith('/signup')

      if (isLoggedIn) {
        if (isOnLoginPage || isOnSignupPage) {
          return Response.redirect(new URL('/', nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.accessToken = user.token;
      }

      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id;
        session.user.name = token.name ?? undefined;
        session.accessToken = token.accessToken;
      }

      return session
    }
  },
  providers: []
} satisfies NextAuthConfig
