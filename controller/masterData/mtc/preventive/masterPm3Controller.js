const masterTaskPm3 = require("../../../../model/masterData/mtc/preventive/pm3/inspectionTaskPm3Model");
const masterPointPm3 = require("../../../../model/masterData/mtc/preventive/pm3/inspenctionPoinPm3Model");

const { Sequelize } = require("sequelize");

const masterTaskPm3Controller = {
  getMasterPointPm3: async (req, res) => {
    const { id_mesin, nama_mesin } = req.query;
    let obj = {};

    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (id_mesin) obj.id_mesin = id_mesin;
    try {
      const response = await masterPointPm3.findAll({
        where: obj,
        include: [
          {
            model: masterTaskPm3,
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasterPointPm3ById: async (req, res) => {
    try {
      const response = await masterPointPm3.findByPk(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterPointPm3: async (req, res) => {
    const { id_mesin, nama_mesin, inspection_point } = req.body;
    if (!nama_mesin || !id_mesin || !inspection_point)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      for (let index = 0; index < inspection_point.length; index++) {
        const point = await masterPointPm3.create({
          id_mesin: id_mesin,
          nama_mesin: nama_mesin,
          inspection_point: inspection_point[index].inspection_point,
        });

        if (inspection_point[index].sub_inspection != []) {
          for (
            let i = 0;
            i < inspection_point[index].sub_inspection.length;
            i++
          ) {
            const response = await masterTaskPm3.create({
              id_inspection_poin: point.id,
              task: inspection_point[index].sub_inspection[i].task,
              acceptance_criteria:
                inspection_point[index].sub_inspection[i].acceptance_criteria,
              method: inspection_point[index].sub_inspection[i].method,
              tools: inspection_point[index].sub_inspection[i].tools,
            });
          }
        }
      }

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // createMasterPointPm3: async (req, res) => {
  //   const { id_mesin, nama_mesin, inspection_point, sub_inspection } = req.body;
  //   if (!id_mesin || !nama_mesin || !inspection_point || sub_inspection == [])
  //     return res.status(404).json({ msg: "incomplete data!!" });

  //   try {
  //     const point = await masterPointPm3.create({
  //       id_mesin,
  //       nama_mesin,
  //       inspection_point,
  //     });

  //     for (let i = 0; i < sub_inspection.length; i++) {
  //       const response = await masterTaskPm3.create({
  //         id_inspection_poin: point.id,
  //         task: sub_inspection[i].task,
  //         acceptance_criteria: sub_inspection[i].acceptance_criteria,
  //         method: sub_inspection[i].method,
  //         tools: sub_inspection[i].tools,
  //       });
  //     }

  //     res.status(200).json({ msg: "success" });
  //   } catch (error) {
  //     res.status(500).json({ msg: error.message });
  //   }
  // },

  createMasterTaskPm3: async (req, res) => {
    const { id_inspection_poin, task, acceptance_criteria, method, tools } =
      req.body;
    if (!id_inspection_poin || !task || !acceptance_criteria)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterTaskPm3.create({
        id_inspection_poin,
        task,
        acceptance_criteria,
        method,
        tools,
      });

      res.status(200).json({ msg: "success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterPointPm3: async (req, res) => {
    const _id = req.params.id;
    const { id_mesin, nama_mesin, inspection_point, ms_inspection_task_pm2s } =
      req.body;

    let obj = {};
    if (id_mesin) obj.id_mesin = id_mesin;
    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (inspection_point) obj.inspection_point = inspection_point;

    try {
      const point = await masterPointPm3.update(obj, { where: { id: _id } });

      if (ms_inspection_task_pm2s != [] || !ms_inspection_task_pm2s) {
        for (let i = 0; i < ms_inspection_task_pm2s.length; i++) {
          const response = await masterTaskPm3.update(
            {
              task: ms_inspection_task_pm2s[i].task,
              acceptance_criteria:
                ms_inspection_task_pm2s[i].acceptance_criteria,
              method: ms_inspection_task_pm2s[i].method,
              tools: ms_inspection_task_pm2s[i].tools,
            },
            { where: { id: ms_inspection_task_pm2s[i].id } }
          );
        }
      }

      res.status(201).json({ msg: "update success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterPointPm3: async (req, res) => {
    const _id = req.params.id;
    try {
      const point = await masterPointPm3.findByPk(_id, {
        include: [{ model: masterTaskPm3 }],
      });

      for (let i = 0; i < point.ms_inspection_task_pm2s.length; i++) {
        await masterTaskPm3.destroy({
          where: { id: point.ms_inspection_task_pm2s[i].id },
        });
      }
      await masterPointPm3.destroy({ where: { id: _id } });

      res.status(201).json({ msg: " delete Success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  deleteMasterTaskPm3: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterTaskPm3.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: " delete Success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterTaskPm3Controller;
