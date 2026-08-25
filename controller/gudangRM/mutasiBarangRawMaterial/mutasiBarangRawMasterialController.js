const { Op, Sequelize, where } = require("sequelize");
const MutasiBarangRawMaterialService = require("./service/mutasiBarangRawMaterialService");

const MutasiBarangRawMaterialController = {
  getMutasiBarangRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_item,
      id_jo_booking,
      sumber_mutasi,
      type_mutasi,
    } = req.query;

    try {
      const getData =
        await MutasiBarangRawMaterialService.getMutasiBarangRawMaterialService({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          search: search,
          id_item: id_item,
          id_jo_booking: id_jo_booking,
          sumber_mutasi: sumber_mutasi,
          type_mutasi: type_mutasi,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMutasiBarangRawMaterialByItem: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      sumber_mutasi,
      type_mutasi,
    } = req.query;

    try {
      const getData =
        await MutasiBarangRawMaterialService.getMutasiBarangRawMaterialByItem({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          search: search,
          sumber_mutasi: sumber_mutasi,
          type_mutasi: type_mutasi,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = MutasiBarangRawMaterialController;
