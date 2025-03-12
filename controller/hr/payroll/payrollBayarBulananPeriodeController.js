const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanPinjaman = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const PayrollBulanan = require("../../../model/hr/payroll/payrollBulananModel");
const PayrollBulananPeriode = require("../../../model/hr/payroll/payrollBulananPeriodeModel");
const PayrollBulananDetail = require("../../../model/hr/payroll/payrollBulananDetailModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");

const db = require("../../../config/database");

const PayrollBayarPeriodeBulananController = {
  getPayrollBayarBulananPeriode: async (req, res) => {
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
        const length = await PayrollBulananPeriode.count({ where: obj });
        const data = await PayrollBulananPeriode.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          include: [
            {
              model: PayrollBulanan,
              as: "payroll_detail_bulanan",
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
            },
          ],
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await PayrollBulananPeriode.findByPk(_id, {
          include: [
            {
              model: PayrollBulanan,
              as: "payroll_detail_bulanan",
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
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await PayrollBulananPeriode.findAll({
          order: [["createdAt", "DESC"]],

          include: [
            {
              model: PayrollBulanan,
              as: "payroll_detail_bulanan",
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
            },
          ],
          where: obj,
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPayrollBayarBulananPeriode: async (req, res) => {
    const { data_payroll } = req.body;

    const t = await db.transaction();

    try {
      const dataPayrollPeriode = await PayrollBulananPeriode.create(
        {
          id_hr: req.user.id_karyawan,
          periode_dari: data_payroll.periode_dari,
          periode_sampai: data_payroll.periode_sampai,
          tgl_bayar: new Date(),
          total: data_payroll.total,
          status: "incoming approved",
        },
        { transaction: t }
      );

      for (let i = 0; i < data_payroll.detail.length; i++) {
        const data = data_payroll.detail[i].summaryPayroll;
        const dataKaryawanBiodata = await KaryawanBiodata.findOne({
          where: { id_karyawan: data.id_karyawan },
        });

        if (!dataKaryawanBiodata)
          return res.status(404).json({ msg: "Kartyawan Tidak ditemukan" });
        const dataPayrollbayar = await PayrollBulanan.create(
          {
            id_payroll_periode_bulanan: dataPayrollPeriode.id,
            id_karyawan: dataKaryawanBiodata.id_karyawan,
            id_hr: req.user.id_karyawan,
            id_department: dataKaryawanBiodata.id_department,
            periode_dari: data_payroll.periode_dari,
            periode_sampai: data_payroll.periode_sampai,
            total_upah: parseInt(data.total),
            sub_total_upah: parseInt(data.sub_total),
            pengurangan_penambahan: parseInt(data.pengurangan_penambahan),
            note_pengurangan_penambahan: data.note_pengurangan_penambahan,
            total_potongan: data.total_potongan,
            gaji: data.gaji,
            tmk: data.tmk,
          },
          { transaction: t }
        );

        for (let i = 0; i < data.potonganSakit.length; i++) {
          const data1 = data.potonganSakit[i];
          await PayrollBulananDetail.create(
            {
              id_payroll_bulanan: dataPayrollbayar.id,
              label: data1.label,
              jumlah: data1.jumlah,
              nilai: data1.nilai,
              total: data1.total,
              tipe: "potongan",
            },
            { transaction: t }
          );
        }
        for (let i = 0; i < data.potonganIzin.length; i++) {
          const data2 = data.potonganIzin[i];
          await PayrollBulananDetail.create(
            {
              id_payroll_bulanan: dataPayrollbayar.id,
              label: data2.label,
              jumlah: data2.jumlah,
              nilai: data2.nilai,
              total: data2.total,
              tipe: "potongan",
            },
            { transaction: t }
          );
        }
        for (let i = 0; i < data.potonganMangkir.length; i++) {
          const data3 = data.potonganMangkir[i];
          await PayrollBulananDetail.create(
            {
              id_payroll_bulanan: dataPayrollbayar.id,
              label: data3.label,
              jumlah: data3.jumlah,
              nilai: data3.nilai,
              total: data3.total,
              tipe: "potongan",
            },
            { transaction: t }
          );
        }
        for (let i = 0; i < data.potongan.length; i++) {
          const data4 = data.potongan[i];
          await PayrollBulananDetail.create(
            {
              id_payroll_bulanan: dataPayrollbayar.id,
              label: data4.label,
              jumlah: data4.jumlah,
              nilai: data4.nilai,
              total: data4.total,
              tipe: "potongan",
            },
            { transaction: t }
          );
        }
        for (let i = 0; i < data.potongan_terlambat.length; i++) {
          const data5 = data.potongan_terlambat[i];
          await PayrollBulananDetail.create(
            {
              id_payroll_bulanan: dataPayrollbayar.id,
              label: data5.label,
              jumlah: data5.jumlah,
              nilai: data5.nilai,
              total: data5.total,
              tipe: "potongan",
            },
            { transaction: t }
          );
        }

        if (data.potonganPinjaman) {
          await PayrollBulananDetail.create(
            {
              id_payroll_bulanan: dataPayrollbayar.id,
              label: "pinjaman",
              jumlah: 1,
              nilai: data.potonganPinjaman.jumlah_cicilan,
              total: data.potonganPinjaman.jumlah_cicilan,
              tipe: "potongan",
            },
            { transaction: t }
          );

          const sisaPinjaman =
            data.potonganPinjaman.sisa_pinjaman -
            data.potonganPinjaman.jumlah_cicilan;

          await PengajuanPinjaman.update(
            {
              sisa_tempo_cicilan: data.potonganPinjaman.sisa_tempo_cicilan - 1,
              sisa_pinjaman: sisaPinjaman,
              status_pinjaman: sisaPinjaman == 0 ? "lunas" : "belum lunas",
            },
            { where: { id: data.potonganPinjaman.id }, transaction: t }
          );
        }
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

  approvePayrollBayarBulananPeriode: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      const dataPayrollPeriode = await PayrollBulananPeriode.update(
        {
          status: "incoming pay",
        },
        { where: { id: _id }, transaction: t }
      );

      await t.commit();
      res.status(200).json({
        msg: "pembayaran berhasil",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
  bayarPayrollBayarBulananPeriode: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      const dataPayrollPeriode = await PayrollBulananPeriode.update(
        {
          status: "done",
        },
        { where: { id: _id }, transaction: t }
      );

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

module.exports = PayrollBayarPeriodeBulananController;
