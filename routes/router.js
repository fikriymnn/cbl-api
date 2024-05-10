const router = require("express").Router();

router.use("/", require("./authRoutes"));
router.use("/", require("./userRoutes"));
router.use("/", require("./ticketRoutes"));
router.use("/", require("./preventive/pm1/ticketPM1Routes"));
router.use("/", require("./masterdata/masterMesinRoute"));
router.use("/", require("./masterdata/masterSparepartRoute"));

module.exports = router;
