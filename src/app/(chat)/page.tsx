import { v4 as uuidv4 } from 'uuid';
import { ChatComponent } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { getMissingKeys } from '@/app/actions'

export const metadata = {
  title: 'ScholarshipAlly'
}

export default async function IndexPage() {
  const id = uuidv4();
  
  const session = (await auth()) as unknown as Session
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <ChatComponent id={id} session={session} missingKeys={missingKeys}/>
    </AI>
  )
}
