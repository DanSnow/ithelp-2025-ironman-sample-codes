import { ManagedRuntime } from "effect";
import { TodoService } from "./services/TodoService";

export const BackendRuntime = ManagedRuntime.make(TodoService.Default);
