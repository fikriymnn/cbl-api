const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanPinjaman = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const PayrollMingguan = require("../../../model/hr/payroll/payrollMingguanModel");
const PayrollMingguanDetail = require("../../../model/hr/payroll/payrollMingguanDetailModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");

const db = require("../../../config/database");

const PayrollBayarController = {
  getPayrollBayarMingguan: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search, id_karyawan } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };

    if (id_karyawan) obj.id_karyawan = id_karyawan;
    try {
      if (page && limit) {
        const length = await PayrollMingguan.count({ where: obj });
        const data = await PayrollMingguan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                  ],
                },
              ],
            },
            {
              model: PayrollMingguanDetail,
              as: "detail_payroll",
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
        const data = await PayrollMingguan.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                  ],
                },
              ],
            },
            {
              model: PayrollMingguanDetail,
              as: "detail_payroll",
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
        const data = await PayrollMingguan.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                  include: [
                    {
                      model: MasterDepartment,
                      as: "department",
                    },
                  ],
                },
              ],
            },
            {
              model: PayrollMingguanDetail,
              as: "detail_payroll",
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

  createPayrollBayarMingguan: async (req, res) => {
    const {
      id_karyawan,
      data_payroll,
      periode_dari,
      periode_sampai,
      insentif,
    } = req.body;

    const t = await db.transaction();

    try {
      let insentifData = 0;

      if (insentif) {
        insentifData = insentif;
      }
      const dataKaryawanBiodata = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
      });

      if (!dataKaryawanBiodata)
        return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });
      const dataPayrollbayar = await PayrollMingguan.create(
        {
          id_karyawan: dataKaryawanBiodata.id_karyawan,
          id_hr: req.user.id_karyawan,
          id_department: dataKaryawanBiodata.id_department,
          periode_dari,
          periode_sampai,
          total_upah: parseInt(data_payroll.total),
          insentif: insentifData,
          total_potongan: data_payroll.total_potongan,
          tipe_penggajian: dataKaryawanBiodata.tipe_penggajian,
        },
        { transaction: t },
      );

      for (let i = 0; i < data_payroll.rincian.length; i++) {
        const data = data_payroll.rincian[i];
        await PayrollMingguanDetail.create(
          {
            id_payroll_mingguan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "bayaran",
          },
          { transaction: t },
        );
      }
      for (let i = 0; i < data_payroll.upahHarianSakit.length; i++) {
        const data = data_payroll.upahHarianSakit[i];
        await PayrollMingguanDetail.create(
          {
            id_payroll_mingguan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "bayaran",
          },
          { transaction: t },
        );
      }

      for (let i = 0; i < data_payroll.potongan.length; i++) {
        const data = data_payroll.potongan[i];
        await PayrollMingguanDetail.create(
          {
            id_payroll_mingguan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "potongan",
          },
          { transaction: t },
        );
      }

      if (data_payroll.potonganPinjaman) {
        await PayrollMingguanDetail.create(
          {
            id_payroll_mingguan: dataPayrollbayar.id,
            label: "pinjaman",
            jumlah: 1,
            nilai: data_payroll.potonganPinjaman.jumlah_cicilan,
            total: data_payroll.potonganPinjaman.jumlah_cicilan,
            tipe: "potongan",
          },
          { transaction: t },
        );

        const sisaPinjaman =
          data_payroll.potonganPinjaman.sisa_pinjaman -
          data_payroll.potonganPinjaman.jumlah_cicilan;

        await PengajuanPinjaman.update(
          {
            sisa_tempo_cicilan:
              data_payroll.potonganPinjaman.sisa_tempo_cicilan - 1,
            sisa_pinjaman: sisaPinjaman,
            status_pinjaman: sisaPinjaman == 0 ? "lunas" : "belum lunas",
          },
          { where: { id: data_payroll.potonganPinjaman.id }, transaction: t },
        );
      }

      await t.commit();
      res.status(200).json({
        msg: "pembayaran berhasil",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  addDetailPayrollBayarMingguan: async (req, res) => {
    const { id_payroll_mingguan, jumlah, label, nilai, total, tipe } = req.body;

    const t = await db.transaction();

    try {
      if (tipe !== "bayaran" && tipe !== "potongan") {
        return res.status(404).json({ msg: "data tipe tidak sesuai" });
      }
      const checkDataPayrollMingguan =
        await PayrollMingguan.findByPk(id_payroll_mingguan);
      if (!checkDataPayrollMingguan) {
        return res
          .status(404)
          .json({ msg: "Data payroll mingguan tidak ditemukan" });
      }

      await PayrollMingguanDetail.create(
        {
          id_payroll_mingguan: id_payroll_mingguan,
          label: label,
          jumlah: jumlah,
          nilai: nilai,
          total: total,
          tipe: tipe, // ini pilihannya 2 yaitu bayaran dan potongan
        },
        { transaction: t },
      );

      if (tipe === "potongan") {
        await PayrollMingguan.update(
          {
            total_potongan: Sequelize.literal(`total_potongan + ${total}`),
            sub_total_upah: Sequelize.literal(`sub_total_upah - ${total}`),
          },
          {
            where: {
              id: id_payroll_mingguan,
            },
            transaction: t,
          },
        );
      } else if (tipe === "bayaran") {
        await PayrollMingguan.update(
          {
            total_upah: Sequelize.literal(`total_upah + ${total}`),
            sub_total_upah: Sequelize.literal(`sub_total_upah + ${total}`),
          },
          {
            where: {
              id: id_payroll_mingguan,
            },
            transaction: t,
          },
        );
      } else {
      }

      await t.commit();
      res.status(200).json({
        msg: "penambahan berhasil",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  deleteDetailPayrollBayarMingguan: async (req, res) => {
    const { id_payroll_mingguan, id_payroll_mingguan_detail } = req.body;

    const t = await db.transaction();

    try {
      const checkDataPayrollMingguan =
        await PayrollMingguan.findByPk(id_payroll_mingguan);
      if (!checkDataPayrollMingguan) {
        return res
          .status(404)
          .json({ msg: "Data payroll mingguan tidak ditemukan" });
      }

      const checkDataPayrollMingguanDetail =
        await PayrollMingguanDetail.findByPk(id_payroll_mingguan_detail);
      if (!checkDataPayrollMingguanDetail) {
        return res
          .status(404)
          .json({ msg: "Data payroll bulanan detail tidak ditemukan" });
      }

      await PayrollMingguanDetail.destroy({
        where: { id: id_payroll_mingguan_detail },
        transaction: t,
      });

      if (checkDataPayrollMingguanDetail.tipe === "potongan") {
        await PayrollMingguan.update(
          {
            total_potongan: Sequelize.literal(
              `total_potongan - ${checkDataPayrollMingguanDetail.total}`,
            ),
            sub_total_upah: Sequelize.literal(
              `sub_total_upah + ${checkDataPayrollMingguanDetail.total}`,
            ),
          },
          {
            where: {
              id: id_payroll_mingguan,
            },
            transaction: t,
          },
        );
      } else if (checkDataPayrollMingguanDetail.tipe === "bayaran") {
        await PayrollMingguan.update(
          {
            total_upah: Sequelize.literal(
              `total_upah - ${checkDataPayrollMingguanDetail.total}`,
            ),
            sub_total_upah: Sequelize.literal(
              `sub_total_upah - ${checkDataPayrollMingguanDetail.total}`,
            ),
          },
          {
            where: {
              id: id_payroll_mingguan,
            },
            transaction: t,
          },
        );
      } else {
      }

      await t.commit();
      res.status(200).json({
        msg: "delete berhasil",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PayrollBayarController;
