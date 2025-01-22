const masterRole = require("../../model/masterData/masterRoleModel");
const masterBagian = require("../../model/masterData/masterBagian");
const masterAkses = require("../../model/masterData/masterAkses/masterAksesModel");

const masterRoleController = {
  getMasterRole: async (req, res) => {
    const id = req.params.id;

    try {
      if (id) {
        let akses1 = [];
        let akses2 = [];
        akses1 = await masterAkses.findAll({
          where: { is_group: false, is_main: true },
        });

        for (let i = 0; i < akses1.length; i++) {
          const data = await masterAkses.findOne({
            where: { id_parent_1: akses1[i].id },
          });
          akses2.push(data);

          //   akses1.forEach((value) => {
          //     value.parent = data;
          //   });
        }

        const response = await masterRole.findByPk(id, {
          include: [
            {
              model: masterBagian,
              as: "bagian",
            },
            {
              model: masterAkses,
              as: "akses",
            },
          ],
        });
        res.status(200).json({ data: response, menu: akses2 });
      } else {
        const response = await masterRole.findAll({
          include: {
            model: masterBagian,
            as: "bagian",
          },
        });
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterRole: async (req, res) => {
    const { nama_role, id_bagian } = req.body;
    if (!nama_role)
      return res.status(404).json({ msg: "nama role wajib di isi!!" });
    if (!id_bagian)
      return res.status(404).json({ msg: "bagian wajib di isi!!" });

    try {
      const response = await masterRole.create({
        nama_role,
        id_bagian,
      });

      if (response) {
        let array = [];

        dataAkses.forEach((value) => {
          value.id_role = response.id;
          array.push(value);
        });

        if (array.length == 4) {
          for (let i = 0; i < dataAkses.length; i++) {
            const data1 = dataAkses[i];
            console.log(data1);
            const akses = await masterAkses.create({
              id_role: data1.id_role,
              nama: data1.nama,
              bagian: data1.bagian,
              path_name: data1.path_name,
              is_dropdown: data1.is_dropdown,
              is_main: data1.is_main,
              is_group: data1.is_group,
            });

            if (data1.parent != null || data1.parent.length > 0) {
              for (let ii = 0; ii < data1.parent.length; ii++) {
                const data2 = data1.parent[ii];
                const akses2 = await masterAkses.create({
                  id_role: data1.id_role,
                  nama: data2.nama,
                  bagian: data2.bagian,
                  path_name: data2.path_name,
                  is_dropdown: data2.is_dropdown,
                  is_main: data2.is_main,
                  is_group: data2.is_group,
                  id_parent_1: akses.id,
                });

                if (data2.parent != null || data2.parent.length > 0) {
                  for (let iii = 0; iii < data2.parent.length; iii++) {
                    const data3 = data2.parent[iii];
                    console.log(data3);
                    const akses3 = await masterAkses.create({
                      id_role: data1.id_role,
                      nama: data3.nama,
                      bagian: data3.bagian,
                      path_name: data3.path_name,
                      is_dropdown: data3.is_dropdown,
                      is_main: data3.is_main,
                      is_group: data3.is_group,
                      id_parent_2: akses2.id,
                    });
                  }
                }
              }
            }
          }
          //   await masterAkses.bulkCreate(array);
        }
      }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterRole: async (req, res) => {
    const _id = req.params.id;
    const { nama_role, id_bagian } = req.body;

    let obj = {};
    if (nama_role) obj.nama_role = nama_role;
    if (id_bagian) obj.id_bagian = id_bagian;

    try {
      await masterRole.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Role update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterRole: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterRole.update({ status: "non active" }, { where: { id: _id } }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

const dataAkses = [
  {
    nama: "",
    bagian: "MAINTENANCE",
    path_name: "/maintenance",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    parent: [],
  },
  {
    nama: "Maintenance",
    bagian: "MAINTENANCE",
    path_name: "/maintenance/DashboardMaintenance",
    is_dropdown: true,
    is_main: true,
    is_group: false,
    parent: [
      {
        nama: "Corrective (CM)",
        bagian: "MAINTENANCE",
        path_name: "/maintenance/machine",
        is_dropdown: false,
        is_main: false,
        is_group: false,
        id_parent_1: 1,
        parent: [],
      },
    ],
  },
  {
    nama: "",
    bagian: "INSPECTION",
    path_name: "/inspection",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    id_parent: 0,
    parent: [],
  },
  {
    nama: "Preventive (PM)",
    bagian: "MAINTENANCE",
    path_name: "/maintenance/inspection",
    is_dropdown: true,
    is_main: true,
    is_group: false,
    parent: [
      {
        nama: "PM 1",
        bagian: "MAINTENANCE",
        path_name: "/maintenance/inspection/pm_1",
        is_dropdown: false,
        is_main: false,
        is_group: false,
        id_parent_1: 1,
        parent: [],
      },
    ],
  },
];

module.exports = masterRoleController;
