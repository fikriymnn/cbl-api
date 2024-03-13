import Express from "express";
import { Login, Logout, Me } from "../controller/authController.js";
import { Auth } from "../middlewares/authMiddlewares.js";

const router = Express.Router();

router.get("/me", Auth, Me);
router.post("/login", Login);
router.delete("/logout", Logout);

export default router;
