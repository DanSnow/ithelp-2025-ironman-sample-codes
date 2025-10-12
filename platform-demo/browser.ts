import { Effect, Layer, pipe } from 'effect'
import { fetchAndSavePosts } from './core'
import { FetchHttpClient } from '@effect/platform'
import { BrowserKeyValueStore } from '@effect/platform-browser'

const BrowserLive = Layer.mergeAll(FetchHttpClient.layer, BrowserKeyValueStore.layerLocalStorage)

pipe(fetchAndSavePosts(10), Effect.provide(BrowserLive), Effect.runPromise)
