import { readFile, writeFile } from "node:fs/promises";
import { Effect, pipe } from "effect";
import { z } from "zod";
import { TodoSchema } from "@/orpc/schema";

const TodosSchema = z.array(TodoSchema);

const FILE_NAME = "todos.json";

type Todos = z.infer<typeof TodosSchema>;

export class StorageService extends Effect.Service<StorageService>()(
  "Storage",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        loadTodos: pipe(
          Effect.tryPromise(() => readFile(FILE_NAME, "utf-8")),
          Effect.tryMap({
            try: (content) => {
              const json = JSON.parse(content);
              return TodosSchema.parse(json);
            },
            catch: (error) => error as Error,
          }),
          Effect.catchAll(() => Effect.succeed([])),
        ),
        saveTodos: (todos: Todos) =>
          Effect.promise(() => writeFile(FILE_NAME, JSON.stringify(todos))),
      };
    }),
  },
) {}
