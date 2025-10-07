import { Array, Effect, pipe } from "effect";
import type { Todo } from "@/orpc/schema";
import { StorageService } from "./StorageService";

export class TodoService extends Effect.Service<TodoService>()("Todo", {
  accessors: true,
  dependencies: [StorageService.Default],
  effect: Effect.gen(function* () {
    const { loadTodos, saveTodos } = yield* StorageService;
    const mutex = yield* Effect.makeSemaphore(1);

    return {
      todos: loadTodos,
      addTodo: (name: string) =>
        pipe(
          loadTodos,
          Effect.map((todos): Todo[] =>
            Array.append(todos, {
              id: todos.length,
              name,
            }),
          ),
          Effect.flatMap((todos) => saveTodos(todos)),
          mutex.withPermits(1),
        ),
    };
  }),
}) {}
