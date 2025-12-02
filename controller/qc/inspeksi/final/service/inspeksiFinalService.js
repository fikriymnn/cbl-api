const db = require("../../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const InspeksiMasterPointFinal = require("../../../../../model/masterData/qc/inspeksi/masterPointFinalModel");
const InspeksiMasterSubFinal = require("../../../../../model/masterData/qc/inspeksi/masterSubFinalModel");
const InspeksiFinal = require("../../../../../model/qc/inspeksi/final/inspeksiFinalModel");
const InspeksiFinalPoint = require("../../../../../model/qc/inspeksi/final/inspeksiFinalPoint");
const InspeksiFinalSub = require("../../../../../model/qc/inspeksi/final/inspeksiFinalSubModel");
const User = require("../../../../../model/userModel");
const MasterKodeDoc = require("../../../../../model/masterData/qc/inspeksi/masterKodeDocModel");

const InspeksiFinalService = {
  creteInspeksiFinalService: async ({
    tanggal,
    id_jo,
    no_jo,
    no_io,
    quantity,
    jam,
    nama_produk,
    customer,
    status_jo,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const qtyFinal = quantity;
      const data = await InspeksiFinal.create(
        {
          tanggal,
          id_jo,
          no_jo,
          no_io,
          quantity,
          jam,
          nama_produk,
          customer,
          status_jo,
        },
        {
          transaction: t,
        }
      );

      const masterSubFinal = await InspeksiMasterSubFinal.findOne(
        {
          where: {
            [Op.and]: [
              { quantity_awal: { [Op.lte]: qtyFinal } },
              { quantity_akhir: { [Op.gte]: qtyFinal } },
            ],
          },
        },
        {
          transaction: t,
        }
      );

      const masterPointFinal = await InspeksiMasterPointFinal.findAll({
        where: { status: "active" },
      });

      if (masterSubFinal) {
        await InspeksiFinalSub.create(
          {
            id_inspeksi_final: data.id,
            quantity_awal: masterSubFinal.quantity_awal,
            quantity_akhir: masterSubFinal.quantity_akhir,
            jumlah: masterSubFinal.jumlah,
            kualitas_lulus: masterSubFinal.kualitas_lulus,
            kualitas_tolak: masterSubFinal.kualitas_tolak,
          },
          {
            transaction: t,
          }
        );
      }

      for (let i = 0; i < masterPointFinal.length; i++) {
        await InspeksiFinalPoint.create(
          {
            id_inspeksi_final: data.id,
            point: masterPointFinal[i].point,
            standar: masterPointFinal[i].standar,
            cara_periksa: masterPointFinal[i].cara_periksa,
          },
          {
            transaction: t,
          }
        );
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },
};

module.exports = InspeksiFinalService;
