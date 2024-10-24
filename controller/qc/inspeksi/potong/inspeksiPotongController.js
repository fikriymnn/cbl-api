const InspeksiPotong = require("../../../../model/qc/inspeksi/potong/inspeksiPotongModel");
const InspeksiPotongResult = require("../../../../model/qc/inspeksi/potong/inspeksiPotongResultModel");
const { Op, Sequelize } = require("sequelize");

const inspeksiPotongController = {
  getInspeksiPotongMesin: async (req, res) => {
    try {
      const mesin = await InspeksiPotong.findAll({
        attributes: ["mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        where: { status: "incoming" },
        group: ["mesin"],
        order: [[Sequelize.col("count"), "DESC"]],
      });
      res.status(200).json(mesin);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getInspeksiPotong: async (req, res) => {
    try {
      const { status, jenis_potong, mesin, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || jenis_potong || mesin)) {
        if (status) obj.status = status;
        if (jenis_potong) obj.jenis_potong = jenis_potong;
        if (mesin) obj.mesin = mesin;
        const data = await InspeksiPotong.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiPotong.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiPotong.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiPotong.count();
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || jenis_potong || mesin) {
        if (status) obj.status = status;
        if (jenis_potong) obj.jenis_potong = jenis_potong;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiPotong.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiPotong.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id && req.user.name) {
        const data = await InspeksiPotong.findByPk(id, {
          include: {
            model: InspeksiPotongResult,
            as: "inspeksi_potong_result",
          },
        });

        if (data && !data?.inspector) {
          await InspeksiPotong.update(
            { inspector: req.user.name },
            { where: { id } }
          );
        }

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiPotong.findAll({
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createInpeksiPotong: async (req, res) => {
    try {
      const {
        jenis_potong,
        tanggal,
        no_io,
        no_jo,
        operator,
        shift,
        jam,
        item,
        mesin,
        merk,
        customer,
        status_jo,
      } = req.body;

      if (!jenis_potong)
        return res.status(400).json({ msg: "Field jenis potong kosong!" });
      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      if (!no_io) return res.status(400).json({ msg: "Field no_io kosong!" });
      if (!no_jo) return res.status(400).json({ msg: "Field no_jo kosong!" });
      if (!mesin) return res.status(400).json({ msg: "Field mesin kosong!" });
      if (!operator)
        return res.status(400).json({ msg: "Field operator kosong!" });
      if (!shift) return res.status(400).json({ msg: "Field shift kosong!" });
      if (!jam) return res.status(400).json({ msg: "Field jam kosong!" });
      if (!item) return res.status(400).json({ msg: "Field item kosong!" });

      // const data_exist = await InspeksiPotong.findAll({
      //   order: [["createdAt", "DESC"]],
      //   limit: 1,
      // });
      // console.log(data_exist);
      // if (
      //   (data_exist || data_exist.length > 0) &&
      //   mesin == data_exist[0].mesin
      // ) {
      //   await InspeksiPotong.update(
      //     { status: "history" },
      //     { where: { id: data_exist[0].id } }
      //   );
      // }

      if (jenis_potong == "potong jadi") {
        const checkDataJadi = await InspeksiPotong.findOne({
          where: {
            no_jo: no_jo,
            status: "incoming",
            jenis_potong: "potong jadi",
          },
        });

        // if (checkDataJadi) {
        //   res.status(200).json({
        //     msg: "JO sedang di proses oleh QC pada proses Potong Jadi",
        //   });
        // } else {
        //   const data = await InspeksiPotong.create({
        //     jenis_potong,
        //     tanggal,
        //     no_io,
        //     no_jo,
        //     mesin,
        //     operator,
        //     shift,
        //     jam,
        //     item,
        //     merk,
        //     status_jo,
        //   });

        //   if (data) {
        //     let array = [];
        //     if (jenis_potong == "potong jadi") {
        //       master_data_fix_jadi.forEach((value) => {
        //         value.id_inspeksi_potong = data.id;
        //         array.push(value);
        //       });
        //     } else {
        //       master_data_fix.forEach((value) => {
        //         value.id_inspeksi_potong = data.id;
        //         array.push(value);
        //       });
        //     }

        //     await InspeksiPotongResult.bulkCreate(array);
        //   }
        //   res.status(200).json({ data, msg: "OK" });
        // }

        const data = await InspeksiPotong.create({
          jenis_potong,
          tanggal,
          no_io,
          no_jo,
          mesin,
          operator,
          shift,
          jam,
          item,
          merk,
          customer,
          status_jo,
        });

        if (data) {
          let array = [];
          if (jenis_potong == "potong jadi") {
            master_data_fix_jadi.forEach((value) => {
              value.id_inspeksi_potong = data.id;
              array.push(value);
            });
          } else {
            master_data_fix.forEach((value) => {
              value.id_inspeksi_potong = data.id;
              array.push(value);
            });
          }

          await InspeksiPotongResult.bulkCreate(array);
        }
        res.status(200).json({ data, msg: "OK" });
      } else {
        const checkDataJadi = await InspeksiPotong.findOne({
          where: {
            no_jo: no_jo,
            status: "incoming",
            jenis_potong: "potong bahan",
          },
        });

        // if (checkDataJadi) {
        //   res.status(200).json({
        //     msg: "JO sedang di proses oleh QC pada proses Potong Bahan",
        //   });
        // } else {
        //   const data = await InspeksiPotong.create({
        //     jenis_potong,
        //     tanggal,
        //     no_io,
        //     no_jo,
        //     mesin,
        //     operator,
        //     shift,
        //     jam,
        //     item,
        //     merk,
        //     status_jo,
        //   });

        //   if (data) {
        //     let array = [];
        //     if (jenis_potong == "potong jadi") {
        //       master_data_fix_jadi.forEach((value) => {
        //         value.id_inspeksi_potong = data.id;
        //         array.push(value);
        //       });
        //     } else {
        //       master_data_fix.forEach((value) => {
        //         value.id_inspeksi_potong = data.id;
        //         array.push(value);
        //       });
        //     }

        //     await InspeksiPotongResult.bulkCreate(array);
        //   }
        //   res.status(200).json({ data, msg: "OK" });
        // }

        const data = await InspeksiPotong.create({
          jenis_potong,
          tanggal,
          no_io,
          no_jo,
          mesin,
          operator,
          shift,
          jam,
          item,
          merk,
          customer,
          status_jo,
        });

        if (data) {
          let array = [];
          if (jenis_potong == "potong jadi") {
            master_data_fix_jadi.forEach((value) => {
              value.id_inspeksi_potong = data.id;
              array.push(value);
            });
          } else {
            master_data_fix.forEach((value) => {
              value.id_inspeksi_potong = data.id;
              array.push(value);
            });
          }

          await InspeksiPotongResult.bulkCreate(array);
        }
        res.status(200).json({ data, msg: "OK" });
      }
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  updateInspeksiPotong: async (req, res) => {
    try {
      const { id } = req.params;
      const { mesin, foto, lama_pengerjaan, waktu_selesai, catatan, merk } =
        req.body;
      let obj = {
        status: "history",
      };

      if (mesin) obj.mesin = mesin;
      if (foto) obj.foto = foto;
      if (lama_pengerjaan) obj.lama_pengerjaan = lama_pengerjaan;
      if (waktu_selesai) obj.waktu_selesai = waktu_selesai;
      if (catatan) obj.catatan = catatan;
      if (merk) obj.merk = merk;

      await InspeksiPotong.update(obj, {
        where: { id: id },
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
  startInspeksiPotong: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    try {
      await InspeksiPotong.update({ waktu_mulai: date }, { where: { id: id } }),
        res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  stopInspeksiPotong: async (req, res) => {
    const id = req.params.id;
    const lama_pengerjaan = req.body.lama_pengerjaan;
    const date = new Date();
    try {
      await InspeksiPotong.update(
        { waktu_selesai: date, lama_pengerjaan },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "stop successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  doneInspeksiPotong: async (req, res) => {
    try {
      const { id } = req.params;
      const { hasil_check, lama_pengerjaan, catatan, merk } = req.body;
      const date = new Date();
      let obj = {
        status: "history",
        waktu_selesai: date,
        lama_pengerjaan: lama_pengerjaan,
        catatan: catatan,
        merk: merk,
      };

      const inspeksi = await InspeksiPotong.update(obj, {
        where: { id: id },
      });

      for (let i = 0; i < hasil_check.length; i++) {
        const sample1 = hasil_check[i].sample_1;
        const sample2 = hasil_check[i].sample_2;
        const sample3 = hasil_check[i].sample_3;

        let hasilSample1 = 0;
        let hasilSample2 = 0;
        let hasilSample3 = 0;
        if (sample1) {
          hasilSample1 = (sample1 / 100) * 10000;
          hasilSample2 = (sample2 / 100) * 10000;
          hasilSample3 = (sample3 / 100) * 10000;
        }
        await InspeksiPotongResult.update(
          {
            hasil_check: hasil_check[i].hasil_check,
            keterangan: hasil_check[i].keterangan,
            standar: hasil_check[i].standar,
            hasil_panjang: hasil_check[i].hasil_panjang,
            hasil_lebar: hasil_check[i].hasil_lebar,
            sample_1: hasil_check[i].sample_1,
            sample_2: hasil_check[i].sample_2,
            sample_3: hasil_check[i].sample_3,
            hasil_sample_1: hasilSample1,
            hasil_sample_2: hasilSample2,
            hasil_sample_3: hasilSample3,
            send: true,
          },
          {
            where: { id: hasil_check[i].id },
          }
        );
      }
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  },
};

const master_data_fix = [
  {
    no: 1,
    point_check: "Jenis Kertas",
  },
  {
    no: 2,
    point_check: "Gramatur",
  },
  {
    no: 3,
    point_check: "Ukuran Potong",
  },
  {
    no: 4,
    point_check: "Arah Serat",
    standar: "Mounting di BOM",
  },
  {
    no: 5,
    point_check: "Hasil Timbang (10 X 10 cm)",
  },
];
const master_data_fix_jadi = [
  {
    no: 1,
    point_check: "Register",
  },
  {
    no: 2,
    point_check: "Ukuran",
  },
  {
    no: 3,
    point_check: "Ketajaman Pisau",
  },
  {
    no: 4,
    point_check: "Bentuk Jadi",
    standar: "Mounting di BOM",
  },
];

module.exports = inspeksiPotongController;
