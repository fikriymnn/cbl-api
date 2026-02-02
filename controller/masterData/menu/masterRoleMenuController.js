// controllers/menu/roleMenuController.js
const RoleMenu = require("../../../model/masterData/menu/masterRoleMenuModel");
const MasterRole = require("../../../model/masterData/menu/masterRoleModel");
const MasterMenu = require("../../../model/masterData/menu/masterMenuModel");
const sequelize = require("../../../config/database"); // Sesuaikan path

// Get all menus with role permissions (untuk form edit)
exports.getMenusForRoleEdit = async (req, res) => {
  try {
    const { roleId } = req.params;

    // Validasi role
    const role = await MasterRole.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Ambil semua role menus untuk role ini
    const roleMenus = await RoleMenu.findAll({
      where: { id_role: roleId },
      include: [
        {
          model: MasterMenu,
          as: "menu",
          where: { is_active: true },
          required: true,
        },
      ],
      order: [[{ model: MasterMenu, as: "menu" }, "order_index", "ASC"]],
    });

    // Transform ke struktur hierarki
    const menusWithPermissions = roleMenus.map((rm) => {
      const menuData = rm.menu.toJSON();
      return {
        ...menuData,
        role_menu_id: rm.id,
        permissions: {
          can_view: rm.can_view,
          can_create: rm.can_create,
          can_edit: rm.can_edit,
          can_delete: rm.can_delete,
          is_active: rm.is_active,
        },
      };
    });

    // Buat hierarki
    const buildHierarchy = (items, parentId = null) => {
      return items
        .filter((item) => item.parent_id === parentId)
        .map((item) => ({
          ...item,
          children: buildHierarchy(items, item.id),
        }));
    };

    const hierarchicalMenus = buildHierarchy(menusWithPermissions);

    res.status(200).json({
      success: true,
      data: {
        role: role,
        menus: hierarchicalMenus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update role menu permissions (batch update)
exports.updateRoleMenuPermissions = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id_role, updates } = req.body;
    // updates: [{ id_menu, can_view, can_create, can_edit, can_delete, is_active }]

    if (!id_role || !updates || !Array.isArray(updates)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid input: id_role and updates array are required",
      });
    }

    // Validasi role exists
    const role = await MasterRole.findByPk(id_role, { transaction });
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const updatePromises = updates.map(async (update) => {
      const roleMenu = await RoleMenu.findOne({
        where: { id_role, id_menu: update.id_menu },
        transaction,
      });

      if (roleMenu) {
        return roleMenu.update(
          {
            can_view:
              update.can_view !== undefined
                ? update.can_view
                : roleMenu.can_view,
            can_create:
              update.can_create !== undefined
                ? update.can_create
                : roleMenu.can_create,
            can_edit:
              update.can_edit !== undefined
                ? update.can_edit
                : roleMenu.can_edit,
            can_delete:
              update.can_delete !== undefined
                ? update.can_delete
                : roleMenu.can_delete,
            is_active:
              update.is_active !== undefined
                ? update.is_active
                : roleMenu.is_active,
          },
          { transaction }
        );
      }
      return null;
    });

    const results = await Promise.all(updatePromises);
    const updated = results.filter((r) => r !== null).length;

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Role menu permissions updated successfully",
      data: {
        updated,
        total: updates.length,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update single role menu permission
exports.updateSingleRoleMenuPermission = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { can_view, can_create, can_edit, can_delete, is_active } = req.body;

    const roleMenu = await RoleMenu.findByPk(id, { transaction });

    if (!roleMenu) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role menu not found",
      });
    }

    await roleMenu.update(
      {
        can_view: can_view !== undefined ? can_view : roleMenu.can_view,
        can_create: can_create !== undefined ? can_create : roleMenu.can_create,
        can_edit: can_edit !== undefined ? can_edit : roleMenu.can_edit,
        can_delete: can_delete !== undefined ? can_delete : roleMenu.can_delete,
        is_active: is_active !== undefined ? is_active : roleMenu.is_active,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Role menu permission updated successfully",
      data: roleMenu,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all role menus
exports.getRoleMenus = async (req, res) => {
  try {
    const { roleId } = req.params;

    const roleMenus = await RoleMenu.findAll({
      where: { id_role: roleId },
      include: [
        {
          model: MasterMenu,
          as: "menu",
        },
        {
          model: MasterRole,
          as: "role",
        },
      ],
      order: [[{ model: MasterMenu, as: "menu" }, "order_index", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: roleMenus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
