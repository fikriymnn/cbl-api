const { Op } = require("sequelize");
const Ticket = require("../model/maintenaceTicketModel");
const Users = require("../model/userModel");
const userActionMtc = require("../model/mtc/userActionMtc");
const { createMasalahSparepart } = require("./mtc/sparepartProblem");
const MasalahSparepart = require("../model/mtc/sparepartProblem");
const StokSparepart = require("../model/mtc/stokSparepart");
const MasterSparepart = require("../model/masterData/masterSparepart");
const ProsesMtc = require("../model/mtc/prosesMtc");

const ticketController = {
  getTicket: async (req, res) => {
    try {
      const {
        status_tiket,
        type_mtc,
        jenis_kendala,
        nama_customer,
        bagian_tiket,
        mesin,
        tgl,
        start_date,
        end_date,
      } = req.query;

      let obj = {};

      if (status_tiket) obj.status_tiket = status_tiket;
      if (type_mtc) obj.type_mtc = type_mtc;
      if (jenis_kendala) obj.jenis_kendala = jenis_kendala;
      if (nama_customer) obj.nama_customer = nama_customer;
      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
      if (mesin) obj.mesin = mesin;
      if (tgl) obj.tgl = tgl;
      if (start_date && end_date) {
        obj.tgl = {
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

      const response = await Ticket.findAll({
        where: obj,
        include: [
          {
            model: ProsesMtc,
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getTiketById: async (req, res) => {
    try {
      const response = await Ticket.findOne({
        where: {
          id: req.params.id,
        },

        include: [
          // {
          //   model: userActionMtc,
          //   as: "user_tiket",
          //   include: [
          //     {
          //       model: Users,
          //       as: "user_mtc",
          //       attributes: [
          //         "id",
          //         "uuid",
          //         "nama",
          //         "email",
          //         "role",
          //         "no",
          //         "status",
          //       ],
          //     },
          //   ],
          // },
          {
            model: Users,
            as: "user_respon_mtc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },

          {
            model: ProsesMtc,
          },

          // {
          //   model: Users,
          //   as: "user_eksekutor",
          //   attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          // },
          // {
          //   model: Users,
          //   as: "user_qc",
          //   attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          // },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getTiketUser: async (req, res) => {
    try {
      const response = await Ticket.findAll({
        where: {
          id_eksekutor: req.user.id,
        },

        include: [
          {
            model: Users,
            as: "user_respon_mtc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Users,
            as: "user_eksekutor",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Users,
            as: "user_qc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createTiket: async (req, res) => {
    const {
      kode_lkh,
      id_jo,
      no_jo,
      nama_produk,
      no_io,
      no_so,
      nama_customer,
      qty,
      qty_druk,
      spek,
      proses,
      mesin,
      bagian,
      operator,
      tgl,
      jenis_kendala,
      id_kendala,
      nama_kendala,
    } = req.body;

    try {
      await Ticket.create({
        id_jo: id_jo,
        no_jo: no_jo,
        nama_produk: nama_produk,
        no_io: no_io,
        no_so: no_so,
        kode_lkh: kode_lkh,
        nama_customer: nama_customer,
        qty: qty,
        qty_druk: qty_druk,
        spek: spek,
        proses: proses,
        mesin: mesin,
        bagian: bagian,
        operator: operator,
        tgl: tgl,
        jenis_kendala: jenis_kendala,
        id_kendala: id_kendala,
        nama_kendala: nama_kendala,
      }),
        res.status(201).json({ msg: "Ticket create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateTiket: async (req, res) => {
    const _id = req.params.id;
    const {
      bagian_tiket,
      status_tiket,
      waktu_respon,

      tipe_mtc,

      id_qc,
    } = req.body;

    let obj = {};
    if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
    if (status_tiket) obj.status_tiket = status_tiket;
    if (waktu_respon) obj.waktu_respon = waktu_respon;
    if (tipe_mtc) obj.tipe_mtc = tipe_mtc;
    if (id_qc) obj.id_qc = id_qc;

    try {
      await Ticket.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Ticket update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  // updateTiketTypeMtc: async (req, res) => {
  //   const _id = req.params.id;
  //   const { tipe_mtc } = req.body;
  //   let obj = {}
  //   if(tipe_mtc){
  //     obj.tipe_mtc = tipe_mtc
  //   }

  //   try {
  //      await Ticket.update(obj,{where: {id:_id}}),
  //       res.status(201).json({ msg: "Ticket update Successfuly" });
  //   } catch (error) {
  //     res.status(400).json({ msg: error.message });
  //   }
  // },

  responseMtc: async (req, res) => {
    const _id = req.params.id;
    let obj = {
      id_respon_mtc: req.user.id,
      bagian_tiket: "os2",
      status_tiket: "open",
      waktu_respon: new Date(),
      waktu_mulai_mtc: new Date(),
    };

    const action = [
      {
        id_mtc: req.user.id,
        id_tiket: _id,
        action: "respon",
        status: "done",
      },
      {
        id_mtc: req.user.id,
        id_tiket: _id,
        action: "eksekutor",
        status: "on progress",
      },
    ];

    let prosesMtc = {
      id_tiket: _id,
      id_eksekutor: req.user.id,
      status_proses: "open",
      waktu_mulai_mtc: new Date(),
    };

    try {
      await Ticket.update(obj, { where: { id: _id } }),
        await ProsesMtc.create(prosesMtc);
      await userActionMtc.bulkCreate(action);
      res.status(201).json({ msg: "Respon Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  analisisMtc: async (req, res) => {
    const _id = req.params.id;

    const {
      id_proses,
      kode_analisis_mtc,
      note_analisis,
      masalah_sparepart,
      skor_mtc,
      cara_perbaikan,
      note_mtc,
      nama_mesin,
    } = req.body;

    if (
      !id_proses ||
      !kode_analisis_mtc ||
      !skor_mtc ||
      !cara_perbaikan ||
      !nama_mesin
    )
      return res.status(401).json({ msg: "incomplite data" });

    let obj = {
      status_tiket: "mtc selesai",
      kode_analisis_mtc: kode_analisis_mtc,
      waktu_selesai_mtc: new Date(),
      skor_mtc: skor_mtc,
      cara_perbaikan: cara_perbaikan,
    };

    let obj_proses = {
      status_proses: "mtc selesai",
      kode_analisis_mtc: kode_analisis_mtc,
      waktu_selesai_mtc: new Date(),
      skor_mtc: skor_mtc,
      cara_perbaikan: cara_perbaikan,
      note_mtc: note_mtc,
      note_analisis: note_analisis,
    };

    try {
      if (!masalah_sparepart || masalah_sparepart == []) {
        await Ticket.update(obj, { where: { id: _id } }),
          // await MasalahSparepart.bulkCreate(masalah_sparepart);

          await ProsesMtc.update(obj_proses, { where: { id: id_proses } }),
          await userActionMtc.update(
            { status: "done" },
            {
              where: {
                id_tiket: _id,
                action: "eksekutor",
                status: "on progress",
              },
            }
          );
        res.status(200).json({ msg: "Ticket maintenance finish Successfuly" });
      } else {
        let sparepart_masalah_data = [];
        await Ticket.update(
          { status_tiket: "mtc selesai" },
          { where: { id: _id } }
        ),
          await ProsesMtc.update(obj_proses, { where: { id: id_proses } }),
          await userActionMtc.update(
            { status: "done" },
            {
              where: {
                id_tiket: _id,
                action: "eksekutor",
                status: "on progress",
              },
            }
          );

        for (let i = 0; i < masalah_sparepart.length; i++) {
          const sparepartStok = await StokSparepart.findByPk(
            masalah_sparepart[i].id
          );

          const masterSparepart = await MasterSparepart.findOne({
            where: {
              nama_sparepart: sparepartStok.nama_sparepart,
              nama_mesin: nama_mesin,
            },
          });

          sparepart_masalah_data.push({
            id_tiket: _id,
            id_proses: id_proses,
            id_ms_sparepart: masterSparepart.id,
            id_stok_sparepart: sparepartStok.id,
            nama_sparepart_sebelumnya: masterSparepart.nama_sparepart,
            umur_sparepart_sebelumnya: masterSparepart.umur_sparepart,
            vendor_sparepart_sebelumnya: masterSparepart.vendor,
            jenis_part_sebelumnya: masterSparepart.jenis_part,
            nama_sparepart_baru: sparepartStok.nama_sparepart,
            umur_sparepart_baru: sparepartStok.umur_sparepart,
            vendor_sparepart_baru: sparepartStok.vendor,
            jenis_part_baru: sparepartStok.jenis_part,
            status: "done",
          });
        }

        await MasalahSparepart.bulkCreate(sparepart_masalah_data);

        for (let i = 0; i < sparepart_masalah_data.length; i++) {
          StokSparepart.findOne({
            where: { id: sparepart_masalah_data[i].id_stok_sparepart },
          }).then(async (stokSparepart) => {
            const stok = stokSparepart.stok - 1;
            await MasterSparepart.update(
              {
                nama_sparepart: stokSparepart.nama_sparepart,
                jenis_part: stokSparepart.jenis_part,
                umur_sparepart: stokSparepart.umur_sparepart,
                tgl_ganti: new Date(),
                vendor: stokSparepart.vendor,
              },
              { where: { id: sparepart_masalah_data[i].id_ms_sparepart } }
            );
            await StokSparepart.update(
              { stok: stok },
              { where: { id: stokSparepart.id } }
            );
          });
        }

        res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
      }
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }

    // try {
    //   await Ticket.update(obj, { where: { id: _id } }),
    //     res.status(201).json({ msg: "Update Successfuly" });
    // } catch (error) {
    //   res.status(400).json({ msg: error.message });
    // }
  },

  selectMtc: async (req, res) => {
    const _id = req.params.id;
    const { id_eksekutor, id_eksekutor_old, rework } = req.body;

    if (!id_eksekutor || !id_eksekutor_old || rework == null)
      return res.status(404).json({ msg: "incomplite data" });

    if (rework == false) {
      let obj = {
        id_eksekutor: id_eksekutor,
      };
      try {
        await Ticket.update(obj, { where: { id: _id } }),
          await userActionMtc.update(
            { status: "ubah eksekutor" },
            {
              where: {
                id_mtc: id_eksekutor_old,
                id_tiket: _id,
                action: "eksekutor",
                status: "on progress",
              },
            }
          );
        await userActionMtc.create({
          id_mtc: id_eksekutor,
          id_tiket: _id,
          action: "eksekutor",
          status: "on progress",
        });
        res.status(201).json({ msg: "Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    } else {
      let obj = {
        id_eksekutor_rework: id_eksekutor,
      };
      try {
        await Ticket.update(obj, { where: { id: _id } }),
          await userActionMtc.update(
            { status: "ubah eksekutor rework" },
            {
              where: {
                id_mtc: id_eksekutor_old,
                id_tiket: _id,
                action: "eksekutor rework",
                status: "on progress",
              },
            }
          );
        await userActionMtc.create({
          id_mtc: id_eksekutor,
          id_tiket: _id,
          action: "eksekutor rework",
          status: "on progress",
        });
        res.status(201).json({ msg: "Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    }
  },

  requestedDate: async (req, res) => {
    const _id = req.params.id;
    const { tgl_mtc } = req.body;
    let obj = {
      tgl_mtc: tgl_mtc,
      status_tiket: "pending",
    };

    try {
      await ProsesMtc.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Respon Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  approveDate: async (req, res) => {
    const _id = req.params.id;

    let obj = {
      status_tiket: "pending",
    };

    try {
      await ProsesMtc.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Date Approved" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  tolakDate: async (req, res) => {
    const _id = req.params.id;

    let obj = {
      status_tiket: "pending",
    };

    try {
      await ProsesMtc.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Date Declined" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  // beginTiket: async (req, res) => {
  //   const _id = req.params.id;

  //   let obj = {
  //     status_tiket: "on progress",
  //   };
  //   try {
  //     await Ticket.update(obj, { where: { id: _id } }),
  //       res.status(201).json({ msg: "Ticket maintenance begin Successfuly" });
  //   } catch (error) {
  //     res.status(400).json({ msg: error.message });
  //   }
  // },

  // finishMtc: async (req, res) => {
  //   const _id = req.params.id;
  //   const { skor_mtc, cara_perbaikan, note_mtc, rework } = req.body;
  //   if (!skor_mtc || !cara_perbaikan || rework == null)
  //     return res.status(401).json({ msg: "incomplite data" });

  //   if (rework == false) {
  //     try {
  //       let obj = {
  //         status_tiket: "mtc selesai",
  //         waktu_selesai_mtc: new Date(),
  //         skor_mtc: skor_mtc,
  //         cara_perbaikan: cara_perbaikan,
  //         note_mtc: note_mtc,
  //       };
  //       await Ticket.update(obj, { where: { id: _id } }),
  //         await userActionMtc.update(
  //           { status: "done" },
  //           {
  //             where: {
  //               id_tiket: _id,
  //               action: "eksekutor",
  //               status: "on progress",
  //             },
  //           }
  //         );

  //       const masalah = await MasalahSparepart.findAll({
  //         where: { id_tiket: _id, status: "on progress" },
  //       });

  //       if (!masalah || masalah == []) {
  //         for (let i = 0; i < masalah.length; i++) {
  //           StokSparepart.findOne({
  //             where: { id: masalah[i].id_stok_sparepart },
  //           }).then((stokSparepart) => {
  //             const stok = stokSparepart.stok - 1;
  //             MasterSparepart.update(
  //               {
  //                 nama_sparepart: stokSparepart.nama_sparepart,
  //                 jenis_part: stokSparepart.jenis_part,
  //                 umur_sparepart: stokSparepart.umur_sparepart,
  //                 tgl_ganti: new Date(),
  //                 vendor: stokSparepart.vendor,
  //               },
  //               { where: { id: masalah[i].id_ms_sparepart } }
  //             );
  //             StokSparepart.update(
  //               { stok: stok },
  //               { where: { id: stokSparepart.id } }
  //             );
  //             MasalahSparepart.update(
  //               { status: "done" },
  //               { where: { id: masalah[i].id } }
  //             );
  //           });
  //         }
  //       } else {
  //         console.log("tidak ada masalah");
  //       }

  //       res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   } else {
  //     try {
  //       let obj = {
  //         status_tiket: "monitoring",
  //         waktu_selesai_mtc_rework: new Date(),
  //         skor_mtc: skor_mtc,
  //         cara_perbaikan: cara_perbaikan,
  //         note_mtc: note_mtc,
  //       };
  //       await Ticket.update(obj, { where: { id: _id } }),
  //         await userActionMtc.update(
  //           { status: "done" },
  //           {
  //             where: {
  //               id_tiket: _id,
  //               action: "eksekutor rework",
  //               status: "on progress",
  //             },
  //           }
  //         );

  //       const masalah = await MasalahSparepart.findAll({
  //         where: { id_tiket: _id, status: "on progress" },
  //       });

  //       if (!masalah || masalah == []) {
  //         for (let i = 0; i < masalah.length; i++) {
  //           StokSparepart.findOne({
  //             where: { id: masalah[i].id_stok_sparepart },
  //           }).then((stokSparepart) => {
  //             const stok = stokSparepart.stok - 1;
  //             MasterSparepart.update(
  //               {
  //                 nama_sparepart: stokSparepart.nama_sparepart,
  //                 jenis_part: stokSparepart.jenis_part,
  //                 umur_sparepart: stokSparepart.umur_sparepart,
  //                 tgl_ganti: new Date(),
  //                 vendor: stokSparepart.vendor,
  //               },
  //               { where: { id: masalah[i].id_ms_sparepart } }
  //             );
  //             StokSparepart.update(
  //               { stok: stok },
  //               { where: { id: stokSparepart.id } }
  //             );
  //             MasalahSparepart.update(
  //               { status: "done" },
  //               { where: { id: masalah[i].id } }
  //             );
  //           });
  //         }
  //       } else {
  //         console.log("tidak ada masalah");
  //       }

  //       res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   }
  // },

  approveTiket: async (req, res) => {
    const _id = req.params.id;
    const { id_proses, note } = req.body;
    if (!id_proses) return res.status(404).json({ msg: "id proses required" });
    let obj = {
      waktu_selesai: new Date(),
      id_qc: req.user.id,
      status_proses: "monitoring",
      note_qc: note,
    };

    try {
      Ticket.update(
        { status_tiket: "monitoring", waktu_selesai: new Date() },
        { where: { id: _id } }
      );
      await ProsesMtc.update(obj, { where: { id: id_proses } }),
        res.status(201).json({ msg: "Ticket approved Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  tolakTiket: async (req, res) => {
    const _id = req.params.id;
    const { id_proses, note } = req.body;
    if (!id_proses) return res.status(404).json({ msg: "id proses required" });
    let obj = {
      waktu_selesai: new Date(),
      id_qc: req.user.id,
      status_proses: "qc rejected",
      note_qc: note,
    };

    try {
      Ticket.update(
        { status_tiket: "qc rejected", waktu_selesai: new Date() },
        { where: { id: _id } }
      );
      await ProsesMtc.update(obj, { where: { id: id_proses } }),
        res.status(201).json({ msg: "Ticket Tolak Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  reworkMtc: async (req, res) => {
    const _id = req.params.id;
    const { id_eksekutor } = req.body;
    if (!id_eksekutor)
      return res.status(401).json({ msg: "eksekutor required" });

    let obj = {
      status_tiket: "open",
      kode_analisis_mtc: null,
      waktu_mulai_mtc: new Date(),
      waktu_selesai_mtc: null,
      waktu_selesai: null,
      skor_mtc: 0,
      cara_perbaikan: null,
    };

    let prosesMtc = {
      id_tiket: _id,
      id_eksekutor: id_eksekutor,
      status_proses: "open",
      waktu_mulai_mtc: new Date(),
    };
    try {
      await Ticket.update(obj, { where: { id: _id } }),
        await ProsesMtc.create(prosesMtc);
      await userActionMtc.create({
        id_mtc: id_eksekutor,
        id_tiket: _id,
        action: "eksekutor",
        status: "on progress",
      });
      res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = ticketController;
