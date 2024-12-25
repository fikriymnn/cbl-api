const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanPinjaman = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const PayrollBulanan = require("../../../model/hr/payroll/payrollBulananModel");
const PayrollBulananDetail = require("../../../model/hr/payroll/payrollBulananDetailModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");

const db = require("../../../config/database");

const PayrollBayarController = {
  getPayrollBayarBulanan: async (req, res) => {
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
        const length = await PayrollBulanan.count({ where: obj });
        const data = await PayrollBulanan.findAll({
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
              model: PayrollBulananDetail,
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
        const data = await PayrollBulanan.findByPk(_id, {
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
              model: PayrollBulananDetail,
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
        const data = await PayrollBulanan.findAll({
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
              model: PayrollBulananDetail,
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

  createPayrollBayarBulanan: async (req, res) => {
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
      const dataPayrollbayar = await PayrollBulanan.create(
        {
          id_karyawan: dataKaryawanBiodata.id_karyawan,
          id_hr: req.user.id_karyawan,
          id_department: dataKaryawanBiodata.id_department,
          periode_dari,
          periode_sampai,
          total_upah: parseInt(data_payroll.total) + parseInt(insentifData),
          insentif: insentifData,
          total_potongan: data_payroll.total_potongan,
          gaji: data_payroll.gaji,
          tmk: data_payroll.tmk,
        },
        { transaction: t }
      );

      for (let i = 0; i < data_payroll.potonganSakit.length; i++) {
        const data = data_payroll.potonganSakit[i];
        await PayrollBulananDetail.create(
          {
            id_payroll_bulanan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "potongan",
          },
          { transaction: t }
        );
      }
      for (let i = 0; i < data_payroll.potonganIzin.length; i++) {
        const data = data_payroll.potonganIzin[i];
        await PayrollBulananDetail.create(
          {
            id_payroll_bulanan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "potongan",
          },
          { transaction: t }
        );
      }
      for (let i = 0; i < data_payroll.potonganMangkir.length; i++) {
        const data = data_payroll.potonganMangkir[i];
        await PayrollBulananDetail.create(
          {
            id_payroll_bulanan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "potongan",
          },
          { transaction: t }
        );
      }

      for (let i = 0; i < data_payroll.potongan.length; i++) {
        const data = data_payroll.potongan[i];
        await PayrollBulananDetail.create(
          {
            id_payroll_bulanan: dataPayrollbayar.id,
            label: data.label,
            jumlah: data.jumlah,
            nilai: data.nilai,
            total: data.total,
            tipe: "potongan",
          },
          { transaction: t }
        );
      }

      if (data_payroll.potonganPinjaman) {
        await PayrollBulananDetail.create(
          {
            id_payroll_bulanan: dataPayrollbayar.id,
            label: "pinjaman",
            jumlah: 1,
            nilai: data_payroll.potonganPinjaman.jumlah_cicilan,
            total: data_payroll.potonganPinjaman.jumlah_cicilan,
            tipe: "potongan",
          },
          { transaction: t }
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
          { where: { id: data_payroll.potonganPinjaman.id }, transaction: t }
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
};

module.exports = PayrollBayarController;
