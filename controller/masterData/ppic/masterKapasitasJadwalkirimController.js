const MasterKapasitasJadwalKirim = require("../../../model/masterData/ppic/kapasitasJadwalKirim/masterKapasitasJadwalKirimModel");
const MasterKapasitasJadwalKirimArmada = require("../../../model/masterData/ppic/kapasitasJadwalKirim/masterKapasitasJadwalKirimArmadaModel");

const db = require("../../../config/database");

const masterKapasitasJadwalKirim = {
  getKapasitasJadwalKirim: async (req, res) => {
    const _id = req.params.id;

    try {
      if (_id) {
        const response = await MasterKapasitasJadwalKirim.findByPk(_id, {
          include: {
            model: MasterKapasitasJadwalKirimArmada,
            as: "armada",
          },
        });
        res.status(200).json({ data: response });
      } else {
        const response = await MasterKapasitasJadwalKirim.findAll({
          include: {
            model: MasterKapasitasJadwalKirimArmada,
            as: "armada",
          },
        });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createKapasitasJadwalKirim: async (req, res) => {
    const { no_io, customer, produk, cgd, cgs, isi_dus, armada } = req.body;
    const t = await db.transaction();

    try {
      if ((!no_io, !customer))
        return res
          .status(404)
          .json({ msg: "no io atau customer harus di isi" });
      if (armada.length == 0 || !armada)
        return res.status(404).json({ msg: "armada harus di isi" });
      const dataKapasitas = await MasterKapasitasJadwalKirim.create(
        {
          no_io,
          customer,
          produk,
          cgd,
          cgs,
          isi_dus,
        },
        { transaction: t }
      );
      const dataArmada = armada.map((item) => ({
        ...item,
        id_kapasitas_jadwal_kirim: dataKapasitas.id,
      }));

      await MasterKapasitasJadwalKirimArmada.bulkCreate(dataArmada, {
        transaction: t,
      });
      await t.commit();
      res.status(200).json({ msg: "create successful" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateKapasitasJadwalKirim: async (req, res) => {
    const _id = req.params.id;
    const { no_io, customer, produk, cgd, cgs, isi_dus, armada } = req.body;

    try {
      let obj = {};

      if (no_io) obj.no_io = no_io;
      if (customer) obj.customer = customer;
      if (produk) obj.produk = produk;
      if (cgd) obj.cgd = cgd;
      if (cgs) obj.cgs = cgs;
      if (isi_dus) obj.isi_dus = isi_dus;

      const datakapasitas = await MasterKapasitasJadwalKirim.findByPk(_id);
      if (!datakapasitas)
        return res.status(404).json({ msg: "data not found!!" });

      await MasterKapasitasJadwalKirim.update(obj, {
        where: { id: _id },
        transaction: t,
      });

      if (armada.length != 0 || armada) {
        for (let i = 0; i < armada.length; i++) {
          const e = armada[i];
          await MasterKapasitasJadwalKirimArmada.update(
            {
              nama_armada: e.nama_armada,
              kapasitas: e.kapasitas,
              jumlah_orang: e.jumlah_orang,
            },
            { where: { id: e.id }, transaction: t }
          );
        }
      }
      await t.commit();
      res.status(201).json({ msg: "Master update Successful" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  deleteKapasitasJadwalKirim: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const datakapasitas = await MasterKapasitasJadwalKirim.findByPk(_id);
      if (!datakapasitas)
        return res.status(404).json({ msg: "data not found!!" });

      await MasterKapasitasJadwalKirim.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await MasterKapasitasJadwalKirimArmada.destroy({
          where: { id_kapasitas_jadwal_kirim: datakapasitas.id },
          transaction: t,
        });
      await t.commit();
      res.status(201).json({ msg: "Master delete Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKapasitasJadwalKirim;
