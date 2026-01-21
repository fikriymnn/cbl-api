const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiBarangRusakV2 = require("../../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const InspeksiBarangRusakPointV2 = require("../../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const InspeksiBarangRusakDefectV2 = require("../../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");
const MasterKodeDoc = require("../../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const User = require("../../../../../model/userModel");
const InspeksiBarangRusakV2Service = {
  getInspeksiBarangRusakV2Service: async ({
    id,
    status,
    tahapan,
    periode_tiket,
    no_jo,
    shift,
    operator,
    mesin,
    page,
    limit,
    search,
    start_date,
    end_date,
  }) => {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { item: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
      if (status) obj.status = status;
      if (tahapan) obj.tahapan = tahapan;
      if (periode_tiket) obj.periode_tiket = periode_tiket;
      if (no_jo) obj.no_jo = no_jo;
      if (shift) obj.shift = shift;
      if (operator) obj.operator = operator;
      if (mesin) obj.mesin = mesin;
      if (start_date && end_date) {
        obj.createdAt = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      } else if (start_date) {
        obj.tgl = {
          [Op.gte]: new Date(start_date).setHours(0, 0, 0, 0), // Set jam startDate ke 00:00:00:00
        };
      } else if (end_date) {
        obj.tgl = {
          [Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
        };
      }
      if (page && limit) {
        const length = await InspeksiBarangRusakV2.count({ where: obj });
        const data = await InspeksiBarangRusakV2.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: InspeksiBarangRusakPointV2,
              as: "inspeksi_barang_rusak_point_v2",
              attributes: ["id"],
              include: [
                {
                  model: User,
                  as: "inspektor",
                },
              ],
            },
          ],
        });

        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await InspeksiBarangRusakV2.findByPk(id, {
          include: [
            {
              model: InspeksiBarangRusakPointV2,
              as: "inspeksi_barang_rusak_point_v2",
              include: [
                {
                  model: InspeksiBarangRusakDefectV2,
                  as: "inspeksi_barang_rusak_defect_v2",
                },
                {
                  model: User,
                  as: "inspektor",
                },
                {
                  model: User,
                  as: "inspektor_edit",
                },
              ],
            },
            {
              model: User,
              as: "inspektor",
            },
          ],
        });

        const pointDefectSettingAwal = await InspeksiBarangRusakPointV2.findAll(
          {
            attributes: [
              [
                Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
                "jumlah_defect",
              ],
            ],

            where: {
              id_inspeksi_barang_rusak_v2: id,
              nama_pengecekan: "setting awal",
            },
          },
        );

        const pointDefectDrukAwal = await InspeksiBarangRusakPointV2.findAll({
          attributes: [
            [
              Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
              "jumlah_defect",
            ],
          ],

          where: {
            id_inspeksi_barang_rusak_v2: id,
            nama_pengecekan: "druk awal",
          },
        });

        const jumlahSettingAwal =
          pointDefectSettingAwal[0].jumlah_defect == null
            ? 0
            : parseInt(pointDefectSettingAwal[0].jumlah_defect);
        const jumlahDrukAwal =
          pointDefectDrukAwal[0].jumlah_defect == null
            ? 0
            : parseInt(pointDefectDrukAwal[0].jumlah_defect);
        const subTotal = jumlahSettingAwal + jumlahDrukAwal;
        const barangBaik = data.qty_rusak - subTotal;

        return {
          status_code: 200,
          success: true,
          data: data,
          settingAwal: jumlahSettingAwal,
          drukAwal: jumlahDrukAwal,
          subTotal: subTotal,
          barangBaik: barangBaik,
        };
      } else {
        const data = await InspeksiBarangRusakV2.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteInspeksiBarangRusakV2Service: async ({
    tahapan,
    periode_tiket,
    no_jo,
    no_io,
    status_jo,
    operator,
    nama_produk,
    customer,
    qty_rusak,
    qty_jo,
    mesin,
    shift,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const inspeksiBarangRusakV2 = await InspeksiBarangRusakV2.create({
        tanggal: new Date(),
        tahapan,
        periode_tiket,
        no_jo,
        no_io,
        operator,
        nama_produk,
        customer,
        qty_rusak,
        status_jo,
        qty_jo,
        shift,
        mesin,
      });
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      // Ubah dari throw object ke throw Error
      throw new Error(
        error.message || "Failed to create inspeksi barang rusak",
      );
    }
  },
};

module.exports = InspeksiBarangRusakV2Service;
