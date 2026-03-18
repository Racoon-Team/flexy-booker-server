import { db } from "../../db/knex";
import { CreateTodoDTO, UpdateTodoDTO } from "../../types/todo.types";
import { Todo } from "./todo.model";

export class TodoRepository {
  private table = "todos";

  async findAll(): Promise<Todo[]> {
    return db(this.table).select("*");
  }

  async findById(id: string): Promise<Todo | null> {
    const todo = await db(this.table).where({ id }).first();

    return todo ?? null;
  }

  async create(data: CreateTodoDTO): Promise<Todo> {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      completed: false,
      createdAt: new Date(),
    };

    await db(this.table).insert({
      id: newTodo.id,
      title: newTodo.title,
      completed: newTodo.completed,
      created_at: newTodo.createdAt,
    });

    return newTodo;
  }

  async update(id: string, data: UpdateTodoDTO): Promise<Todo | null> {
    const updated = await db(this.table)
      .where({ id })
      .update({
        ...data,
      })
      .returning("*");

    return updated[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await db(this.table).where({ id }).del();

    return deleted > 0;
  }
}
