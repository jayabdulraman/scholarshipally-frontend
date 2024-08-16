import 'server-only'
import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  streamUI,
  createStreamableValue
} from 'ai/rsc'
import { openai } from '@ai-sdk/openai'
import {
  spinner,
  BotCard,
  BotMessage,
  SystemMessage,
  InternetMessage,
} from '@/components/templates'
import { z } from 'zod'
import { EventsSkeleton } from '@/components/templates/events-skeleton'
import { Events } from '@/components/templates/events'
import {
  formatNumber,
  runAsyncFnWithoutBlocking,
  sleep,
  nanoid
} from '@/lib/utils'
import { SpinnerMessage, UserMessage } from '@/components/templates/message'
import { Chat, Message, BingResults, ContentWithSource } from '@/lib/types'
import { auth } from '@/auth'
import {QdrantClient} from '@qdrant/js-client-rest';
import { embed } from 'ai';
import { v4 as uuidv4 } from 'uuid';
import { saveChat, getSearchResultsFromMemory } from '@/app/actions'
import { WebReferences } from '@/components/templates/web-references';
import { SkeletonCard } from '@/components/templates/web-references-skeleton';
import { cookies } from "next/headers";
import { generateText } from 'ai';
// import { extract } from '@extractus/article-extractor';

const client = new QdrantClient({ host: "localhost", port: 6333 });

// Helper function to safely access nested properties
function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  // @ts-ignore
  return obj && obj[key];
}

async function submitUserMessage(content: string) {
  'use server'

  const aiState = getMutableAIState<typeof AI>()

  const cookieStore = cookies(); 
  const searchType = cookieStore.get('newSearchType')?.value;
  console.log("Search Type:", searchType)

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: uuidv4(),
        role: 'user',
        content,
        metadata: null,
        searchType: searchType, 
      }
    ]
  })

  // define function to refine query
  async function queryRefiner(query: string, conversation: any) {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        { role: "system", content: "You are a question formulator or refiner." },
        { role: "user", content: `Given the following user query and conversation log, formulate a question that would be the most relevant to provide the user with an answer from a knowledge base.\n\nCONVERSATION LOG: \n${conversation}\n\nQuery: ${query}\n\nRefined Query:` }
      ],
    })
    return text
  };
  
  // INTERNET SEARCH (GOOGLE SEARCH)
  if (searchType && searchType === "GoogleSearch") {
    const chatMemory = aiState.get().messages.map((message) => `{'role': ${message.role}, 'content': ${message.content}}\n`)
    console.log("AI State:", aiState.get().messages)
    // refined query
    const refinedQuery = await queryRefiner(content,  chatMemory)
    console.log("REFINED QUERY:", refinedQuery)
    // get search
    const searchData = await getSearchResultsFromMemory(refinedQuery);
    //console.log("Search Data:", searchData?.web.results)
    // function to fetch page contents to feed as context
    async function fetchPageContent(url: string): Promise<string> {
      const article = ""//await extract(url);
      return article //article?.content || '';
    }
    // get content
    const contentWithSources: ContentWithSource[] = [];
    {/* @ts-ignore */}
    for (const result of searchData?.web.results.slice(0, 2)) {
      try {
        const content = await fetchPageContent(result.url)
        contentWithSources.push({
          content,
          source: result
        });
      } catch (error) {
        console.error(`Error fetching content from ${result.url}:`, error);
      }
    }
    console.log("CONTENT:", contentWithSources);
    let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
    let textNode: undefined | React.ReactNode
    // declare UI
    const result = await streamUI({
      model: openai('gpt-4o-mini'),
      initial: <SpinnerMessage />,
      system: `\
      You are a search assistant that answers the user query based on search results and generates UI to display sources.
      Search Result: ${contentWithSources.map((result: {content: string}) => 
        `${result.content}\nn`).join(' ')}
      Instructions:
      - Respond with Top 5 results.
      - Always respond with provided Search Result above! Do not use your training knowledge! 
      - Do NOT add sources or references or resources or links or URLs in your response!
      - Do NOT hallucinate or make up stuff!`,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          console.log("LOGGING FROM GOOGLE SEARCH!")
          textNode = <BotCard> <WebReferences props={searchData} /> <InternetMessage content={textStream.value}/> </BotCard>
        }
  
        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: uuidv4(),
                role: 'assistant',
                content,
                metadata: searchData,
                searchType: searchType,
              }
            ]
          })
        } else {
          textStream.update(delta)
        }
        //console.log("TEXT NODE:", textNode)
        return textNode
      },
    })
  
    return {
      id: uuidv4(),
      display: result.value
    }
  }
  // RAG FROM VECTOR STORE (DATABASE SEARCH)
  else if (searchType && searchType === "DatabaseSearch") {
    // get embedding
  // 'embedding' is a single embedding object (number[])
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: content,
  });

  // // query vector store
  let searchResult = await client.search("funding_store", {
    vector: embedding,
    limit: 3,
    params: {
      quantization: {
        ignore: false,
        rescore: true,
        oversampling: 2.0,
      },
    },
  });

  // // strip result
  const context = searchResult.map(search => ({
    name: safeGet(search.payload, 'name'),
    description: safeGet(search.payload, 'text'),
    deadline: safeGet(search.payload, 'deadline'),
    source: safeGet(search.payload, 'official_scholarship_website')
  }));

  // // Format the context into a string representation
  const formattedContext = context.map((scholarship, index) => {
    return `\n
    {"name": "${scholarship.name}",\n
      "description": "${scholarship.description}",\n
      "deadline": "${scholarship.deadline}",\n
      "source": "${scholarship.source}"
    }\n`}).join('\n');
  
  //console.log("DATABASE CONTEXT:", formattedContext)
  let textStream: undefined | ReturnType<typeof createStreamableValue<string>>
  let textNode: undefined | React.ReactNode
  
  const result = await streamUI({
      model: openai('gpt-4o-mini'),
      initial: <SpinnerMessage />,
      system: `\
      You are a helpful and friendly scholarship assistant. Your goal is to provide accurate and relevant information about scholarships to students using the Instructions and Context below.\n
      
      Context: ${formattedContext}\n

      INSTRUCTIONS:
        - Use the Context provided above to answer the user's question.\n
        - When there is Context provided, do NOT say "Sorry! you don't have information beyond the context". Just CALL the \`getScholarships\` tool.
        - if user is asking about scholarships, call \`getScholarships\` tool and pass the context as list of dictionaries to generate a a UI response.\n
        - ONLY use your training knowledge to provide tips and guidance about admissions and writing personal statements.\n
        - If there is no Context above, politely respond you have no further knowledge. Do not hallucinate or use your training knowledge!`,
      messages: [
        ...aiState.get().messages.map((message: any) => ({
          role: message.role,
          content: message.content,
          name: message.name
        }))
      ],
      text: ({ content, done, delta }) => {
        if (!textStream) {
          textStream = createStreamableValue('')
          textNode = <BotMessage content={textStream.value} />
        }
  
        if (done) {
          textStream.done()
          aiState.done({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: uuidv4(),
                role: 'assistant',
                content,
                metadata: null,
                searchType: searchType,
              }
            ]
          })
        } else {
          textStream.update(delta)
        }
  
        return textNode
      },
      tools: {
        getScholarships: {
          description: 'List three scholarships returned from the context.',
          parameters: z.object({
            scholarships: z.array(
              z.object({
                name: z.string().describe('The name of the scholarship'),
                description: z.string().describe('The description of the scholarship'),
                deadline: z.string().describe('The deadline of the scholarship, in format as it is'),
                source: z.string().describe('The official website of the scholarship')
              })
            )
          }),
          generate: async function* ({ scholarships }) {
            yield (
              <BotCard>
                <EventsSkeleton />
              </BotCard>
            )
  
            await sleep(1000)
  
            const toolCallId = uuidv4()
  
            aiState.done({
              ...aiState.get(),
              messages: [
                ...aiState.get().messages,
                {
                  id: uuidv4(),
                  role: 'assistant',
                  content: [
                    {
                      type: 'tool-call',
                      toolName: 'getScholarships',
                      toolCallId,
                      args: { scholarships }
                    }
                  ],
                  metadata: null,
                  searchType: searchType,
                },
                {
                  id: uuidv4(),
                  role: 'tool',
                  content: [
                    {
                      type: 'tool-result',
                      toolName: 'getScholarships',
                      toolCallId,
                      result: scholarships
                    }
                  ],
                  metadata: null,
                  searchType: searchType,
                }
              ]
            })
  
            return (
              <BotCard>
                <Events props={scholarships} />
              </BotCard>
            )
          }
        },
      }
    })
      
    return {
      id: uuidv4(),
      display: result.value
    }
  }
}

export type AIState = {
  chatId: string
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    //confirmPurchase,
  },
  initialUIState: [],
  initialAIState: { chatId: uuidv4(), messages: [] },
  onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState() as Chat

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`

      const firstMessageContent = messages[0].content as string
      const title = firstMessageContent.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  //console.log("AI STATE:", aiState.messages)
  //aiState.messages.map((message, index) => console.log("MESSAGES:", typeof aiState.messages))
  return aiState.messages
    .filter(message => message.role !== 'system')
    .map((message, index) => ({
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map(tool => {
            //console.log("TOOL:", tool.result)
            console.log("TYPE:", typeof aiState.messages)
           return tool.toolName === 'getScholarships' ? (
              <BotCard>
                {/* TODO: Infer types based on the tool result*/}
                {/* @ts-ignore */}
                <Events props={tool.result} />
              </BotCard>
           ) : null 
         })
        ) : message.role === 'user' ? (
          <UserMessage>{message.content as string}</UserMessage>
        ) : message.role === 'assistant' ? ( 
          message.searchType === "DatabaseSearch" &&
          typeof message.content === 'string' ? (
          <BotMessage content={message.content} />
        ) : message.searchType === "GoogleSearch" &&
        typeof message.content === 'string' ? (
          console.log("LOG FROM SEARCH"),
          <BotCard> <WebReferences props={message.metadata} /> <InternetMessage content={message.content}/> </BotCard>
        ): null ) : null
    }))
}
