const router = require("express").Router();
const incomingTaskController = require("../../controller/hr/incomingTaskController");

router.get("/hr/incomingTask", incomingTaskController.getIncomingTask);

module.exports = router;
