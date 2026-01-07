// routes/menu/roleMenuRoutes.js
const router = require("express").Router();
const roleMenuController = require("../../../controller/masterData/menu/masterRoleMenuController");

router.get(
  "/master/roleMenu/byIdRole/:roleId",
  roleMenuController.getMenusForRoleEdit
);
router.put(
  "/master/roleMenu/:id",
  roleMenuController.updateRoleMenuPermissions
);
router.put(
  "/master/roleMenu/single/:id",
  roleMenuController.updateSingleRoleMenuPermission
);
router.get("/master/role/:roleId", roleMenuController.getRoleMenus);

module.exports = router;
