'use client'
import React, { useState } from 'react';
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { UserMessage } from './templates/message'
import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { nanoid } from 'nanoid'
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Cookies from 'js-cookie';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react';
import { getCookie, setCookie } from 'typescript-cookie'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const [dailyLimit, setDailyRateLimit] = useState(0);
  const [tryAt, setTryAt] = useState<Date | null>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  React.useEffect(() => {
    const limit = getCookie("knownRequests")
    setDailyRateLimit(parseInt(limit || '0', 10))
    const inTenHours = new Date(Date.now() + 10 * 60 * 60 * 1000); // expire in 10 hours
    setTryAt(inTenHours)
  }, [])

  // Format the date to be more human-readable
  const formatDate = (date: Date | null) => {
    if (!date) return '';

    return date.toLocaleString('en-US', {
      weekday: 'short', // Mon, Tues, etc.
      year: 'numeric',
      month: 'short', // Jan, Feb, etc.
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // 12-hour format with AM/PM
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()
        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        // trim input
        const value = input.trim()
        setInput('')
        if (!value) return
        // implement input character limit && dailyRateLimit === 'false'
        // get cookie
        const dailyRateLimit = getCookie('knownRequests')
        if (value.length <= 150 && dailyLimit < 4) {
          // Optimistically add user message UI
          setMessages(currentMessages => [
            ...currentMessages,
            {
              id: uuidv4(),
              display: <UserMessage>{value}</UserMessage>
            }
          ])
  
          // Submit and get response message
          const responseMessage = await submitUserMessage(value)
          setMessages(currentMessages => [...currentMessages, responseMessage])
          // set rate limit
          const inTenHours = new Date(Date.now() + 10 * 60 * 60 * 1000); // expire in 10 hours
          // Convert the time to the user's local timezone and format it as a string
          console.log("Local time:", inTenHours)
          if (dailyRateLimit === undefined){
            setCookie('knownRequests', `${1}`, { expires: inTenHours, path: '/' })
            setDailyRateLimit(1)
            setTryAt(inTenHours)
          }
          else {
            const dailyLimit = parseInt(dailyRateLimit, 10)
            setCookie('knownRequests', `${dailyLimit+1}`, {expires: inTenHours, path: '/'})
            setDailyRateLimit(dailyLimit)
          }
          
        }
        else {
          if (value.length >= 150) {
            toast.error("Input should be less than 150 characters!")
          }
          else if (dailyLimit > 3) {
            toast.error(`Daily rate limit exceeded! You are out of free messages until: ${formatDate(tryAt)}`)
          }
          else {
            return
          }
        }
      }}
    >
        {dailyLimit > 3 ? (
          <Alert variant="destructive" className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Free Plan Limit </AlertTitle>
            <AlertDescription>
              You are out of free messages until: {formatDate(tryAt)}.
            </AlertDescription>
          </Alert>
        ) : (
          <>
          <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
                  onClick={() => {
                    router.push('/')
                  }}
                >
                  <IconPlus />
                  <span className="sr-only">New Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>New Chat</TooltipContent>
            </Tooltip>
            <Textarea
              ref={inputRef}
              tabIndex={0}
              onKeyDown={onKeyDown}
              placeholder="Send a message."
              className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              name="message"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)} 
              />
              <div className="absolute right-0 top-[13px] sm:right-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" size="icon" disabled={input === '' || input.length > 150 || dailyLimit > 3}>
                      <IconArrowElbow />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </>
        )}
    </form>
  )
}
