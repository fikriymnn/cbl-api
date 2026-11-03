const { Op } = require("sequelize");
const MasterKategoriKendala = require("../../../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterKodeProduksi = require("../../../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterWasteKendala = require("../../../../model/masterData/kodeProduksi/masterWasteKendalaModel");

const MasterWasteKendalaService = {
  getMasterWasteKendalaFormatingService: async () => {
    try {
      let obj = {
        //untuk awalan huruf
        kode: {
          [Op.regexp]: "^[A-Za-z]",
        },
        is_active: true,
      };

      const data = await MasterKodeProduksi.findAll({
        where: obj,
        attributes: [
          "id",
          "id_tahapan_produksi",
          "proses_produksi",
          "kode",
          "deskripsi",
        ],
        include: [
          {
            model: MasterWasteKendala,
            as: "waste",
            include: [
              {
                model: MasterKodeProduksi,
                as: "kode_kendala",
                attributes: [
                  "id",
                  "id_tahapan_produksi",
                  "proses_produksi",
                  "kode",
                  "deskripsi",
                ],
                include: [
                  {
                    model: MasterKategoriKendala,
                    as: "kategori_kendala",
                  },
                ],
              },
            ],
          },
        ],
      });

      // olah dengan destructuring:
      const result = data
        .filter((item) => item.waste && item.waste.length > 0)
        .map((item) => {
          const { id, kode, deskripsi, waste } = item.toJSON();
          return {
            i_waste: id,
            kode_waste: kode,
            waste_desc: deskripsi,
            waste: waste.map((w) => ({
              i_kendala: w.kode_kendala.id,
              kode_kendala: w.kode_kendala.kode,
              kendala_desc: w.kode_kendala.deskripsi,
              kategori_kendala:
                w.kode_kendala.kategori_kendala?.kategori ?? null,
              bobot: 0,
            })),
          };
        });

      result.sort((a, b) =>
        a.kode_waste.localeCompare(b.kode_waste, undefined, {
          numeric: true,
        })
      );

      return {
        status: 200,
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },
};

module.exports = MasterWasteKendalaService;
