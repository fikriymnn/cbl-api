const Users = require("../model/userModel");
const { Sequelize } = require("sequelize");
const { generate_access_token } = require("../utils/jwt");
const authMiddlewares = require("../middlewares/authMiddlewares");
const bcrypt = require("bcryptjs");
const Notification = require("../model/notificationModel");
const Karyawan = require("../model/hr/karyawanModel");
const KaryawanBiodata = require("../model/hr/karyawan/karyawanBiodataModel");
const MasterRole = require("../model/masterData/menu/masterRoleModel");
const RoleMenu = require("../model/masterData/menu/masterRoleMenuModel");
const MasterMenu = require("../model/masterData/menu/masterMenuModel");

const authController = {
  Login: async (req, res) => {
    try {
      if (!req.body.email && !req.body.password)
        return res.status(400).json({ msg: "Incomplete input data!" });

      const users = await Users.findOne({
        status: "aktif",
        where: {
          email: req.body.email,
        },
      });
      if (!users) return res.status(404).json({ msg: "User Not Found" });

      const mach = await bcrypt.compare(req.body.password, users.password);
      if (!mach) return res.status(400).json({ msg: "Wrong Password" });

      const id = users.id;
      const uuid = users.uuid;
      const name = users.nama;
      const email = users.email;
      const role = users.role;
      const no = users.no;
      const bagian = users.bagian;
      const id_karyawan = users.id_karyawan;
      const divisi_bawahan = users.divisi_bawahan;

      const access_token = generate_access_token({
        id: id,
        uuid: uuid,
        name: name,
        email: email,
        no: no,
        role: role,
        id_karyawan: id_karyawan,
        divisi_bawahan: divisi_bawahan,
      });

      res.cookie("access_token", access_token, {
        sameSite: "None",
        secure: true,
        httpOnly: true,
        path: "/",
      });

      //get role menu hirarki
      const roleMenu = await MasterRole.findByPk(users.id_role, {
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
      let hierarchicalMenus = null;

      if (roleMenu) {
        // Transform ke struktur yang lebih mudah dibaca
        const roleData = roleMenu.toJSON();

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

        hierarchicalMenus = buildHierarchy(menusWithPermissions);
      }

      res
        .status(200)
        .json({ uuid, name, email, role, no, bagian, menu: hierarchicalMenus });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  Me: async (req, res, next) => {
    try {
      if (!req.cookies.access_token)
        return res.status(401).json({ msg: "Pliss Login!!" });

      const uuid = req.user.uuid;

      const users = await Users.findOne({
        attributes: [
          "id",
          "uuid",
          "id_karyawan",
          "nama",
          "email",
          "role",
          "no",
          "status",
          "bagian",
          "divisi_bawahan",
          "id_role",
        ],
        where: {
          uuid: uuid,
        },
        include: [
          {
            model: Notification,
            limit: 20,
          },
          {
            model: Karyawan,
            as: "karyawan",
            include: {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
            },
          },
        ],
      });
      if (!users) return res.status(404).json({ msg: "User Not Found" });
      if (users && typeof users.divisi_bawahan === "string") {
        try {
          users.divisi_bawahan = JSON.parse(users.divisi_bawahan);
        } catch (e) {
          console.warn(
            "divisi_bawahan bukan JSON valid:",
            users.divisi_bawahan,
          );
        }
      }

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  Logout: async (req, res) => {
    try {
      if (!req.cookies.access_token)
        return res.status(403).json({ msg: "Pliss Login" });

      const clear = res.clearCookie("access_token", {
        sameSite: "None",
        secure: true,
        httpOnly: true,
        path: "/",
      });
      if (!clear) return res.status(400).json({ msg: "Cannot Logout" });
      res.status(200).json({ msg: "Logout Succsess" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = authController;
