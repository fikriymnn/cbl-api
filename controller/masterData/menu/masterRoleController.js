// controllers/masterRoleController.js
const MasterRole = require("../../../model/masterData/menu/masterRoleModel");
const RoleMenu = require("../../../model/masterData/menu/masterRoleMenuModel");
const MasterMenu = require("../../../model/masterData/menu/masterMenuModel");
const sequelize = require("../../../config/database"); // Sesuaikan path

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await MasterRole.findAll({
      where: { is_active: true },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get role by ID dengan menus (hierarchical & sorted) - Only active permissions
exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await MasterRole.findByPk(id, {
      include: [
        {
          model: RoleMenu,
          as: "role_menus",
          where: { is_active: true }, // Hanya ambil role_menus yang aktif
          required: false,
          include: [
            {
              model: MasterMenu,
              as: "menu",
              where: { is_active: true },
              required: false,
            },
          ],
        },
      ],
      order: [
        [
          { model: RoleMenu, as: "role_menus" },
          { model: MasterMenu, as: "menu" },
          "level",
          "ASC",
        ],
        [
          { model: RoleMenu, as: "role_menus" },
          { model: MasterMenu, as: "menu" },
          "order_index",
          "ASC",
        ],
      ],
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Transform ke struktur yang lebih mudah dibaca
    const roleData = role.toJSON();

    // Map role_menus dengan menu details dan permissions (sudah pasti aktif karena filter di atas)
    const menusWithPermissions = roleData.role_menus
      .filter((rm) => rm.menu && rm.is_active) // Double check untuk is_active
      .map((rm) => ({
        ...rm.menu,
        role_menu_id: rm.id,
        permissions: {
          can_view: rm.can_view,
          can_create: rm.can_create,
          can_edit: rm.can_edit,
          can_delete: rm.can_delete,
          is_active: rm.is_active,
        },
      }));

    // Buat struktur hierarki
    const buildHierarchy = (items, parentId = null) => {
      return items
        .filter((item) => item.parent_id === parentId)
        .sort((a, b) => a.order_index - b.order_index)
        .map((item) => ({
          ...item,
          children: buildHierarchy(items, item.id),
        }));
    };

    const hierarchicalMenus = buildHierarchy(menusWithPermissions);

    // Response dengan menus dalam format hierarki
    const response = {
      id: roleData.id,
      name: roleData.name,
      description: roleData.description,
      is_active: roleData.is_active,
      createdAt: roleData.createdAt,
      updatedAt: roleData.updatedAt,
      menus: hierarchicalMenus,
      menu_count: {
        total: menusWithPermissions.length,
        with_view_access: menusWithPermissions.filter(
          (m) => m.permissions.can_view
        ).length,
        with_create_access: menusWithPermissions.filter(
          (m) => m.permissions.can_create
        ).length,
        with_edit_access: menusWithPermissions.filter(
          (m) => m.permissions.can_edit
        ).length,
        with_delete_access: menusWithPermissions.filter(
          (m) => m.permissions.can_delete
        ).length,
      },
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get role with menus
exports.getRoleWithMenus = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await MasterRole.findByPk(id, {
      include: [
        {
          model: RoleMenu,
          as: "role_menus",
          required: false,
          include: [
            {
              model: MasterMenu,
              as: "menu",
              where: { is_active: true },
              required: false,
            },
          ],
        },
      ],
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create role - DENGAN AUTO CREATE ROLE MENU
exports.createRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    // Check if role name already exists
    const existingRole = await MasterRole.findOne({
      where: { name },
      transaction,
    });

    if (existingRole) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Role name already exists",
      });
    }

    // Create role
    const role = await MasterRole.create(
      {
        name,
        description,
      },
      { transaction }
    );

    // Get all active menus
    const allMenus = await MasterMenu.findAll({
      where: { is_active: true },
      transaction,
    });

    // Create role menu untuk semua menu dengan default tidak aktif
    if (allMenus.length > 0) {
      const roleMenusData = allMenus.map((menu) => ({
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
      message: `Role created successfully with ${allMenus.length} menus assigned (inactive by default)`,
      data: role,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const role = await MasterRole.findByPk(id, { transaction });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if new name already exists (except current role)
    if (name && name !== role.name) {
      const existingRole = await MasterRole.findOne({
        where: { name },
        transaction,
      });

      if (existingRole) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Role name already exists",
        });
      }
    }

    await role.update(
      {
        name: name || role.name,
        description: description !== undefined ? description : role.description,
        is_active: is_active !== undefined ? is_active : role.is_active,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Activate role
exports.activateRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const role = await MasterRole.findByPk(id, { transaction });

    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    await role.update({ is_active: true }, { transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Role activated successfully",
      data: role,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all roles including inactive
exports.getAllRolesIncludingInactive = async (req, res) => {
  try {
    const roles = await MasterRole.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Duplicate role (copy role with menus)
exports.duplicateRole = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { new_name, description } = req.body;

    if (!new_name) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "New role name is required",
      });
    }

    // Check if source role exists
    const sourceRole = await MasterRole.findByPk(id, { transaction });
    if (!sourceRole) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Source role not found",
      });
    }

    // Check if new name already exists
    const existingRole = await MasterRole.findOne({
      where: { name: new_name },
      transaction,
    });

    if (existingRole) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "New role name already exists",
      });
    }

    // Create new role
    const newRole = await MasterRole.create(
      {
        name: new_name,
        description: description || `Copy of ${sourceRole.name}`,
      },
      { transaction }
    );

    // Copy role menus (termasuk yang inactive)
    const sourceRoleMenus = await RoleMenu.findAll({
      where: { id_role: id },
      transaction,
    });

    if (sourceRoleMenus.length > 0) {
      const newRoleMenus = sourceRoleMenus.map((rm) => ({
        id_role: newRole.id,
        id_menu: rm.id_menu,
        can_view: rm.can_view,
        can_create: rm.can_create,
        can_edit: rm.can_edit,
        can_delete: rm.can_delete,
        is_active: rm.is_active,
      }));

      await RoleMenu.bulkCreate(newRoleMenus, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: "Role duplicated successfully",
      data: newRole,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Sync menus untuk role yang sudah ada (jika ada menu baru ditambahkan)
exports.syncRoleMenus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check role exists
    const role = await MasterRole.findByPk(id, { transaction });
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Get all active menus
    const allMenus = await MasterMenu.findAll({
      where: { is_active: true },
      transaction,
    });

    // Get existing role menus
    const existingRoleMenus = await RoleMenu.findAll({
      where: { id_role: id },
      transaction,
    });

    const existingMenuIds = existingRoleMenus.map((rm) => rm.id_menu);
    const allMenuIds = allMenus.map((m) => m.id);

    // Find menus yang belum di-assign
    const missingMenuIds = allMenuIds.filter(
      (id) => !existingMenuIds.includes(id)
    );

    if (missingMenuIds.length > 0) {
      const newRoleMenus = missingMenuIds.map((menuId) => ({
        id_role: id,
        id_menu: menuId,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        is_active: false,
      }));

      await RoleMenu.bulkCreate(newRoleMenus, { transaction });
    }

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: `Synced successfully. ${missingMenuIds.length} new menus added to role.`,
      data: {
        added: missingMenuIds.length,
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
