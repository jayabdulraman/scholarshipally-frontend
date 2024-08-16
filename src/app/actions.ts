'use server'

import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { type Chat, BingResults, Scholarship } from '@/lib/types'
import path from 'path'
import axios from 'axios'
import { cookies } from "next/headers";

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const server = process.env.BASE_URL;
    const session = await auth()
    const token = session?.accessToken;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    };

    //console.log("LOG USER FOR CHATS:", typeof(userId))
    const res = await axios.get<Chat[]>(`${server}/api/user-threads/${userId}/`, { headers, maxContentLength: Infinity,
      maxBodyLength: Infinity });

    const results = res.data
    // Sort the chats by createdAt in descending order
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    //console.log("GET ALL CHATS:",results)
    return results
  } catch (error) {
    return error
  }
}

export async function getChat(id: string, userId: string) {
  try {
    const server = process.env.BASE_URL;
    const session = await auth()
    const token = session?.accessToken;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    };

    const res = await axios.get<Chat>(`${server}/api/thread/${id}/`, { headers, maxContentLength: Infinity,
      maxBodyLength: Infinity });

    const chat = res.data

    //console.log("GET CHAT:",chat)
    // const chat = await kv.hgetall<Chat>(`chat:${id}`)
    // console.log("Get Threads:", chat)
    //const UserId = parseInt(userId)
    if (!chat || (userId && String(chat.userId) !== userId)) {
      console.log('NOT RETURNING CHAT!', userId, chat.userId)
      return null
    }

    return chat
  }
  catch (error) {
    if (error === 404) {
      return notFound;
    }
    else {
      return []
    }
  }
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()
  const server = process.env.BASE_URL;
  const token = session?.accessToken;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  // const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  const res = await axios.delete(`${server}/api/delete-thread/${id}/`, { headers, maxContentLength: Infinity,
    maxBodyLength: Infinity });

  if (res.status === 401) {
    return {
      error: 'Unauthorized'
    }
  }
  else if (res.status === 404) {
    return {
      error: res.statusText
    }
  }
  else if (res.status === 500) {
    return {
      error: res.statusText
    }
  }

  // await kv.del(`chat:${id}`)
  // await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

// export async function clearChats() {
//   const session = await auth()

//   if (!session?.user?.id) {
//     return {
//       error: 'Unauthorized'
//     }
//   }

//   const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
//   if (!chats.length) {
//     return redirect('/')
//   }
//   const pipeline = kv.pipeline()

//   for (const chat of chats) {
//     pipeline.del(chat)
//     pipeline.zrem(`user:chat:${session.user.id}`, chat)
//   }

//   await pipeline.exec()

//   revalidatePath('/')
//   return redirect('/')
// }

export async function getSharedChat(id: string) {
  try {
    const server = process.env.BASE_URL;

    const headers = {
      'Content-Type': 'application/json',
    };

    const res = await fetch(`${server}/api/shared-thread/${id}/`, { headers });

    const chat = res.json()
    //console.log("SHARED CHAT:", chat)

    if (!chat) {
      return null
    }
  
    return chat
  }
  catch (error) {
    return []
  }
}

export async function shareChat(id: string) {
  const session = await auth()

  try {
    console.log("Session:", session?.user?.id)
    if (!session?.user?.id) {
      return {
        error: 'Unauthorized!'
      }
    }

    const chat = await getSharedChat(id) as Chat

    //const chat = await kv.hgetall<Chat>(`chat:${id}`)
    console.log("User IDs:", String(chat.userId), session.user.id)

    if (!chat || String(chat.userId) !== session.user.id) {
      return {
        error: 'Something went wrong here!'
      }
    }

    const payload = {
      ...chat,
      sharePath: `/share/${chat.id}`
    }

    //await kv.hmset(`chat:${chat[0].id}`, payload)

    return payload
  }
  catch (error) {
    return {
      error: "Unauthorized"
    }
  }
}

export async function rateLimit() {
  const session = await auth()
  const server = process.env.BASE_URL;
  const token = session?.accessToken;
  
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`
  };
  const response = await axios.get(`${server}/api/rate-limited/`, { headers });
  // Get rate limit information from headers
  const limit = response.headers['x-ratelimit-limit'];
  const remaining = response.headers['x-ratelimit-remaining'];
  const reset = response.headers['x-ratelimit-reset'];
  // Calculate expiration time
  const expirationTime = new Date(Date.now() + parseInt(reset) * 1000);
      
  // Set cookie based on rate limit status
  const cookieValue = remaining > 0 ? 'unlimited' : 'limited';
  const cookieStore = cookies(); 
  cookieStore.set('knownRequests', cookieValue, {
    httpOnly: false, // Ensures the cookie is only accessible via HTTP, not JavaScript
    path: '/', // Ensure the cookie is accessible across your entire site
    sameSite: 'strict', // Helps prevent CSRF attacks
    expires: expirationTime,
  });
  console.log("RATE LIMIT WITH EXPIRATION TIME SET", limit, remaining, reset)

  return cookieValue
}

export async function saveChat(chat: Chat) {
  const session = await auth()

  if (session && session.user) {
    const server = process.env.BASE_URL;
    const token = session?.accessToken;

    const body = JSON.stringify({
      id: chat.id,
      title: chat.title,
      userId: chat.userId,
      path: chat.path,
      messages: chat.messages
    });

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`
    };

    await axios.post(`${server}/api/thread/${chat.id}/`, body, {headers})
    
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}

export const getSearchResultsFromMemory = async (
  query: string
) : Promise<BingResults | null> =>  {
  if (!query ) return null;

  const headers = {
    Accept: 'application/json',
    "X-Subscription-Token": process.env.SEARCH_API_KEY,
  };

  const response = await axios.get(`https://api.search.brave.com/res/v1/web/search?q=` +
      encodeURIComponent(query) + `&count=5&offset=0`, { headers });

  const data = response.data as BingResults;

  return data;
}

export async function saveScholarship(scholarship: Scholarship) {

  try {
    const server = process.env.BASE_URL;

    const body = JSON.stringify({
      name: scholarship.name,
      description: scholarship.description,
      eligibility: scholarship.eligibility,
      value: scholarship.value,
      fields: scholarship.fields,
      deadline: scholarship.deadline,
      website: scholarship.website,
      hostCountry: scholarship.hostCountry
    });

    const headers = {
      'Content-Type': 'application/json',
    };
    console.log("PAYLOAD to SAVE:", body)

    const res = await axios.post(`${server}/api/scholarship/`, body, {headers});

    console.log("Scholarship Created:", res.data)
  } 
  catch (error) {
    return error
  }
}
