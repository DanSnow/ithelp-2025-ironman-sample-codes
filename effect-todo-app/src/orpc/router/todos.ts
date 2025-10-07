import { os } from "@orpc/server";
import { z } from "zod";
import { BackendRuntime } from "@/runtime";
import { TodoService } from "@/services/TodoService";

export const listTodos = os.input(z.object({})).handler(() => {
  return BackendRuntime.runPromise(TodoService.todos);
});

export const addTodo = os
  .input(z.object({ name: z.string() }))
  .handler(({ input }) => {
    return BackendRuntime.runPromise(TodoService.addTodo(input.name));
  });
