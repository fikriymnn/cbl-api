// routes/menu/masterMenuRoutes.js

const router = require("express").Router();
const masterMenuController = require("../../../controller/masterData/menu/masterMenuController");

router.get("/master/menu", masterMenuController.getAllMenus);
router.post("/master/menu", masterMenuController.createMenu);
router.put("/master/menu/:id", masterMenuController.updateMenu);
router.delete("/master/menu/:id", masterMenuController.deleteMenu);
router.get("/master/menuByRole/:roleId", masterMenuController.getMenusByRole);

module.exports = router;
