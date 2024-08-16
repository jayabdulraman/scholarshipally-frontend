'use server'

import { auth, signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { ResultCode } from '@/lib/utils'
import axios from 'axios';

export async function getUser(email: string) {
  const server = process.env.BASE_URL;

  const body = JSON.stringify({
    email
  });

  const headers = {
    'Content-Type': 'application/json',
  };
 
  const apiRes = await axios.post(`${server}/api/get-user/`, body, {
    headers
  });

  const user = apiRes.data;

  return user
}

interface Result {
  type: string
  resultCode: ResultCode
}

export async function authenticate(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  try {
    const email = formData.get('email')
    const password = formData.get('password')

    const parsedCredentials = z
      .object({
        email: z.string().email(),
        password: z.string().min(6)
      })
      .safeParse({
        email,
        password
      })

    if (parsedCredentials.success) {
      await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      return {
        type: 'success',
        resultCode: ResultCode.UserLoggedIn
      }
    } else {
      return {
        type: 'error',
        resultCode: ResultCode.InvalidCredentials
      }
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            type: 'error',
            resultCode: ResultCode.InvalidCredentials
          }
        default:
          return {
            type: 'error',
            resultCode: ResultCode.UnknownError
          }
      }
    }
  }
}
