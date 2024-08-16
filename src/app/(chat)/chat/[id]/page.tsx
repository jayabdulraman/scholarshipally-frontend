import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { ChatComponent } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { Chat, Session } from '@/lib/types'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session = await auth()

  if (!session?.user) {
    return {}
  }
  const chat = await getChat(params.id, session.user.id) as Chat

  return {
    title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = (await auth()) as unknown as Session
  const missingKeys = await getMissingKeys()

  if (!session?.user) {
    redirect(`/login?next=/chat/${params.id}`)
  }

  const userId = session.user.id as string
  const chat = await getChat(params.id, userId) as Chat

  if (!chat) {
    redirect('/')
  }

  if (String(chat?.userId) !== session?.user?.id) {
    notFound()
  }

  return (
    <AI initialAIState={{ chatId: chat.id, messages: chat.messages }}>
      <ChatComponent
        id={chat.id}
        session={session}
        initialMessages={chat.messages}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
