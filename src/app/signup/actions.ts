'use server'

import { signIn } from '@/auth'
import { ResultCode } from '@/lib/utils'
import { z } from 'zod'
import { getUser } from '../login/actions'
import { AuthError } from 'next-auth'
import axios from 'axios'

export async function createUser(
  fullname: string,
  email: string,
  password: string,
) {
  console.log("Fullname:", fullname)
  const existingUser = await getUser(email)
  console.log("Existing User:", existingUser)

  if (existingUser) {
    return {
      type: 'error',
      resultCode: ResultCode.UserAlreadyExists
    }
  } else {
    const body = JSON.stringify({
      fullname: fullname,
      email: email,
      password: password,
    });
    const server = process.env.BASE_URL;

    const headers = {
      'Content-Type': 'application/json',
    };

    await axios.post(`${server}/api/register/`, body, {headers});

    console.log("Server URL:", server);

    return {
      type: 'success',
      resultCode: ResultCode.UserCreated
    } 
  }
}

interface Result {
  type: string
  resultCode: ResultCode
}

export async function signup(
  _prevState: Result | undefined,
  formData: FormData
): Promise<Result | undefined> {
  const fullname = formData.get('fullname') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const parsedCredentials = z
    .object({
      fullname: z.string(),
      email: z.string().email(),
      password: z.string().min(6)
    })
    .safeParse({
      fullname,
      email,
      password
    })

  if (parsedCredentials.success) {
    try {
      const result = await createUser(fullname, email, password);

      if (result.resultCode === ResultCode.UserCreated) {
        await signIn('credentials', {
          email,
          password,
          redirect: false
        })
      }

      return result
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
      } else {
        return {
          type: 'error',
          resultCode: ResultCode.UnknownError
        }
      }
    }
  } else {
    return {
      type: 'error',
      resultCode: ResultCode.InvalidCredentials
    }
  }
}
