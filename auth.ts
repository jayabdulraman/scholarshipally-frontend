import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import { getStringFromBuffer } from '@/lib/utils'
import { getUser } from '@/app/login/actions'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user_data = await getUser(email)

          if (!user_data) return null

          const server = process.env.BASE_URL;

          const body = JSON.stringify({
            "username": email,
            "password": password,
          });

          console.log("Body:", body)
          const apiRes = await fetch(`${server}/api/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: body,
          });
    
          const user = await apiRes.json();

          console.log("Data:", user)

          if (apiRes.status === 200) {
            return {
              id: user.user_id,
              name: user.fullname,
              email: user.email,
              token: user.token,
            };
            // return user
          } else {
            return null
          }
        }

        return null
      }
    })
  ]
})
