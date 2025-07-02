const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { Login, Logout, Me } = require("../controller/authController");
const { auth } = require("../middlewares/authMiddlewares");

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 5, // maksimal 5 percobaan dalam window
  standardHeaders: true, // supaya frontend bisa baca RateLimit-* header
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      status: 429,
      msg: "Terlalu banyak percobaan login. Silakan coba lagi dalam 5 menit.",
    });
  },
});

router.get("/me", auth, Me);
router.post("/login", loginLimiter, Login);
router.delete("/logout", Logout);

module.exports = router;
