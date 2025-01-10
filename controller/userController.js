const Users = require("../model/userModel");
const bcrypt = require("bcryptjs");
const userActionMtc = require("../model/mtc/userActionMtc");
const Ticket = require("../model/maintenaceTicketModel");
const Karyawan = require("../model/hr/karyawanModel");
const KaryawanBiodata = require("../model/hr/karyawan/karyawanBiodataModel");

const userController = {
  getUsers: async (req, res) => {
    const { bagian, role, status } = req.query;

    let obj = {};
    if (role) obj.role = role;
    if (bagian) obj.bagian = bagian;
    if (status) obj.status = status;

    try {
      const response = await Users.findAll(
        {
          where: obj,
          order: [["id", "DESC"]],
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: {
                model: KaryawanBiodata,
                as: "biodata_karyawan",
              },
            },
          ],
        },
        {
          attributes: [
            "id",
            "uuid",
            "id_karyawan",
            "nama",
            "bagian",
            "email",
            "role",
            "no",
            "status",
          ],
        }
      );
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getUsersById: async (req, res) => {
    try {
      const response = await Users.findOne({
        attributes: [
          "id",
          "uuid",
          "id_karyawan",
          "nama",
          "email",
          "role",
          "no",
          "status",
        ],
        include: [
          {
            model: userActionMtc,
            // include:[
            //   {
            //     model:Ticket,
            //     as:"tiket"
            //   }
            // ]
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
        where: {
          uuid: req.params.id,
        },
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createUsers: async (req, res) => {
    const {
      nama,
      email,
      id_karyawan,
      password,
      no,
      confPassword,
      role,
      bagian,
    } = req.body;

    if (
      !nama ||
      !id_karyawan ||
      !email ||
      !password ||
      !no ||
      !confPassword ||
      !role ||
      !bagian
    )
      return res.status(400).json({ msg: "incomplite data" });

    if (password !== confPassword)
      return res
        .status(400)
        .json({ msg: "Password And Confirm Password Doesn't Mact" });

    const users = await Users.findOne({
      where: {
        email: email,
      },
    });
    if (users) return res.status(404).json({ msg: "Email Alredy To Use" });
    const hasPassword = await bcrypt.hash(password, 10);

    try {
      await Users.create({
        nama: nama,
        id_karyawan: id_karyawan,
        email: email,
        password: hasPassword,
        role: role,
        no: no,
        bagian: bagian,
      }),
        res.status(201).json({ msg: "Register Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateUsers: async (req, res) => {
    const users = await Users.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!users) return res.status(404).json({ msg: "User Not Found" });

    const {
      nama,
      id_karyawan,
      email,
      password,
      confPassword,
      role,
      no,
      status,
      bagian,
    } = req.body;
    let hashPassword;
    if (password === "" || password === null) {
      hashPassword = users.password;
    } else {
      hashPassword = await bcrypt.hash(password, 10);
    }

    if (password !== confPassword)
      return res
        .status(400)
        .json({ msg: "Password And Confirm Password Doesn't Mact" });

    try {
      await Users.update(
        {
          nama: nama,
          email: email,
          id_karyawan: id_karyawan,
          password: hashPassword,
          role: role,
          no: no,
          status: status,
          bagian: bagian,
        },
        {
          where: {
            id: users.id,
          },
        }
      ),
        res.status(200).json({ msg: "User Update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteUsers: async (req, res) => {
    const users = await Users.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!users) return res.status(404).json({ msg: "User Not Found" });

    try {
      await Users.update(
        { status: "in_aktif" },
        {
          where: {
            id: users.id,
          },
        }
      ),
        res.status(200).json({ msg: "User Delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = userController;
