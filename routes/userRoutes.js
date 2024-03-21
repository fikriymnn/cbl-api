const router = require("express").Router();
const {
  getUsers,
  getUsersById,
  createUsers,
  updateUsers,
  deleteUsers,
} = require("../controller/userController");
const { Auth } = require("../middlewares/authMiddlewares");

router.get("/users", Auth, getUsers);
router.get("/users/:id", Auth, getUsersById);
router.post("/users", Auth, createUsers);
router.put("/users/:id", Auth, updateUsers);
router.delete("/users/:id", Auth, deleteUsers);

module.exports = router;
