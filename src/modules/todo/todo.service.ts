import { CreateTodoDTO, UpdateTodoDTO } from "../../types/todo.types";
import { Todo } from "./todo.model";
import { TodoRepository } from "./todo.repository";

export class TodoService {
  constructor(private todoRepository: TodoRepository) {}

  async getAllTodos(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }

  async getTodo(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  }

  async createTodo(data: CreateTodoDTO): Promise<Todo> {
    if (!data.title || data.title.length < 3) {
      throw new Error("Title must be at least 3 characters");
    }

    return this.todoRepository.create(data);
  }

  async updateTodo(id: string, data: UpdateTodoDTO): Promise<Todo> {
    const updated = await this.todoRepository.update(id, data);

    if (!updated) {
      throw new Error("Todo not found");
    }

    return updated;
  }

  async deleteTodo(id: string): Promise<void> {
    const deleted = await this.todoRepository.delete(id);

    if (!deleted) {
      throw new Error("Todo not found");
    }
  }
}
