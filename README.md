# scholarshipally-frontend

Ally 🤖 is an assistant that helps prospective students find the right funding opportunities 💵🛫🎓, thereby increasing your chances of success. Ally can search the internet or our database of up to 1000 scholarships to get the funding you need, provide admission and application guidance or even point you where to start.

## Features:
- Question-answering through vector/semantic search
- Question-answering through internet search
- Share chat/opportunities with loved ones
- Generative UI with vercel's ai sdk
- Chat history to save conversations
- Conversational style with memory
  
Built with:
- Nextjs 
- Typescript
- shadcn UI components
- OpenAI API (gpt-4o-mini)
- Qdrant (vector store)
- Brave API (internet search)

See [backend](https://github.com/jayabdulraman/scholarshipally-backend), which enables data persistence through API.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
