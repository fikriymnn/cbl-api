import Express from "express";
import {
  getUsers,
  getUsersById,
  createUsers,
  updateUsers,
  deleteUsers,
} from "../controller/userController.js";
import { Auth } from "../middlewares/authMiddlewares.js";

const router = Express.Router();

router.get("/users", Auth, getUsers);
router.get("/users/:id", Auth, getUsersById);
router.post("/users", Auth, createUsers);
router.patch("/users/:id", Auth, updateUsers);
router.delete("/users/:id", Auth, deleteUsers);

export default router;
