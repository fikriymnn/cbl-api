// controllers/menu/masterMenuController.js
const MasterMenu = require("../../../model/masterData/menu/masterMenuModel");
const RoleMenu = require("../../../model/masterData/menu/masterRoleMenuModel");
const MasterRole = require("../../../model/masterData/menu/masterRoleModel");
const sequelize = require("../../../config/database"); // Sesuaikan path

// Get all menus (hierarchical)
exports.getAllMenus = async (req, res) => {
  try {
    const menus = await MasterMenu.findAll({
      where: { parent_id: null, is_active: true },
      include: [
        {
          model: MasterMenu,
          as: "children",
          include: [
            {
              model: MasterMenu,
              as: "children",
            },
          ],
        },
      ],
      order: [
        ["order_index", "ASC"],
        [{ model: MasterMenu, as: "children" }, "order_index", "ASC"],
        [
          { model: MasterMenu, as: "children" },
          { model: MasterMenu, as: "children" },
          "order_index",
          "ASC",
        ],
      ],
    });

    res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create menu - DENGAN AUTO ASSIGN KE SEMUA ROLE
exports.createMenu = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, icon, path, parent_id, order_index, level } = req.body;

    const menu = await MasterMenu.create(
      {
        name,
        icon,
        path,
        parent_id,
        order_index,
        level,
      },
      { transaction }
    );

    // Get all active roles
    const roles = await MasterRole.findAll({
      where: { is_active: true },
      transaction,
    });

    // Auto-assign menu ke semua role dengan default tidak aktif
    if (roles.length > 0) {
      const roleMenusData = roles.map((role) => ({
        id_role: role.id,
        id_menu: menu.id,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        is_active: false, // Default tidak aktif
      }));

      await RoleMenu.bulkCreate(roleMenusData, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: `Menu created successfully and auto-assigned to ${roles.length} roles (inactive by default)`,
      data: menu,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, icon, path, parent_id, order_index, level, is_active } =
      req.body;

    const menu = await MasterMenu.findByPk(id, { transaction });

    if (!menu) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    await menu.update(
      {
        name,
        icon,
        path,
        parent_id,
        order_index,
        level,
        is_active,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      data: menu,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete menu
exports.deleteMenu = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const menu = await MasterMenu.findByPk(id, { transaction });

    if (!menu) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    // Soft delete
    await menu.update({ is_active: false }, { transaction });

    // Optional: soft delete role menus juga
    await RoleMenu.update(
      { is_active: false },
      { where: { id_menu: id }, transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get menus by role
exports.getMenusByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const roleMenus = await RoleMenu.findAll({
      where: { id_role: roleId, is_active: true },
      include: [
        {
          model: MasterMenu,
          as: "menu",
          where: { is_active: true },
          include: [
            {
              model: MasterMenu,
              as: "children",
              include: [
                {
                  model: MasterMenu,
                  as: "children",
                },
              ],
            },
          ],
        },
      ],
    });

    // Transform to hierarchical structure
    const menuMap = new Map();
    roleMenus.forEach((rm) => {
      if (rm.menu) {
        menuMap.set(rm.menu.id, {
          ...rm.menu.toJSON(),
          permissions: {
            can_view: rm.can_view,
            can_create: rm.can_create,
            can_edit: rm.can_edit,
            can_delete: rm.can_delete,
          },
        });
      }
    });

    const hierarchicalMenus = Array.from(menuMap.values()).filter(
      (menu) => !menu.parent_id
    );

    res.status(200).json({
      success: true,
      data: hierarchicalMenus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
