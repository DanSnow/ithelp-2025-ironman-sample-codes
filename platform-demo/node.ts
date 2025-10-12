import { Effect, Layer, pipe } from 'effect'
import { fetchAndSavePosts } from './core'
import { NodeHttpClient, NodeKeyValueStore } from '@effect/platform-node'

const NodeLive = Layer.mergeAll(NodeHttpClient.layerUndici, NodeKeyValueStore.layerFileSystem('.cache'))

pipe(fetchAndSavePosts(10), Effect.provide(NodeLive), Effect.runPromise)
