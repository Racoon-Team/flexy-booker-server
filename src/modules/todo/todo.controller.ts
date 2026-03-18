import { Request, Response } from "express";
import { CreateTodoDTO, UpdateTodoDTO } from "../../types/todo.types";
import { TodoService } from "./todo.service";

interface TodoParams {
  id: string;
}

type Empty = Record<string, never>;

export class TodoController {
  constructor(private todoService: TodoService) {}

  getAll = async (req: Request<Empty>, res: Response) => {
    const todos = await this.todoService.getAllTodos();
    res.json(todos);
  };

  getById = async (req: Request<TodoParams>, res: Response) => {
    const { id } = req.params;

    const todo = await this.todoService.getTodo(id);

    res.json(todo);
  };

  create = async (
    req: Request<Empty, unknown, CreateTodoDTO>,
    res: Response,
  ) => {
    const todo = await this.todoService.createTodo(req.body);

    res.status(201).json(todo);
  };

  update = async (
    req: Request<TodoParams, unknown, UpdateTodoDTO>,
    res: Response,
  ) => {
    const { id } = req.params;

    const todo = await this.todoService.updateTodo(id, req.body);

    res.json(todo);
  };

  delete = async (req: Request<TodoParams>, res: Response) => {
    const { id } = req.params;

    await this.todoService.deleteTodo(id);

    res.status(204).send();
  };
}
