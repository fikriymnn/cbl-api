const { Op, where } = require("sequelize");
const Ticket = require("../../model/maintenaceTicketModel");
const Users = require("../../model/userModel");
const userActionMtc = require("../../model/mtc/userActionMtc");
const MasalahSparepart = require("../../model/mtc/sparepartProblem");
const StokSparepart = require("../../model/mtc/stokSparepart");
const MasterSparepart = require("../../model/masterData/masterSparepart");
const ProsesMtc = require("../../model/mtc/prosesMtc");
const waktuMonitoring = require("../../model/masterData/mtc/timeMonitoringModel");
const MasterMonitoring = require("../../model/masterData/mtc/timeMonitoringModel");
const moment = require("moment");

const ProsessMtc = {
  getProsesMtcById: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await ProsesMtc.findOne({
        where: {
          id: _id,
        },
        include: [
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
          {
            model: Ticket,
            as: "tiket",
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  getProsesMtc: async (req,res)=>{
    const {
      id_tiket,
      id_eksekutor,
      id_qc,
      status_proses,
      status_qc,
      waktu_mulai_mtc,
      waktu_selesai_mtc,
      waktu_selesai,
      tgl_mtc,
      estimasi_pengerjaan,
      skor_mtc,
      cara_perbaikan,
      kode_analisis_mtc,
      nama_analisis_mtc,
      alasan_pending,
      limit,page
    } = req.query
    
    let obj = {};
    let offset = (page-1)*limit
    if (id_tiket) obj.id_tiket = id_tiket;
    if (id_eksekutor) obj.id_eksekutor = id_eksekutor;
    if (id_qc) obj.id_qc = id_qc;
    if (status_proses) obj.status_proses = status_proses;
    if (status_qc) obj.status_qc = status_qc;
    if (waktu_mulai_mtc) obj.waktu_mulai_mtc = waktu_mulai_mtc;
    if (waktu_selesai_mtc) obj.waktu_selesai_mtc = waktu_selesai_mtc;
    if (waktu_selesai) obj.waktu_selesai = waktu_selesai;
    if (tgl_mtc) obj.tgl_mtc = tgl_mtc;
    if (estimasi_pengerjaan) obj.estimasi_pengerjaan = estimasi_pengerjaan;
    if (skor_mtc) obj.skor_mtc = skor_mtc;
    if (cara_perbaikan) obj.cara_perbaikan = cara_perbaikan;
    if (kode_analisis_mtc) obj.kode_analisis_mtc = kode_analisis_mtc;
    if (nama_analisis_mtc) obj.nama_analisis_mtc = nama_analisis_mtc;
    if (alasan_pending) obj.alasan_pending = alasan_pending;

    if(page&&limit){
      const length_data = await ProsesMtc.count({where:obj})
      const response = await ProsesMtc.findAll({
        limit:parseInt(limit),
        offset: parseInt(offset),
        where: obj,
        include: [
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

    res.status(200).json({data:response,total_page:Math.ceil(length_data/limit)});
    }else{
      const response = await ProsesMtc.findAll({
        where: obj,
        include: [
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
    }

  },
  getProsesMtcByTicket: async (req, res) => {
    const _id = req.params.id;
    try {
      let obj = {
        id_tiket: _id,
      }

      const response = await ProsesMtc.findAll({
        where: obj,
        include: [
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
      nama_analisis_mtc,
      note_analisis,
      masalah_sparepart,
      skor_mtc,
      cara_perbaikan,
      note_mtc,
      nama_mesin,
      image_url,
    } = req.body;

    if (
      !id_proses ||
      !kode_analisis_mtc ||
      !nama_analisis_mtc ||
      !skor_mtc ||
      !cara_perbaikan ||
      !nama_mesin
    )
      return res.status(401).json({ msg: "incomplite data" });

    const monitoring = await MasterMonitoring.findByPk(1);

    let status = "";
    if (skor_mtc <= monitoring.minimal_skor) {
      status = "temporary";
    } else if (skor_mtc > monitoring.minimal_skor) {
      status = "monitoring";
    }

    let obj = {
      status_tiket: status,

      kode_analisis_mtc: kode_analisis_mtc,
      nama_analisis_mtc: nama_analisis_mtc,
      waktu_selesai_mtc: new Date(),
      skor_mtc: skor_mtc,
      cara_perbaikan: cara_perbaikan,
    };

    let obj_proses = {
      status_proses: status,
      status_qc: "done",
      kode_analisis_mtc: kode_analisis_mtc,
      nama_analisis_mtc: nama_analisis_mtc,
      waktu_selesai_mtc: new Date(),
      skor_mtc: skor_mtc,
      cara_perbaikan: cara_perbaikan,
      note_mtc: note_mtc,
      note_analisis: note_analisis,
      //image_url: image_url,
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
        await Ticket.update(obj, { where: { id: _id } }),
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

        const ticketMtc = await Ticket.findByPk(_id);

        for (let i = 0; i < masalah_sparepart.length; i++) {
          const sparepartStok = await StokSparepart.findByPk(
            masalah_sparepart[i].id_stok
          );

          const masterSparepart = await MasterSparepart.findByPk(
            masalah_sparepart[i].id_ms_sparepart
          );

          sparepart_masalah_data.push({
            id_tiket: _id,
            id_proses: id_proses,
            id_ms_sparepart: masterSparepart.id,
            id_stok_sparepart: sparepartStok.id,
            nama_sparepart_sebelumnya: masterSparepart.nama_sparepart,
            lokasi_sparepart_sebelumnya: masterSparepart.posisi_part,
            grade_sparepart_sebelumnya: masterSparepart.grade_2,
            nama_sparepart_baru: sparepartStok.nama_sparepart,
            lokasi_sparepart_baru: sparepartStok.lokasi,
            grade_sparepart_baru: sparepartStok.grade,
            tgl_ganti: new Date(),
            status: "done",
            use_qty: 1,
          });
        }

        await MasalahSparepart.bulkCreate(sparepart_masalah_data);

        for (let i = 0; i < sparepart_masalah_data.length; i++) {
          StokSparepart.findOne({
            where: { id: sparepart_masalah_data[i].id_stok_sparepart },
          }).then(async (stokSparepart) => {
            const stok = stokSparepart.stok - sparepart_masalah_data[i].use_qty;
            let percentage = 1;
            let umurGrade = 100;
            if (stokSparepart.grade == "A") {
              percentage = 1;
              umurGrade = 100;
            } else if (stokSparepart.grade == "B") {
              percentage = 0.8;
              umurGrade = 80;
            } else if (stokSparepart.grade == "C") {
              percentage = 0.6;
              umurGrade = 60;
            } else if (stokSparepart.grade == "D") {
              percentage = 0.4;
              umurGrade = 40;
            } else if (stokSparepart.grade == "E") {
              percentage = 0.2;
              umurGrade = 20;
            }

            const umur = stokSparepart.umur_sparepart * percentage;

            await MasterSparepart.update(
              {
                nama_sparepart: stokSparepart.nama_sparepart,
                umur_a: stokSparepart.umur_sparepart,
                umur_grade: umurGrade,
                grade_2: stokSparepart.grade,
                actual_umur: umur,
                sisa_umur: umur,
                tgl_pasang: new Date(),
                tgl_rusak: ticketMtc.createdAt,
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
  },

  deleteProses: async (req, res) => {
    const _id = req.params.id;
    const { id_proses } = req.body;

    if (!id_proses) return res.status(401).json({ msg: "incomplite data" });

    try {
      await Ticket.update(
        { status_tiket: "temporary" },
        { where: { id: _id } }
      );
      await ProsesMtc.destroy({
        where: {
          id: id_proses,
        },
      }),
        res.status(201).json({ msg: "delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  pendingProses: async (req, res) => {
    const _id = req.params.id;
    const { id_proses, note_mtc, alasan_pending } = req.body;

    if (!id_proses || !alasan_pending)
      return res.status(404).json({ msg: "incomplite data" });

    let obj = {
      status_tiket: "pending",
    };

    let objProses = {
      status_proses: "pending",
      note_mtc: note_mtc,
      alasan_pending: alasan_pending,
    };

    try {
      await Ticket.update(obj, { where: { id: _id } });
      await ProsesMtc.update(objProses, { where: { id: id_proses } }),
        res.status(201).json({ msg: "Pending Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  requestedDate: async (req, res) => {
    const _id = req.params.id;
    const { tgl_mtc, id_proses, note_request_jadwal, estimasi_pengerjaan } =
      req.body;

    if (!tgl_mtc || !id_proses)
      return res.status(404).json({ msg: "incomplite data" });

    let obj = {
      //waktu_mulai_mtc: tgl_mtc,
      status_tiket: "pending",
    };

    let objProses = {
      //waktu_mulai_mtc: tgl_mtc,
      tgl_mtc: tgl_mtc,
      note_request_jadwal: note_request_jadwal,
      estimasi_pengerjaan: estimasi_pengerjaan,
      status_tiket: "pending",
    };

    try {
      await Ticket.update(obj, { where: { id: _id } });
      await ProsesMtc.update(objProses, { where: { id: id_proses } }),
        res.status(201).json({ msg: "Respon Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  approveDate: async (req, res) => {
    const _id = req.params.id;

    let obj = {
      status_tiket: "open",
    };

    let objProses = {
      status_proses: "open",
    };

    try {
      await ProsesMtc.update(objProses, { where: { id: _id } }),
        res.status(201).json({ msg: "Date Approved" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  tolakDate: async (req, res) => {
    const _id = req.params.id;

    let obj = {
      status_proses: "pending",
    };

    try {
      await ProsesMtc.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Date Declined" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

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

    const ticket = await Ticket.findByPk(_id);

    let obj = {
      status_tiket: "open",
      kode_analisis_mtc: null,
      waktu_mulai_mtc: new Date(),
      waktu_selesai_mtc: null,
      waktu_selesai: null,
      cara_perbaikan: null,
    };

    let prosesMtc = {
      id_tiket: _id,
      id_eksekutor: id_eksekutor,
      status_proses: "open",
      skor_mtc: ticket.skor_mtc,
      status_qc: "open",
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
      res.status(201).json({ msg: "Ticket maintenance rework Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  cekMonitoring: async (req, res) => {
    try {
      const proses = await ProsesMtc.findAll({
        where: { status_proses: "monitoring" },
      });
      const timeMonitoring = await waktuMonitoring.findAll();
      const waktuMonitor = timeMonitoring[0].waktu;
      const jenisMonitor = timeMonitoring[0].jenis;
      const minimalSkor = timeMonitoring[0].minimal_skor;

      for (let i = 0; i < proses.length; i++) {
        const fieldDate = proses[i].waktu_selesai_mtc; // Dapatkan nilai dari fieldDate
        const currentDate = moment();

        const dateDiff = currentDate.diff(fieldDate, jenisMonitor);

        if (dateDiff >= waktuMonitor && proses[i].skor_mtc >= minimalSkor) {
          await Ticket.update(
            { status_tiket: "closed", bagian_tiket: "histori os2" },
            { where: { id: proses[i].id_tiket } }
          );
          await ProsesMtc.update(
            { status_proses: "closed" },
            { where: { id: proses[i].id } }
          );
        } else {
        }
      }
      res.status(201).json({ msg: "berhasil" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  // requestService: async (req, res) => {
  //   const _id = req.params.id;
  //   const { id_eksekutor } = req.body;
  //   if (!id_eksekutor)
  //     return res.status(401).json({ msg: "eksekutor required" });

  //   const ticket = await Ticket.findByPk(_id);

  //   let obj = {
  //     status_tiket: "open",
  //     kode_analisis_mtc: null,
  //     waktu_mulai_mtc: new Date(),
  //     waktu_selesai_mtc: null,
  //     waktu_selesai: null,
  //     cara_perbaikan: null,
  //   };

  //   let prosesMtc = {
  //     id_tiket: _id,
  //     id_eksekutor: id_eksekutor,
  //     status_proses: "open",
  //     skor_mtc: ticket.skor_mtc,
  //     status_qc: "open",
  //     waktu_mulai_mtc: new Date(),
  //   };
  //   try {
  //     await Ticket.update(obj, { where: { id: _id } }),
  //       await ProsesMtc.create(prosesMtc);
  //     await userActionMtc.create({
  //       id_mtc: id_eksekutor,
  //       id_tiket: _id,
  //       action: "eksekutor",
  //       status: "on progress",
  //     });
  //     res.status(201).json({ msg: "Ticket maintenance rework Successfuly" });
  //   } catch (error) {
  //     res.status(400).json({ msg: error.message });
  //   }
  // },

  //ini fungsi untuk nanti cron job
};

module.exports = ProsessMtc;
