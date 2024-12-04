const Users = require("../model/userModel");
const { generate_access_token } = require("../utils/jwt");
const authMiddlewares = require("../middlewares/authMiddlewares");
const bcrypt = require("bcryptjs");
const Notification = require("../model/notificationModel");
const Karyawan = require("../model/hr/karyawanModel");
const KaryawanBiodata = require("../model/hr/karyawan/karyawanBiodataModel");

const authController = {
  Login: async (req, res) => {
    if (!req.body.email && !req.body.password)
      return res.status(400).json({ msg: "Incomplete input data!" });

    const users = await Users.findOne({
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

    const access_token = generate_access_token({
      id: id,
      uuid: uuid,
      name: name,
      email: email,
      no: no,
      role: role,
      id_karyawan: id_karyawan,
    });

    res.cookie("access_token", access_token, {
      sameSite: "None",
      secure: true,
      httpOnly: true,
      path: "/",
    });

    res.status(200).json({ uuid, name, email, role, no, bagian });
  },

  Me: async (req, res, next) => {
    if (!req.cookies.access_token)
      return res.status(401).json({ msg: "Pliss Login" });

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
      ],
      where: {
        uuid: uuid,
      },
      include: [
        {
          model: Notification,
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
    res.status(200).json(users);
  },

  Logout: async (req, res) => {
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
  },
};

module.exports = authController;
