import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
  id: string
  metadata: BingResults | [] | null,
  searchType: string | null | undefined
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export interface Scholarship {
  name: string
  description: string
  eligibility: string
  value: string
  fields: string
  deadline: Date
  website: string
  hostCountry: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
    name: string
    token: string
    searchType: string | undefined
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  fullname: string
  email: string
  token: string
  password: string
  salt: string
}

// Search Types
export interface BingResults {
  query: Query;
  mixed: Mixed;
  type: string;
  web: Web;
}

export interface Query {
  original: string;
  show_strict_warning: boolean;
  is_navigational: boolean;
  is_news_breaking: boolean;
  spellcheck_off: boolean;
  country: string;
  bad_results: boolean;
  should_fallback: boolean;
  postal_code: string;
  city: string;
  header_country: string;
  more_results_available: boolean;
  state: string;
}

export interface Mixed {
  type: string;
  main: Main[];
  top: any[];
  side: any[];
}

export interface Main {
  type: string;
  index: number;
  all: boolean;
}

export interface Web {
  type: string;
  results: Result[];
  family_friendly: boolean;
}

export interface Result {
  title: string;
  url: string;
  is_source_local: boolean;
  is_source_both: boolean;
  description: string;
  profile: Profile;
  language: string;
  family_friendly: boolean;
  type: string;
  subtype: string;
  meta_url: MetaUrl;
  thumbnail?: Thumbnail;
  page_age?: string;
  age?: string;
}

export interface ContentWithSource {
  content: string;
  source: Result;
}

export interface Profile {
  name: string;
  url: string;
  long_name: string;
  img: string;
}

export interface MetaUrl {
  scheme: string;
  netloc: string;
  hostname: string;
  favicon: string;
  path: string;
}

export interface Thumbnail {
  src: string;
  original: string;
  logo: boolean;
}
