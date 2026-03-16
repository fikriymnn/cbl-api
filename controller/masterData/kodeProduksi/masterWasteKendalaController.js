const { Op } = require("sequelize");
const MasterKriteriaKendala = require("../../../model/masterData/kodeProduksi/masterKriteriaKendalaModel");
const MasterKategoriKendala = require("../../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterKodeProduksi = require("../../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const MasterWasteKendala = require("../../../model/masterData/kodeProduksi/masterWasteKendalaModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const db = require("../../../config/database");

const MasterWasteKendalaController = {
  getMasterWasteKendala: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, id_tahapan_produksi } = req.query;

    try {
      let obj = {
        //untuk awalan huruf
        kode: {
          [Op.regexp]: "^[A-Za-z]",
        },

        //untuk awalan angka
        // kode: {
        //   [Op.regexp]: "^\\d",
        // },
      };
      const offset = (page - 1) * limit;

      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (id_tahapan_produksi) obj.id_tahapan_produksi = id_tahapan_produksi;
      if (page && limit) {
        const length = await MasterKodeProduksi.count({ where: obj });
        const data = await MasterKodeProduksi.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
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
                },
              ],
            },
          ],
        });

        // olah dengan destructuring:

        const result = response
          .filter((item) => item.waste && item.waste.length > 0) // Filter dulu sebelum transform
          .map((item) => {
            const { waste, ...rest } = item.toJSON();
            return {
              ...rest,
              kendala: waste.map((w) => ({
                ...w.kode_kendala, // ambil semua field dari w
                id_waste_kendala: w.id, // tambahkan field id_waste_kendala
                status: "update", // tambahkan field status
              })),
            };
          });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: result,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await MasterKodeProduksi.findByPk(_id, {
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
              as: "kendala",
              include: [
                {
                  model: MasterKodeProduksi,
                  as: "kode_kendala",
                },
              ],
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterKodeProduksi.findAll({
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
                },
              ],
            },
          ],
        });
        // olah dengan destructuring:

        const result = response
          .filter((item) => item.waste && item.waste.length > 0) // Filter dulu sebelum transform
          .map((item) => {
            const { waste, ...rest } = item.toJSON();
            return {
              ...rest,
              kendala: waste.map((w) => ({
                ...w.kode_kendala, // ambil semua field dari w
                id_waste_kendala: w.id, // tambahkan field id_waste_kendala
                status: "update", // tambahkan field status
              })),
            };
          });
        res.status(200).json({ succes: true, status_code: 200, data: result });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  getMasterWasteKendalaFormating: async (req, res) => {
    try {
      let obj = {
        //untuk awalan huruf
        kode: {
          [Op.regexp]: "^[A-Za-z]",
        },

        //untuk awalan angka
        // kode: {
        //   [Op.regexp]: "^\\d",
        // },
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
      return res.status(200).json({
        succes: true,
        status_code: 200,
        waste: result,
      });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  getMasterWasteAllKendalaFormating: async (req, res) => {
    try {
      let obj = {
        kode: {
          [Op.regexp]: "^[A-Za-z]",
        },
      };

      const department = await MasterDepartment.findAll();

      const departmentMap = {};
      department.forEach((dept) => {
        departmentMap[dept.id] = dept.nama_department;
      });

      const data = await MasterKodeProduksi.findAll({
        where: obj,
        attributes: [
          "id",
          "id_tahapan_produksi",
          "proses_produksi",
          "kode",
          "deskripsi",
          "target_department",
        ],
        include: [
          {
            model: MasterTahapan,
            as: "tahapan",
          },
          {
            model: MasterKategoriKendala,
            as: "kategori_kendala",
          },
        ],
      });

      const formatted = data.map((item) => {
        let deptIds = [];
        try {
          let raw = item.target_department;
          if (typeof raw === "string") {
            raw = raw.replace(/^"+|"+$/g, "");
            deptIds = JSON.parse(raw);
          } else if (Array.isArray(raw)) {
            deptIds = raw;
          }
        } catch (e) {
          deptIds = [];
        }

        const targetDepartment = deptIds.map((deptId) => ({
          id_department: String(deptId),
          nama_department: departmentMap[deptId] || null,
        }));

        return {
          i_id: item.id,
          e_kode_produksi: item.kode,
          nama_kendala: item.deskripsi,
          criteria: "Major",
          criteria_percent: 1,
          id_proses: item.id_tahapan_produksi,
          nama_proses: item.tahapan?.nama_tahapan || null,
          kategori_kendala: item.kategori_kendala?.kategori || null,
          target_department: targetDepartment,
        };
      });

      // Hitung "kelengkapan" data berdasarkan jumlah field yang tidak null/kosong
      const getScore = (item) => {
        let score = 0;
        if (item.nama_kendala) score++;
        if (item.id_proses) score++;
        if (item.nama_proses) score++;
        if (item.kategori_kendala) score++;
        if (item.target_department && item.target_department.length > 0)
          score++;
        // Bonus score jika nama_department tidak null
        item.target_department.forEach((d) => {
          if (d.nama_department) score++;
        });
        return score;
      };

      // Deduplication: group by e_kode_produksi, ambil yang paling lengkap
      const deduped = Object.values(
        formatted.reduce((acc, item) => {
          const key = item.e_kode_produksi;
          if (!acc[key]) {
            acc[key] = item;
          } else {
            // Bandingkan score, simpan yang lebih tinggi
            if (getScore(item) > getScore(acc[key])) {
              acc[key] = item;
            }
          }
          return acc;
        }, {}),
      );

      return res.status(200).json(deduped);
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createMasterWasteKendala: async (req, res) => {
    const { data } = req.body;
    const t = await db.transaction();

    try {
      let dataWasteKendala = [];
      for (let i = 0; i < data.length; i++) {
        const e = data[i];
        for (let ii = 0; ii < e.kendala.length; ii++) {
          const ee = e.kendala[ii];
          dataWasteKendala.push({
            id_tahapan_produksi: e.id_tahapan_produksi,
            id_waste: e.id,
            id_kendala: ee.id,
          });
        }
      }
      await MasterWasteKendala.bulkCreate(dataWasteKendala, { transaction: t });
      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateMasterWasteKendala: async (req, res) => {
    const { data } = req.body;
    const t = await db.transaction();

    try {
      if (data) {
        // GANTI forEach dengan for...of
        for (const e of data) {
          //jika menambah waste kendala
          if (e.status === "new") {
            let dataWasteKendala = [];
            for (let ii = 0; ii < e.kendala.length; ii++) {
              const ee = e.kendala[ii];
              dataWasteKendala.push({
                id_tahapan_produksi: e.id_tahapan_produksi,
                id_waste: e.id,
                id_kendala: ee.id,
              });
            }
            await MasterWasteKendala.bulkCreate(dataWasteKendala, {
              transaction: t,
            });
          } else {
            // console.log(e.kendala);
            for (let i = 0; i < e.kendala.length; i++) {
              const element = e.kendala[i];
              if (element.status == "delete") {
                await MasterWasteKendala.destroy({
                  where: { id: element.id_waste_kendala },
                  transaction: t,
                });
              }

              if (element.status == "new") {
                await MasterWasteKendala.create(
                  {
                    id_tahapan_produksi: e.id_tahapan_produksi,
                    id_waste: e.id,
                    id_kendala: element.id,
                  },
                  { transaction: t },
                );
              }
            }
          }
        }

        await t.commit();
        res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Update 1 Successful",
        });
      }
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterKodeProduksi: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterKodeProduksi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      (await MasterKodeProduksi.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" }));
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterWasteKendalaController;
