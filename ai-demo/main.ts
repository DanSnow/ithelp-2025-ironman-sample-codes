import { LanguageModel } from '@effect/ai'
import { GoogleClient, GoogleLanguageModel } from '@effect/ai-google'
import { FetchHttpClient } from '@effect/platform'
import { createEnv } from '@t3-oss/env-core'
import { Effect, Layer, pipe, Redacted, Schema } from 'effect'
import process from 'node:process'
import { z } from 'zod'

const env = createEnv({
  server: {
    GOOGLE_BASE_URL: z.string(),
    GOOGLE_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
})

const sayHello = Effect.fn('sayHello')(function* () {
  const response = yield* LanguageModel.generateText({
    prompt: 'Hi',
  })
  console.log(response.text)
})

const SentimentSchema = Schema.Struct({
  sentiment: Schema.Literal('neutral', 'negative', 'positive'),
})

const sentimentDetect = Effect.fn('sentimentDetect')(function* (text: string) {
  const response = yield* LanguageModel.generateObject({
    prompt: `Classify the text into neutral, negative or positive: ${text}`,
    schema: SentimentSchema,
  })
  console.log(response.value)
})

const Gemini20 = GoogleLanguageModel.model('gemini-2.0-flash')
const Google = GoogleClient.layer({
  apiUrl: env.GOOGLE_BASE_URL,
  apiKey: Redacted.make(env.GOOGLE_API_KEY),
})

const AILive = pipe(Gemini20, Layer.provide(Google), Layer.provide(FetchHttpClient.layer))

pipe(sayHello(), Effect.provide(AILive), Effect.runPromise)

pipe(sentimentDetect('I think the food is okay'), Effect.provide(AILive), Effect.runPromise)
