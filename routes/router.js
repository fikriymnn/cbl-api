const router = require("express").Router();

router.use("/", require("./authRoutes"));
router.use("/", require("./userRoutes"));

module.exports = router;
