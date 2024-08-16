import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'
import { Session } from '@/lib/types'
import Link from 'next/link'

export interface EmptySession {
  session?: Session
}
export function EmptyScreen({ session }: EmptySession) {
  return (
    <div className="mx-auto max-w-2xl px-2 mt-8">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg text-center font-semibold">
          Welcome to Scholar Chatbot!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Scholar 🤖 is an assistant that matches prospective students with the right funding opportunities 💵🛫🎓, thereby increasing your chances of success. 
          Scholar can search the internet or our database of up to 1000 scholarships to get the scholarship you need, provide admission and application guidance or even point you where to start.
        </p>
        {!session?.user ? (
          <p className="leading-normal text-muted-foreground">
            To get started,  <Button variant="link" asChild className="-ml-2"><Link href="/signup" rel="nofollow">create an account</Link></Button> or <Button variant="link" asChild className="-ml-2"><Link href="/login" rel="nofollow">login</Link></Button>
          </p>
        ): (null)}
        <p className="leading-normal text-muted-foreground">
          All the best 👍🏽!
        </p>
      </div>
    </div>
  )
}
