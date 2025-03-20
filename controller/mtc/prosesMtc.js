const { Op, where } = require("sequelize");
const Ticket = require("../../model/maintenaceTicketModel");
const TicketDepartment = require("../../model/maintenanceTicketDepartmentModel");
const Users = require("../../model/userModel");
const userActionMtc = require("../../model/mtc/userActionMtc");
const MasalahSparepart = require("../../model/mtc/sparepartProblem");
const StokSparepart = require("../../model/mtc/stokSparepart");
const MasterSparepart = require("../../model/masterData/masterSparepart");
const ProsesMtc = require("../../model/mtc/prosesMtc");
const waktuMonitoring = require("../../model/masterData/mtc/timeMonitoringModel");
const MasterMonitoring = require("../../model/masterData/mtc/timeMonitoringModel");
const SpbService = require("../../model/mtc/spbServiceSparepart");
const NcrTicket = require("../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../model/qc/ncr/ncrKetidaksesuaianModel");
const moment = require("moment");
const db = require("../../config/database");

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
  getProsesMtc: async (req, res) => {
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
      limit,
      page,
    } = req.query;

    let obj = {};
    let offset = (page - 1) * limit;
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

    if (page && limit) {
      const length_data = await ProsesMtc.count({ where: obj });
      const response = await ProsesMtc.findAll({
        limit: parseInt(limit),
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

      res
        .status(200)
        .json({ data: response, total_page: Math.ceil(length_data / limit) });
    } else {
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

  getProsesHistoryQcMtc: async (req, res) => {
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
      start_date,
      end_date,
      limit,
      page,
      //untuk tiket
      type_mtc,
      jenis_kendala,
      no_jo,
      no_io,
      nama_customer,
      bagian_tiket,
      mesin,
    } = req.query;

    let obj = {
      id_qc: {
        [Op.ne]: null,
      },
    };
    let offset = (page - 1) * limit;
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
    if (start_date && end_date) {
      obj.createdAt = {
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

    let obj2 = {};

    // if (type_mtc) obj2.type_mtc = type_mtc;
    if (jenis_kendala) obj2.jenis_kendala = jenis_kendala;
    if (nama_customer) obj2.nama_customer = nama_customer;
    if (bagian_tiket) obj2.bagian_tiket = bagian_tiket;
    if (no_jo) obj2.no_jo = { [Op.like]: `%${no_jo}%` };
    if (no_io) obj2.no_io = { [Op.like]: `%${no_io}%` };
    if (mesin) obj2.mesin = mesin;

    try {
      if (page && limit) {
        const length_data = await ProsesMtc.count({
          where: obj,
          include: [
            {
              model: Ticket,
              as: "tiket",
              where: obj2,
            },
          ],
        });
        const response = await ProsesMtc.findAll({
          limit: parseInt(limit),
          offset: parseInt(offset),
          where: obj,
          order: [["waktu_selesai", "DESC"]],
          include: [
            {
              model: Users,
              as: "user_eksekutor",
              attributes: [
                "id",
                "uuid",
                "nama",
                "email",
                "role",
                "no",
                "status",
              ],
            },
            {
              model: Users,
              as: "user_qc",
              attributes: [
                "id",
                "uuid",
                "nama",
                "email",
                "role",
                "no",
                "status",
              ],
            },
            {
              model: Ticket,
              as: "tiket",
              where: obj2,
            },
          ],
        });

        res
          .status(200)
          .json({ data: response, total_page: Math.ceil(length_data / limit) });
      } else {
        const response = await ProsesMtc.findAll({
          where: obj,
          include: [
            {
              model: Users,
              as: "user_eksekutor",
              attributes: [
                "id",
                "uuid",
                "nama",
                "email",
                "role",
                "no",
                "status",
              ],
            },
            {
              model: Users,
              as: "user_qc",
              attributes: [
                "id",
                "uuid",
                "nama",
                "email",
                "role",
                "no",
                "status",
              ],
            },
            {
              model: Ticket,
              as: "tiket",
            },
          ],
        });

        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getProsesMtcByTicket: async (req, res) => {
    const _id = req.params.id;
    try {
      let obj = {
        id_tiket: _id,
      };

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
      jenis_analisis_mtc,
      note_analisis,
      masalah_sparepart,
      skor_mtc,
      cara_perbaikan,
      note_mtc,
      nama_mesin,
      unit,
      bagian_mesin,
      image_url,
    } = req.body;

    if (
      !id_proses ||
      !kode_analisis_mtc ||
      !jenis_analisis_mtc ||
      !nama_analisis_mtc ||
      !skor_mtc ||
      !cara_perbaikan ||
      !nama_mesin
    )
      return res.status(401).json({ msg: "incomplite data" });

    const monitoring = await MasterMonitoring.findByPk(1);
    const prosesData = await ProsesMtc.findByPk(id_proses);
    const tiketData = await Ticket.findByPk(_id, {
      include: [
        {
          model: TicketDepartment,
          as: "data_department",
        },
      ],
    });

    let status = "";
    if (skor_mtc < monitoring.minimal_skor) {
      status = "temporary";
    } else if (skor_mtc >= monitoring.minimal_skor) {
      status = "monitoring";
    }

    let obj = {};
    if (prosesData.is_rework == true) {
      obj = {
        status_tiket: "request to qc",
        kode_analisis_mtc: kode_analisis_mtc,
        nama_analisis_mtc: nama_analisis_mtc,
        jenis_analisis_mtc: jenis_analisis_mtc,
        skor_mtc: skor_mtc,
        cara_perbaikan: cara_perbaikan,
      };
    } else {
      obj = {
        status_tiket: "request to qc",
        kode_analisis_mtc: kode_analisis_mtc,
        nama_analisis_mtc: nama_analisis_mtc,
        jenis_analisis_mtc: jenis_analisis_mtc,
        waktu_selesai_mtc: new Date(),
        skor_mtc: skor_mtc,
        cara_perbaikan: cara_perbaikan,
      };
    }

    let obj_proses = {
      status_proses: status,
      status_qc: "requested",
      kode_analisis_mtc: kode_analisis_mtc,
      nama_analisis_mtc: nama_analisis_mtc,
      jenis_analisis_mtc: jenis_analisis_mtc,
      waktu_selesai_mtc: new Date(),
      skor_mtc: skor_mtc,
      cara_perbaikan: cara_perbaikan,
      note_mtc: note_mtc,
      note_analisis: note_analisis,
      unit: unit,
      bagian_mesin: bagian_mesin,
      //image_url: image_url,
    };

    const t = await db.transaction();

    try {
      if (prosesData.is_rework == false) {
        // Perbedaan dalam milidetik
        const diffInMs = Math.abs(new Date() - prosesData.waktu_mulai_mtc);
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); //dalam menit
        //const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); // Dalam jam

        if (diffInMinutes > tiketData.maksimal_waktu_pengerjaan) {
          console.log("masuk ncr");
          const userAnalisis = await Users.findByPk(req.user.id);
          const data = await NcrTicket.create(
            {
              id_pelapor: req.user.id,
              tanggal: new Date(),
              kategori_laporan: tiketData.jenis_kendala,
              nama_pelapor: userAnalisis.nama,
              department_pelapor: userAnalisis.bagian,
              no_jo: tiketData.no_jo,
              no_io: tiketData.no_io,
              nama_produk: tiketData.nama_produk,
            },
            { transaction: t }
          );

          for (let i = 0; i < tiketData.data_department.length; i++) {
            const elementdata = tiketData.data_department[i];

            const department = await NcrDepartment.create(
              {
                id_ncr_tiket: data.id,
                id_department: elementdata.id_department,
                department: elementdata.department,
              },
              { transaction: t }
            );

            await NcrKetidaksesuain.create(
              {
                id_department: department.id,
                ketidaksesuaian: `Melebihi batas waktu penanganan masalah ${tiketData.kode_lkh} ${tiketData.nama_kendala} pada jo ${tiketData.no_jo}`,
              },
              { transaction: t }
            );
          }
        }
      }
      if (
        !masalah_sparepart ||
        masalah_sparepart == [] ||
        masalah_sparepart.length == 0
      ) {
        await Ticket.update(obj, { where: { id: _id }, transaction: t }),
          // await MasalahSparepart.bulkCreate(masalah_sparepart);

          await ProsesMtc.update(obj_proses, {
            where: { id: id_proses },
            transaction: t,
          }),
          await userActionMtc.update(
            { status: "done" },
            {
              where: {
                id_tiket: _id,
                action: "eksekutor",
                status: "on progress",
              },
              transaction: t,
            }
          );

        // const requestSpbService = await SpbService.findAll({
        //   where: {
        //     id_proses_os2: id_proses,
        //     status_pengajuan: { [Op.or]: ["done", "section head verifikasi"] },
        //   },
        // });

        // for (
        //   let indexService = 0;
        //   indexService < requestSpbService.length;
        //   indexService++
        // ) {
        //   if (
        //     requestSpbService != [] ||
        //     requestSpbService != null ||
        //     requestSpbService.length != 0
        //   ) {
        //     //console.log(requestSpbService[0].id_master_sparepart);
        //     if (requestSpbService) {
        //       await MasterSparepart.update(
        //         {
        //           jenis_part: "service",
        //           umur_service: 360,
        //           tgl_pasang: new Date(),
        //           tgl_rusak: requestSpbService[indexService].tgl_spb,
        //         },
        //         {
        //           where: {
        //             id: requestSpbService[indexService].id_master_sparepart,
        //           },
        //         }
        //       );
        //     }
        //   }
        // }
        await t.commit();

        res.status(200).json({ msg: "Ticket maintenance finish Successfuly" });
      } else {
        let sparepart_masalah_data = [];
        await Ticket.update(obj, { where: { id: _id }, transaction: t }),
          await ProsesMtc.update(obj_proses, {
            where: { id: id_proses },
            transaction: t,
          }),
          await userActionMtc.update(
            { status: "done" },
            {
              where: {
                id_tiket: _id,
                action: "eksekutor",
                status: "on progress",
              },
              transaction: t,
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

        // for (let i = 0; i < sparepart_masalah_data.length; i++) {
        //   StokSparepart.findOne({
        //     where: { id: sparepart_masalah_data[i].id_stok_sparepart },
        //   }).then(async (stokSparepart) => {
        //     const stok = stokSparepart.stok - sparepart_masalah_data[i].use_qty;
        //     let percentage = 1;
        //     let umurGrade = 100;
        //     if (stokSparepart.grade == "A") {
        //       percentage = 1;
        //       umurGrade = 100;
        //     } else if (stokSparepart.grade == "B") {
        //       percentage = 0.8;
        //       umurGrade = 80;
        //     } else if (stokSparepart.grade == "C") {
        //       percentage = 0.6;
        //       umurGrade = 60;
        //     } else if (stokSparepart.grade == "D") {
        //       percentage = 0.4;
        //       umurGrade = 40;
        //     } else if (stokSparepart.grade == "E") {
        //       percentage = 0.2;
        //       umurGrade = 20;
        //     }

        //     const umur = stokSparepart.umur_sparepart * percentage;

        //     await MasterSparepart.update(
        //       {
        //         nama_sparepart: stokSparepart.nama_sparepart,
        //         umur_a: stokSparepart.umur_sparepart,
        //         umur_grade: umurGrade,
        //         grade_2: stokSparepart.grade,
        //         actual_umur: umur,
        //         sisa_umur: umur,
        //         tgl_pasang: new Date(),
        //         tgl_rusak: ticketMtc.createdAt,
        //         jenis_part: "ganti",
        //       },
        //       { where: { id: sparepart_masalah_data[i].id_ms_sparepart } }
        //     );
        //     await StokSparepart.update(
        //       { stok: stok },
        //       { where: { id: stokSparepart.id } }
        //     );
        //   });
        // }
        // const requestSpbService = await SpbService.findAll({
        //   where: {
        //     id_proses_os2: id_proses,
        //     status_pengajuan: { [Op.or]: ["done", "section head verifikasi"] },
        //   },
        // });

        // for (
        //   let indexService = 0;
        //   indexService < requestSpbService.length;
        //   indexService++
        // ) {
        //   if (
        //     requestSpbService != [] ||
        //     requestSpbService != null ||
        //     requestSpbService.length != 0
        //   ) {
        //     //console.log(requestSpbService[0].id_master_sparepart);
        //     if (requestSpbService) {
        //       await MasterSparepart.update(
        //         {
        //           jenis_part: "service",
        //           umur_service: 360,
        //           tgl_pasang: new Date(),
        //           tgl_rusak: requestSpbService[indexService].tgl_spb,
        //         },
        //         {
        //           where: {
        //             id: requestSpbService[indexService].id_master_sparepart,
        //           },
        //         }
        //       );
        //     }
        //   }
        // }
        await t.commit();
        res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
      }
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  verifikasiQc: async (req, res) => {
    const _id = req.params.id;
    const { id_proses, note_qc, id_qc } = req.body;
    if (!id_proses) return res.status(404).json({ msg: "incomplite data" });
    const t = await db.transaction();
    try {
      const monitoring = await MasterMonitoring.findByPk(1);
      const ticket = await Ticket.findByPk(_id);
      const prosesData = await ProsesMtc.findByPk(id_proses);

      let status = "";
      if (ticket.skor_mtc < monitoring.minimal_skor) {
        status = "temporary";
      } else if (ticket.skor_mtc >= monitoring.minimal_skor) {
        status = "monitoring";
      }

      if (prosesData.is_rework == true && ticket.waktu_selesai != null) {
        await Ticket.update(
          {
            status_tiket: status,
          },
          { where: { id: _id }, transaction: t }
        );
      } else {
        await Ticket.update(
          {
            status_tiket: status,
            waktu_selesai: new Date(),
          },
          { where: { id: _id }, transaction: t }
        );
      }

      await ProsesMtc.update(
        {
          note_qc: note_qc,
          id_qc: id_qc,
          waktu_selesai: new Date(),
          status_qc: "approved",
        },
        {
          where: {
            id: id_proses,
          },
          transaction: t,
        }
      );

      const masalahSparepart = await MasalahSparepart.findAll({
        where: { id_proses: id_proses },
      });

      if (masalahSparepart) {
        for (let i = 0; i < masalahSparepart.length; i++) {
          StokSparepart.findOne({
            where: { id: masalahSparepart[i].id_stok_sparepart },
          }).then(async (stokSparepart) => {
            const stok = stokSparepart.stok - masalahSparepart[i].use_qty;
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
                tgl_rusak: ticket.createdAt,
                jenis_part: "ganti",
              },
              {
                where: { id: masalahSparepart[i].id_ms_sparepart },
                transaction: t,
              }
            );
            await StokSparepart.update(
              { stok: stok },
              { where: { id: stokSparepart.id }, transaction: t }
            );
          });
        }
      }

      const requestSpbService = await SpbService.findAll({
        where: {
          id_proses_os2: id_proses,
          status_pengajuan: { [Op.or]: ["done", "section head verifikasi"] },
        },
      });

      for (
        let indexService = 0;
        indexService < requestSpbService.length;
        indexService++
      ) {
        if (
          requestSpbService != [] ||
          requestSpbService != null ||
          requestSpbService.length != 0
        ) {
          //console.log(requestSpbService[0].id_master_sparepart);
          if (requestSpbService) {
            await MasterSparepart.update(
              { jenis_part: "service", umur_service: 360 },
              {
                where: {
                  id: requestSpbService[indexService].id_master_sparepart,
                },
                transaction: t,
              }
            );
          }
        }
      }
      await t.commit();

      res.status(201).json({ msg: "Ticket maintenance finish Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  rejectQcTicket: async (req, res) => {
    const _id = req.params.id;
    const { id_proses, note_qc, id_qc } = req.body;
    if (!id_proses) return res.status(404).json({ msg: "incomplite data" });
    try {
      await Ticket.update(
        {
          status_tiket: "qc rejected",
        },
        { where: { id: _id } }
      );

      await ProsesMtc.update(
        {
          note_qc: note_qc,
          id_qc: id_qc,
          status_proses: "qc rejected",
          waktu_selesai: new Date(),
          status_qc: "rejected",
        },
        {
          where: {
            id: id_proses,
          },
        }
      );

      res.status(201).json({ msg: "Ticket maintenance reject Successfuly" });
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
      //status_tiket: "open",
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
      is_rework: true,
    };
    try {
      //await Ticket.update(obj, { where: { id: _id } }),
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

        if (dateDiff >= waktuMonitor) {
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
