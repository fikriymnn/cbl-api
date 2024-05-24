const { Op } = require("sequelize");
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

  getProsesMtcByTicket: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await ProsesMtc.findAll({
        where: {
          id_tiket: _id,
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
            use_qty: masalah_sparepart[i].use_qty,
          });
        }

        //await MasalahSparepart.bulkCreate(sparepart_masalah_data);

        for (let i = 0; i < sparepart_masalah_data.length; i++) {
          StokSparepart.findOne({
            where: { id: sparepart_masalah_data[i].id_stok_sparepart },
          }).then(async (stokSparepart) => {
            const stok = stokSparepart.stok - sparepart_masalah_data[i].use_qty;
            const percentage = stokSparepart.persen / 100;
            const umur = stokSparepart.umur_sparepart * percentage;

            await MasterSparepart.update(
              {
                nama_sparepart: stokSparepart.nama_sparepart,
                jenis_part: stokSparepart.jenis_part,
                umur_sparepart: umur,
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

  //ini fungsi untuk nanti cron job
  cekMonitoring: async (req, res) => {
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

      if (dateDiff === waktuMonitor && proses[i].skor_mtc >= minimalSkor) {
        await Ticket.update(
          { status_tiket: "closed" },
          { where: { id: proses[i].id_tiket } }
        );
        await ProsesMtc.update(
          { status_proses: "closed" },
          { where: { id: proses[i].id } }
        );
      }
    }
  },
};

module.exports = ProsessMtc;
