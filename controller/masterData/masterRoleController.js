const masterRole = require("../../model/masterData/masterRoleModel");
const masterBagian = require("../../model/masterData/masterBagian");
const masterAkses = require("../../model/masterData/masterAkses/masterAksesModel");
const masterAksesParent1 = require("../../model/masterData/masterAkses/masterAksesParent1Model");
const masterAksesParent2 = require("../../model/masterData/masterAkses/masterAksesParent2Model");
const masterAksesParent3 = require("../../model/masterData/masterAkses/masterAksesParent3Model");
const masterAksesParent4 = require("../../model/masterData/masterAkses/masterAksesParent4Model");
const db = require("../../config/database");

const masterRoleController = {
  getMasterRole: async (req, res) => {
    const id = req.params.id;

    try {
      if (id) {
        // let akses1 = [];
        // let akses2 = [];
        // akses1 = await masterAkses.findAll({
        //   where: { is_group: false, is_main: true },
        // });

        // for (let i = 0; i < akses1.length; i++) {
        //   const data = await masterAkses.findOne({
        //     where: { id_parent_1: akses1[i].id },
        //   });
        //   akses2.push(data);

        //   //   akses1.forEach((value) => {
        //   //     value.parent = data;
        //   //   });
        // }

        const response = await masterRole.findByPk(id, {
          include: [
            {
              model: masterAkses,
              as: "akses",
              order: [["nama", "ASC"]],
              include: [
                {
                  model: masterAksesParent1,
                  as: "parent_1",
                  include: [
                    {
                      model: masterAksesParent2,
                      as: "parent_2",
                      include: [
                        {
                          model: masterAksesParent3,
                          as: "parent_3",
                          include: [
                            {
                              model: masterAksesParent4,
                              as: "parent_4",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });
        res.status(200).json({ data: response });
      } else {
        const response = await masterRole.findAll({});
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

    const t = await db.transaction();

    try {
      const response = await masterRole.create(
        {
          nama_role,
        },
        { transaction: t }
      );

      if (response) {
        let array = [];

        for (let i = 0; i < dataAkses.length; i++) {
          const data1 = dataAkses[i];
          const aksesMain = await masterAkses.create(
            {
              id_role: response.id,
              nama: data1.nama,
              bagian: data1.bagian,
              path_name: data1.path_name,
              is_dropdown: data1.is_dropdown,
              is_main: data1.is_main,
              is_group: data1.is_group,
              is_active: data1.is_active,
            },
            { transaction: t }
          );

          if (data1.parent && data1.parent.length > 0) {
            for (let j = 0; j < data1.parent.length; j++) {
              const data2 = data1.parent[j];
              const aksesParent1 = await masterAksesParent1.create(
                {
                  id_akses_main: aksesMain.id,
                  nama: data2.nama,
                  bagian: data2.bagian,
                  path_name: data2.path_name,
                  is_dropdown: data2.is_dropdown,
                  is_main: data2.is_main,
                  is_group: data2.is_group,
                  is_active: data2.is_active,
                },
                { transaction: t }
              );

              if (data2.parent && data2.parent.length > 0) {
                for (let k = 0; k < data2.parent.length; k++) {
                  const data3 = data2.parent[k];
                  const aksesParent2 = await masterAksesParent2.create(
                    {
                      id_akses_parent_1: aksesParent1.id,
                      nama: data3.nama,
                      bagian: data3.bagian,
                      path_name: data3.path_name,
                      is_dropdown: data3.is_dropdown,
                      is_main: data3.is_main,
                      is_group: data3.is_group,
                      is_active: data3.is_active,
                    },
                    { transaction: t }
                  );
                  if (data3.parent && data3.parent.length > 0) {
                    for (let l = 0; l < data3.parent.length; l++) {
                      const data4 = data3.parent[l];
                      const aksesParent3 = await masterAksesParent3.create(
                        {
                          id_akses_parent_2: aksesParent2.id,
                          nama: data4.nama,
                          bagian: data4.bagian,
                          path_name: data4.path_name,
                          is_dropdown: data4.is_dropdown,
                          is_main: data4.is_main,
                          is_group: data4.is_group,
                          is_active: data4.is_active,
                        },
                        { transaction: t }
                      );
                      if (data4.parent && data4.parent.length > 0) {
                        for (let m = 0; m < data4.parent.length; m++) {
                          const data5 = data4.parent[m];
                          const aksesParent4 = await masterAksesParent4.create(
                            {
                              id_akses_parent_3: aksesParent3.id,
                              nama: data5.nama,
                              bagian: data5.bagian,
                              path_name: data5.path_name,
                              is_dropdown: data5.is_dropdown,
                              is_main: data5.is_main,
                              is_group: data5.is_group,
                              is_active: data5.is_active,
                            },
                            { transaction: t }
                          );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      await t.commit();
      res.status(200).json({ msg: "created successfully" });
    } catch (error) {
      await t.rollback();
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
  //dashboard
  {
    nama: "Dashboard",
    bagian: "DASHBOARD",
    path_name: "/dashboard",
    is_dropdown: false,
    is_main: false,
    is_group: false,
    is_active: false,
    parent: [],
  },
  //pre press
  {
    nama: "Pre Press",
    bagian: "PREPRESS",
    path_name: "/prepress",
    is_dropdown: false,
    is_main: false,
    is_group: false,
    is_active: false,
    parent: [],
  },
  //Maintenance
  {
    nama: "",
    bagian: "MAINTENANCE",
    path_name: "/maintenance",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    is_active: true,
    parent: [
      {
        nama: "Maintenance",
        bagian: "Maintenance",
        path_name: "/maintenance/DashboardMaintenance",
        is_dropdown: true,
        is_main: false,
        is_group: true,
        is_active: false,
        parent: [
          //os2
          {
            nama: "Corrective (CM)",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/machine",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //path name pm
          {
            nama: "",
            bagian: "MAINTENANCE",
            path_name: "/inspection",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "Preventive (PM)",
                bagian: "MAINTENANCE",
                path_name: "/maintenance/inspection",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "PM 1",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/inspection/pm_1",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "PM 2",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/inspection/pm_2",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "PM 3",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/inspection/pm_3",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "OS 3",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/inspection/OS_3",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Histori PM",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/inspection/histori",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //path name KPI
          {
            nama: "",
            bagian: "MAINTENANCE",
            path_name: "/KPI",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: " KPI",
                bagian: "MAINTENANCE",
                path_name: "/maintenance/KPI",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "KPI Form",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/KPIForm",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                ],
              },
            ],
          },
          //path name sparepart
          {
            nama: "",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/sparepart",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "Sparepart",
                bagian: "MAINTENANCE",
                path_name: "/maintenance/sparepart",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Stock Master",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/stockmaster_sparepart",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Monitoring Sparepart",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/monitoringSparepart",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Monitoring Service",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/monitoringService",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Submit Op Name",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/opname/submitOpname",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Adjustment Op Neme",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/opname/adjustment",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Histori Op Name",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/opname/histori",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //path name Lapor
          {
            nama: "",
            bagian: "MAINTENANCE",
            path_name: "/lapor",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "LAPOR",
                bagian: "MAINTENANCE",
                path_name: "/maintenance/lapor",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "NCR",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/lapor/ncr",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "CAPA",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/lapor/capa",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Monitoring Service",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/monitoringService",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Submit Op Name",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/opname/submitOpname",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Adjustment Op Neme",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/opname/adjustment",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Histori Op Name",
                    bagian: "MAINTENANCE",
                    path_name: "/maintenance/sparepart/opname/histori",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //project mtc
          {
            nama: "Project Mtc Plan & Act",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/projectMtc",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //Outstanding
          {
            nama: "Outstanding",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/outstanding",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //absensi
          {
            nama: "Absensi",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/absensi",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //spb
          {
            nama: "SPB",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/spb",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //rekap
          {
            nama: "Rekap",
            bagian: "MAINTENANCE",
            path_name: "/maintenance/recap",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //path name master data
          {
            nama: "",
            bagian: "MAINTENANCE",
            path_name: "/masterdata",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "Master Data",
                bagian: "MAINTENANCE",
                path_name: "/masterdata",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Machine",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/machine",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Sparepart",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/mastersparepart",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Analisis",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masteranalisis",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "PM1",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masterpm1",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "PM2",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masterpm2",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "PM3",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masterpm3",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "KPI Form",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masterkpi",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Users",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masterUsers",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Role",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/masterRole",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Monitoring",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/mastermonitorin",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Grade",
                    bagian: "MAINTENANCE",
                    path_name: "/masterdata/grade",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  //quality controll
  {
    nama: "",
    bagian: "QC",
    path_name: "/qc",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    is_active: true,
    parent: [
      {
        nama: "Quality Control",
        bagian: "QC",
        path_name: "/qc",
        is_dropdown: true,
        is_main: false,
        is_group: true,
        is_active: false,
        parent: [
          //Validate & Verify
          {
            nama: "Validate & Verify",
            bagian: "QC",
            path_name: "/qc/validatenverify",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //Quality Inspection
          {
            nama: "Quality Inspection",
            bagian: "QC",
            path_name: "/qc/qualityinspection",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //absensi
          {
            nama: "Absensi",
            bagian: "QC",
            path_name: "/qc/absensi",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //outstanding
          {
            nama: "Outstanding",
            bagian: "QC",
            path_name: "/qc/outstanding",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //rekap
          {
            nama: "Rekap",
            bagian: "QC",
            path_name: "/qc/rekap",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },

          //path qms
          {
            nama: "",
            bagian: "QC",
            path_name: "/qms",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "QMS",
                bagian: "QC",
                path_name: "/qc/qms",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "NCR",
                    bagian: "QC",
                    path_name: "/qc/qms/ncr",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "CAPA",
                    bagian: "QC",
                    path_name: "/qc/qms/capa",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },

          //path name Lapor
          {
            nama: "",
            bagian: "QC",
            path_name: "/lapor",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              {
                nama: "LAPOR",
                bagian: "QC",
                path_name: "/qc/lapor",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "NCR",
                    bagian: "QC",
                    path_name: "/qc/lapor/ncr",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "CAPA",
                    bagian: "QC",
                    path_name: "/qc/lapor/capa",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //master data
          {
            nama: "",
            bagian: "QC",
            path_name: "/masterdataqc",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "Master Data",
                bagian: "QC",
                path_name: "/qc",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Defect",
                    bagian: "QC",
                    path_name: "/masterdataqc/defect",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Final Inspection",
                    bagian: "QC",
                    path_name: "/masterdataqc/finalInspection",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: " Outsourcing Barang Jadi",
                    bagian: "QC",
                    path_name: "/masterdataqc/outsourcing_bj",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "User",
                    bagian: "QC",
                    path_name: "/masterdataqc/users",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  //mr
  {
    nama: "",
    bagian: "MR",
    path_name: "/mr",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    is_active: true,
    parent: [
      {
        nama: "MR",
        bagian: "MR",
        path_name: "/qc",
        is_dropdown: true,
        is_main: false,
        is_group: true,
        is_active: false,
        parent: [
          //path qms
          {
            nama: "",
            bagian: "MR",
            path_name: "/qms",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "QMS",
                bagian: "QC",
                path_name: "/mr/qms",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "NCR",
                    bagian: "MR",
                    path_name: "/mr/qms/ncr",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "CAPA",
                    bagian: "MR",
                    path_name: "/mr/qms/capa",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },

          //path name Lapor
          {
            nama: "",
            bagian: "MR",
            path_name: "/lapor",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "LAPOR",
                bagian: "MR",
                path_name: "/mr/lapor",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "NCR",
                    bagian: "MR",
                    path_name: "/mr/lapor/ncr",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "CAPA",
                    bagian: "MR",
                    path_name: "/mr/lapor/capa",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  //HR
  //path name link grup
  {
    nama: "",
    bagian: "HUMAN RESOURCES",
    path_name: "/hr",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    is_active: true,
    parent: [
      //drop down human resource
      {
        nama: "Human Resource",
        bagian: "HUMAN RESOURCES",
        path_name: "/hr",
        is_dropdown: true,
        is_main: false,
        is_group: true,
        is_active: false,
        parent: [
          //path name human resource
          {
            nama: "",
            bagian: "HUMAN RESOURCES",
            path_name: "/pm",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "PERSONNEL MANAGEMENT",
                bagian: "HUMAN RESOURCES",
                path_name: "#",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Master Perusahaan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pm/masterperusahaan",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Master Karyawan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pm/masterkaryawan",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Kalender Kerja",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pm/kalenderkerja",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Absensi",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pm/absensi",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },

          {
            nama: "",
            bagian: "HUMAN RESOURCES",
            path_name: "/pengajuan",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //pengajuan
              {
                nama: "PENGAJUAN",
                bagian: "HUMAN RESOURCES",
                path_name: "/hr/pengajuan",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: " Buat Pengajuan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pengajuan",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Buat Pengajuan Jabatan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pengajuanJabatan",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "History Pengajuan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pengajuanhistory",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "History Pengajuan Jabatan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/pengajuanJabatanHistory",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //path name respon pengajuan
          {
            nama: "",
            bagian: "HUMAN RESOURCES",
            path_name: "/rp",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //respon pengajuan
              {
                nama: "RESPON PENGAJUAN",
                bagian: "HUMAN RESOURCES",
                path_name: "/hr/rp",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Respon Pengajuan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/rp/respon",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Respon Pengajuan Jabatan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/rp/jabatan",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "History Respon Pengajuan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/rp/history",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "History Pengajuan Jabatan",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/rp/jabatanHistory",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //payroll
          {
            nama: "Payroll",
            bagian: "HUMAN RESOURCES",
            path_name: "/hr/payroll",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //outstanding
          {
            nama: "Outstanding",
            bagian: "HUMAN RESOURCES",
            path_name: "/hr/outstanding",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //path name lapor ncr
          {
            nama: "",
            bagian: "HUMAN RESOURCES",
            path_name: "/lapor",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //respon pengajuan
              {
                nama: "LAPOR",
                bagian: "HUMAN RESOURCES",
                path_name: "/hr/lapor",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "NCR",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/lapor/ncr",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "CAPA",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/lapor/capa",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
          //masterdata hr
          {
            nama: "",
            bagian: "HUMAN RESOURCES",
            path_name: "/hr/master",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //respon pengajuan
              {
                nama: " MASTER DATA HR",
                bagian: "HUMAN RESOURCES",
                path_name: "hr/master",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Shift",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/master/shift",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                  {
                    nama: "Department",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/master/department",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Cuti Khusus",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/master/cutikhusus",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Grade HR",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/master/grade",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                  {
                    nama: "Payroll",
                    bagian: "HUMAN RESOURCES",
                    path_name: "/hr/master/payroll",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                    parent: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  //ppic
  {
    nama: "",
    bagian: "PPIC",
    path_name: "/ppic",
    is_dropdown: true,
    is_main: true,
    is_group: true,
    is_active: true,
    parent: [
      {
        nama: "PPIC",
        bagian: "PPIC",
        path_name: "/ppic",
        is_dropdown: true,
        is_main: false,
        is_group: true,
        is_active: false,
        parent: [
          //jadwal produksi
          {
            nama: "Jadwal Produksi",
            bagian: "PPIC",
            path_name: "/ppic/jadwalProduksi",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //outstanding
          {
            nama: "Outstanding",
            bagian: "PPIC",
            path_name: "/ppic/outstanding",
            is_dropdown: false,
            is_main: false,
            is_group: false,
            is_active: false,
            parent: [],
          },
          //path qms
          {
            nama: "",
            bagian: "PPIC",
            path_name: "/ppic/master",
            is_dropdown: true,
            is_main: true,
            is_group: true,
            is_active: true,
            parent: [
              //personel management
              {
                nama: "MASTER DATA PPIC",
                bagian: "PPIC",
                path_name: "/ppic/master",
                is_dropdown: true,
                is_main: false,
                is_group: true,
                is_active: false,
                parent: [
                  {
                    nama: "Master Kalkulasi",
                    bagian: "PPIC",
                    path_name: "/ppic/master/jadwal",
                    is_dropdown: false,
                    is_main: false,
                    is_group: false,
                    is_active: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

module.exports = masterRoleController;
