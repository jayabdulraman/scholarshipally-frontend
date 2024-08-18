'use client'

import dynamic from 'next/dynamic'
import { ScholarshipsSkeleton } from './scholarships-skeleton'

export { spinner } from './spinner'
export { BotCard, BotMessage, InternetMessage, SystemMessage } from './message'

const Scholarships = dynamic(() => import('./scholarships').then(mod => mod.Scholarships), {
  ssr: false,
  loading: () => <ScholarshipsSkeleton />
})

export { Scholarships }
