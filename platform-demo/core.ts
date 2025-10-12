import { HttpClient, HttpClientResponse, KeyValueStore } from '@effect/platform'
import { Array, Effect, pipe, Schema } from 'effect'

const PostSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  body: Schema.String,
})

type Post = typeof PostSchema.Type

const { tag: PostStore, layer: PostStoreLayer } = KeyValueStore.layerSchema(PostSchema, 'PostStore')

const parsePostBody = HttpClientResponse.schemaBodyJson(PostSchema)

const fetchPost = Effect.fn('fetchPost')(function* (id: number) {
  const post = yield* pipe(
    HttpClient.get(`https://jsonplaceholder.typicode.com/posts/${id}`),
    Effect.flatMap((response) => parsePostBody(response)),
  )
  return post
})

const savePost = Effect.fn('savePost')(function* (id: number, post: Post) {
  const { set } = yield* PostStore
  yield* set(`post-${id}`, post)
}, Effect.provide(PostStoreLayer))

export function fetchAndSavePosts(count: number) {
  return pipe(
    Array.makeBy(count, (i) =>
      pipe(
        fetchPost(i + 1),
        Effect.flatMap((post) => savePost(i + 1, post)),
      ),
    ),
    Effect.allWith({ concurrency: 2 }),
  )
}
