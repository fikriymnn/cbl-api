const router = require("express").Router();
const { Login, Logout, Me } = require("../controller/authController");
const { Auth } = require("../middlewares/authMiddlewares");

router.get("/me", Auth, Me);
router.post("/login", Login);
router.delete("/logout", Logout);

module.exports = router;
