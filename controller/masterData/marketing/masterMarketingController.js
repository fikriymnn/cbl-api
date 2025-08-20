const { Op } = require("sequelize");
const MasterMarketing = require("../../../model/masterData/marketing/masterMarketingModel");
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const MasterKaryawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const KaryawanDetailInformasi = require("../../../model/hr/karyawan/karyawanDetailInformasiModel");
const db = require("../../../config/database");

const MasterMarketingController = {
  getMasterMarketing: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [{ kode: { [Op.like]: `%${search}%` } }],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterMarketing.count({ where: obj });
        const data = await MasterMarketing.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
          include: {
            model: MasterKaryawan,
            as: "data_karyawan",
            include: {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
              include: {
                model: KaryawanDetailInformasi,
                as: "detail_informasi",
              },
            },
          },
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await MasterMarketing.findByPk(_id, {
          include: {
            model: MasterKaryawan,
            as: "data_karyawan",
            include: {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
              include: {
                model: KaryawanDetailInformasi,
                as: "detail_informasi",
              },
            },
          },
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterMarketing.findAll({
          where: obj,
          include: {
            model: MasterKaryawan,
            as: "data_karyawan",
            include: {
              model: KaryawanBiodata,
              as: "biodata_karyawan",
              include: {
                model: KaryawanDetailInformasi,
                as: "detail_informasi",
              },
            },
          },
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createMasterMarketing: async (req, res) => {
    const { kode, id_karyawan } = req.body;
    const t = await db.transaction();
    try {
      if (!kode)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "kode wajib di isi!!",
        });
      if (!id_karyawan)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "karyawan wajib di isi!!",
        });

      const checkData = await MasterKaryawan.findByPk(id_karyawan);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Karyawan tidak ditemukan!!",
        });
      const response = await MasterMarketing.create(
        {
          kode: kode,
          id_karyawan: id_karyawan,
        },
        { transaction: t }
      );
      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
        data: response,
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateMasterMarketing: async (req, res) => {
    const _id = req.params.id;
    const { kode, id_karyawan, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kode) {
        await MasterCustomer.update(
          { kode_marketing: kode },
          { where: { id_marketing: _id }, transaction: t }
        );
        obj.kode = kode;
      }
      if (id_karyawan) {
        const checkKaryawan = await MasterKaryawan.findByPk(id_karyawan);
        if (!checkKaryawan)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data karyawan tidak ditemukan",
          });
        obj.id_karyawan = id_karyawan;
      }
      if (is_active) obj.is_active = is_active;

      const checkData = await MasterMarketing.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterMarketing.update(obj, {
        where: { id: _id },
        transaction: t,
      });

      await t.commit(),
        res
          .status(204)
          .json({ succes: true, status_code: 204, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterMarketing: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterMarketing.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterMarketing.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit(),
        res
          .status(204)
          .json({ succes: true, status_code: 204, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterMarketingController;
