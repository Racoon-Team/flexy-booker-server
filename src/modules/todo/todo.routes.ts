import { Router } from "express";
import { TodoController } from "./todo.controller";
import { TodoRepository } from "./todo.repository";
import { TodoService } from "./todo.service";

const router = Router();

const repository = new TodoRepository();
const service = new TodoService(repository);
const controller = new TodoController(service);

router.get("/todos", controller.getAll);
router.get("/todos/:id", controller.getById);
router.post("/todos", controller.create);
router.put("/todos/:id", controller.update);
router.delete("/todos/:id", controller.delete);

export default router;
