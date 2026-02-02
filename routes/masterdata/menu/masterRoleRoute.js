// routes/masterRoleRoutes.js
const router = require("express").Router();
const masterRoleController = require("../../../controller/masterData/menu/masterRoleController");

// Get all roles (active only)
router.get("/master/roles", masterRoleController.getAllRoles);

// Get all roles including inactive
router.get(
  "/master/rolesAll",
  masterRoleController.getAllRolesIncludingInactive
);

// Get role by ID
router.get(
  "/master/roles/:id",

  masterRoleController.getRoleById
);

// Get role with menus
router.get("/master/roles/:id/menus", masterRoleController.getRoleWithMenus);
// Create role
router.post("/master/roles", masterRoleController.createRole);

// Update role
router.put("/master/roles/:id", masterRoleController.updateRole);

module.exports = router;
