import { Readability } from "@mozilla/readability";
import { Array, Effect, pipe } from "effect";
import { parseHTML } from "linkedom";
import { $fetch, type FetchError, type FetchOptions } from "ofetch";
import { hash } from "ohash";
import Turndown from "turndown";
import type {} from "typed-query-selector";
import { createStorage, type Driver } from "unstorage";
import fs from "unstorage/drivers/fs-lite";

const $fetchText = Effect.fn("$fetch")(
  (url: string, options?: FetchOptions<"text">) =>
    Effect.tryPromise({
      try: (signal) => $fetch(url, { ...options, signal }),
      catch: (err) => err as FetchError,
    })
);

class Cache extends Effect.Service<Cache>()("Cache", {
  accessors: true,
  effect: (driver: Driver = fs({ base: ".cache" })) =>
    Effect.gen(function* () {
      const storage = createStorage<string>({ driver });

      return {
        getItem: (key: string) => Effect.promise(() => storage.getItem(key)),
        setItem: (key: string, value: string) =>
          Effect.promise(() => storage.setItem(key, value)),
      };
    }),
}) {}

const $fetchTextWithCache = Effect.fn("$fetchTextWithCache")(function* (
  url: string,
  options?: FetchOptions<"text">
) {
  const key = hash(url);
  const cacheItem = yield* Cache.getItem(key);
  if (cacheItem) {
    console.log(url, "cache hit");
    return cacheItem;
  }
  const html = yield* $fetchText(url, options);
  yield* Cache.setItem(key, html);
  return html;
});

function parseArticleLinks(html: string) {
  const { document } = parseHTML(html);
  const links = document.querySelectorAll("a.qa-list__title-link");
  const articles = Array.fromIterable(links).map((link) => ({
    title: link.textContent,
    url: link.href,
  }));
  console.log(articles);
  return articles;
}

const turndown = new Turndown();

function extractContent(html: string) {
  const { document } = parseHTML(html);
  const parser = new Readability(document);
  const parsed = parser.parse();
  const markdown = turndown.turndown(parsed?.content ?? "");
  console.log(markdown);
  return markdown;
}

pipe(
  $fetchTextWithCache("https://ithelp.ithome.com.tw/articles?tab=tech"),
  Effect.map((html) => parseArticleLinks(html)),
  Effect.flatMap((articles) =>
    pipe(
      articles,
      Array.map((article) =>
        pipe(
          $fetchTextWithCache(article.url),
          Effect.map((html) => extractContent(html))
        )
      ),
      Effect.allWith({ concurrency: 2 })
    )
  ),
  Effect.provide(Cache.Default()),
  Effect.runPromise
);
