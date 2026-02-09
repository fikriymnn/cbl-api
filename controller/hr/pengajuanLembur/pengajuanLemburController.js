const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const KaryawanBagianMesin = require("../../../model/hr/karyawan/karyawanBagianMesinModel");
const db = require("../../../config/database");

const PengajuanLemburController = {
  getPengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      id_karyawan,
      status,
      status_tiket,
      status_ketidaksesuaian,
      id_department,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };
    if (status_tiket) obj.status_tiket = status_tiket;
    if (status_ketidaksesuaian)
      obj.status_ketidaksesuaian = status_ketidaksesuaian;
    if (id_department) obj.id_department = id_department;
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (status) obj.status = status;
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.dari = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await PengajuanLembur.count({ where: obj });
        const data = await PengajuanLembur.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju_ketidaksesuaian",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_respon_ketidaksesuaian",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await PengajuanLembur.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },

            {
              model: Karyawan,
              as: "karyawan_pengaju_ketidaksesuaian",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_respon_ketidaksesuaian",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await PengajuanLembur.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju_ketidaksesuaian",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_respon_ketidaksesuaian",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    // {
                    //   model: MasterDivisi,
                    //   as: "divisi",
                    // },
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                    // {
                    //   model: MasterBagianHr,
                    //   as: "bagian",
                    // },
                  ],
                },
              ],
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPengajuanLembur: async (req, res) => {
    const {
      karyawan,
      id_karyawan,
      id_pengaju,
      jo_lembur,
      dari,
      sampai,
      dari_2,
      sampai_2,
      lama_lembur,
      alasan_lembur,
      target_lembur,
    } = req.body;
    const t = await db.transaction();
    //console.log(req.body);

    try {
      if (karyawan.length == 0)
        return res.status(404).json({ msg: `id karyawan kosong` });
      const dataKaryawanBiodata = await KaryawanBiodata.findAll({
        where: {
          id_karyawan: {
            [Op.in]: karyawan, // Gunakan array id_karyawan
          },
        },
        include: {
          model: KaryawanBagianMesin,
          as: "bagian_mesin_karyawan",
        },
      });
      //set untuk karyawan biodata
      const idSet = new Set(
        dataKaryawanBiodata.map((item) => item.id_karyawan),
      );
      // Cari karyawan yang tidak ada di karyawanBiodata
      const tidakAda = karyawan.filter((id) => !idSet.has(id));

      if (tidakAda.length > 0)
        return res
          .status(404)
          .json({ msg: `Karyawan dengan id ${tidakAda} Tidak ditemukan` });

      for (let i = 0; i < dataKaryawanBiodata.length; i++) {
        const data = dataKaryawanBiodata[i];
        let dari2Data = null;
        let sampai2Data = null;

        if (dari_2) dari2Data = dari_2;
        if (sampai_2) sampai2Data = sampai_2;
        await PengajuanLembur.create(
          {
            id_karyawan: data.id_karyawan,
            id_pengaju: id_pengaju,
            id_department: data.id_department,
            jo_lembur,
            dari,
            sampai,
            dari_2: dari2Data,
            sampai_2: sampai2Data,
            lama_lembur,
            lama_lembur_aktual: lama_lembur,
            alasan_lembur,
            target_lembur,
            bagian_mesin:
              data.bagian_mesin_karyawan.length === 0
                ? null
                : data.bagian_mesin_karyawan[0].nama_bagian_mesin,
          },
          { transaction: t },
        );
      }

      await t.commit();
      res.status(200).json({
        msg: "pengajuan successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updatePengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const {
      jo_lembur,
      dari,
      sampai,
      dari_2,
      sampai_2,
      lama_lembur,
      alasan_lembur,
      target_lembur,
    } = req.body;

    const t = await db.transaction();
    //console.log(req.body);

    try {
      let obj = {};
      if (jo_lembur) obj.jo_lembur = jo_lembur;
      if (dari) obj.dari = dari;
      if (sampai) obj.sampai = sampai;
      if (dari_2) obj.dari_2 = dari_2;
      if (sampai_2) obj.sampai_2 = sampai_2;
      if (lama_lembur) obj.lama_lembur = lama_lembur;
      if (alasan_lembur) obj.alasan_lembur = alasan_lembur;
      if (target_lembur) obj.target_lembur = target_lembur;

      await PengajuanLembur.update(obj, {
        where: { id: _id },
        transaction: t,
      });

      await t.commit();
      res.status(200).json({
        msg: "pengajuan successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  sendPengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanLembur.update(
        {
          status: "request user",
          status_tiket: "incoming",
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approveUserPengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanLembur.update(
        {
          status: "approve user",
          status_tiket: "incoming",
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  rejectUserPengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanLembur.update(
        {
          status: "rejected user",
          status_tiket: "history",
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanLembur.update(
        {
          status: "approved",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  rejectPengajuanLembur: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanLembur.update(
        {
          status: "rejected",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();

      res.status(200).json({ msg: "Reject Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  kirimPengajuanLemburTidakSesuai: async (req, res) => {
    const _id = req.params.id;
    const {
      catatan_ketidaksesuaian,
      lama_lembur_absen,
      type_ketidaksesuaian,
      id_pengaju_ketidaksesuaian,
      alasan_ketidaksesuaian,
      penanganan,
    } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      let lamaLemburAktual = dataPengajuanLembur.lama_lembur_aktual;
      let statusPenanganan = "Sesuai SPL";

      // 1 untuk ikut lama lembur absen
      if (penanganan == 1) {
        lamaLemburAktual = lama_lembur_absen;
        statusPenanganan = "Sesuai absen";
      }

      await PengajuanLembur.update(
        {
          status_ketidaksesuaian: "incoming",
          catatan_ketidaksesuaian,
          lama_lembur_absen,
          type_ketidaksesuaian,
          id_pengaju_ketidaksesuaian,
          alasan_ketidaksesuaian,
          lama_pengajuan_ketidaksesuaian: lamaLemburAktual,
          penanganan: statusPenanganan,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res.status(200).json({ msg: "Send Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  responPengajuanLemburTidakSesuai: async (req, res) => {
    const _id = req.params.id;
    const { id_respon_ketidaksesuaian, penanganan } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanLembur = await PengajuanLembur.findByPk(_id);
      if (!dataPengajuanLembur)
        return res.status(404).json({ msg: "data tidak di temukan" });

      let lamaLemburAktual = dataPengajuanLembur.lama_lembur_aktual;
      let statusPenanganan = "Sesuai SPL";

      // 0 untuk ikut lama lembur spl
      if (penanganan == 0) {
        lamaLemburAktual = dataPengajuanLembur.lama_lembur;
        statusPenanganan = "Sesuai spl";
      } else {
        lamaLemburAktual = dataPengajuanLembur.lama_lembur_absen;
        statusPenanganan = "Sesuai absen";
      }

      await PengajuanLembur.update(
        {
          status_ketidaksesuaian: "approved",
          id_respon_ketidaksesuaian,
          lama_lembur_aktual: lamaLemburAktual,
          penanganan: statusPenanganan,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      await t.commit();
      res.status(200).json({ msg: "Send Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PengajuanLemburController;
