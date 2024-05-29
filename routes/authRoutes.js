const router = require("express").Router();
const { Login, Logout, Me } = require("../controller/authController");
const { auth } = require("../middlewares/authMiddlewares");

router.get("/me", auth, Me);
router.post("/login", Login);
router.delete("/logout", Logout);

module.exports = router;
