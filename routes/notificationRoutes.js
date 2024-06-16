const router = require("express").Router();
const {
  getNotification,
  readAllNotification,
  deleteAllNotification,
} = require("../controller/notificationController");
const { auth } = require("../middlewares/authMiddlewares");

router.get("/notification", auth, getNotification);
router.get("/notification/readAll", auth, readAllNotification);
router.delete("/notification/deleteAll/:userId", auth, deleteAllNotification); //delete all by user id

module.exports = router;
