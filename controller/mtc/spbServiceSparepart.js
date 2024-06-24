const { Sequelize, where } = require("sequelize");
const MasterSparepart = require("../../model/masterData/masterSparepart");
const SpbServiceSparepart = require("../../model/mtc/spbServiceSparepart");
const ProsesMtc = require("../../model/mtc/prosesMtc");
const Ticket = require("../../model/maintenaceTicketModel");
const StokSparepart = require("../../model/mtc/stokSparepart");
const SpbStokSparepart = require("../../model/mtc/spbStokSparepart");

const SpbServiceSparepartController = {
  getSpbServiceSparepart: async (req, res) => {
    const { no_spb, tgl_spb, tgl_permintaan_kedatangan } = req.query;

    let obj = {};
    if (no_spb) obj.no_spb = no_spb;
    if (tgl_spb) obj.tgl_spb = tgl_spb;
    if (tgl_permintaan_kedatangan)
      obj.tgl_permintaan_kedatangan = tgl_permintaan_kedatangan;

    try {
      const response = await SpbServiceSparepart.findAll({
        where: obj,
        include: [{ model: MasterSparepart, as: "master_part" }],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getSpbServiceSparepartById: async (req, res) => {
    try {
      const response = await SpbServiceSparepart.findByPk(req.params.id, {
        include: [{ model: MasterSparepart, as: "master_part" }],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createSpbServiceSparepart: async (req, res) => {
    const {
      id_master_sparepart,
      id_proses,
      qty,
      tgl_permintaan_kedatangan,
      kriteria,
      note,
      kode_estimasi,
      sumber,
    } = req.body;

    if (
      !id_master_sparepart ||
      !id_proses ||
      !qty ||
      !tgl_permintaan_kedatangan ||
      !kode_estimasi ||
      !sumber
    )
      return res.status(404).json({ msg: "stok required" });

    try {
      const sparepart = await MasterSparepart.findByPk(id_master_sparepart);
      const proses = await ProsesMtc.findByPk(id_proses);
      const ticket = await Ticket.update(
        { bagian_tiket: "service", status: "requested" },
        { where: { id: proses.id_tiket } }
      );

      await SpbServiceSparepart.create({
        id_master_sparepart: sparepart.id,
        id_proses_os2: id_proses,
        qty: qty,
        tgl_spb: new Date(),
        no_spb: "",
        tgl_permintaan_kedatangan: tgl_permintaan_kedatangan,
        note: note,
        kriteria: kriteria,
        kode_estimasi: kode_estimasi,
        sumber: sumber,
        status_pengajuan: "request to mtc",
      });
      res.status(201).json({ msg: "Sparepart Requested Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  createManySpbServiceSparepart: async (req, res) => {
    const { serviceRequest, sparepartRequest, note } = req.body;

    if (
      !serviceRequest ||
      (serviceRequest == [] && !sparepartRequest) ||
      sparepartRequest == []
    )
      return res.status(404).json({ msg: "incomplite data" });

    try {
      if (serviceRequest != [] || serviceRequest != null) {
        for (let i = 0; i < serviceRequest.length; i++) {
          const sparepart = await MasterSparepart.findByPk(
            serviceRequest[i].id_master_sparepart
          );

          const proses = await ProsesMtc.findByPk(serviceRequest[i].id_proses);
          const ticket = await Ticket.update(
            { bagian_tiket: "service", status_tiket: "requested" },
            { where: { id: proses.id_tiket } }
          );

          await SpbServiceSparepart.create({
            id_master_sparepart: sparepart.id,
            id_proses_os2: serviceRequest[i].id_proses,
            qty: serviceRequest[i].qty,
            tgl_spb: new Date(),
            no_spb: "",
            tgl_permintaan_kedatangan:
              serviceRequest[i].tgl_permintaan_kedatangan,
            note: note,
            kriteria: serviceRequest[i].kriteria,
            kode_estimasi: serviceRequest[i].kode_estimasi,
            sumber: serviceRequest[i].sumber,
            status_pengajuan: "request to mtc",
          });
        }
      }

      if (sparepartRequest != [] || sparepartRequest != null) {
        for (let i = 0; i < sparepartRequest.length; i++) {
          const sparepart = await StokSparepart.findByPk(
            sparepartRequest[i].id_stok_sparepart
          );

          await SpbStokSparepart.create({
            id_stok_sparepart: sparepart.id,
            qty: sparepartRequest[i].qty,
            tgl_spb: new Date(),
            no_spb: "",
            tgl_permintaan_kedatangan:
              sparepartRequest[i].tgl_permintaan_kedatangan,
            note: note,
            kriteria: sparepartRequest[i].kriteria,
            kode_estimasi: sparepartRequest[i].kode_estimasi,
            sumber: sparepartRequest[i].sumber,
          });
        }
      }

      res.status(201).json({ msg: "Sparepart Requested Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateSpbServiceSparepart: async (req, res) => {
    const _id = req.params.id;
    const {
      id_master_sparepart,
      qty,
      tgl_permintaan_kedatangan,
      kriteria,
      note,
      kode_estimasi,
    } = req.body;

    let obj = {};
    if (id_master_sparepart) obj.id_master_sparepart = id_master_sparepart;
    if (qty) obj.qty = qty;
    if (tgl_permintaan_kedatangan)
      obj.tgl_permintaan_kedatangan = tgl_permintaan_kedatangan;
    if (kriteria) obj.kriteria = kriteria;
    if (note) obj.note = note;
    if (kode_estimasi) obj.kode_estimasi = kode_estimasi;

    try {
      await SpbServiceSparepart.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "spb update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMonitoringSpbServiceSparepart: async (req, res) => {
    const _id = req.params.id;
    const {
      tgl_po,
      no_po,
      suplier,
      harga_satuan,
      total_harga,
      status_pengajuan,
      tgl_aktual,
    } = req.body;

    let obj = {};
    if (tgl_po) obj.tgl_po = tgl_po;
    if (no_po) obj.no_po = no_po;
    if (suplier) obj.suplier = suplier;
    if (harga_satuan) obj.harga_satuan = harga_satuan;
    if (total_harga) obj.total_harga = total_harga;
    if (status_pengajuan) obj.status_pengajuan = status_pengajuan;
    if (tgl_aktual) obj.tgl_aktual = tgl_aktual;

    try {
      await SpbServiceSparepart.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "spb update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  approveSpbServiceSparepart: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const request = await SpbServiceSparepart.findByPk(_id);
      await SpbServiceSparepart.update(
        { incoming_sparepart: "ok" },
        { where: { id: _id } }
      );

      const proses = await ProsesMtc.findByPk(request.id_proses_os2);
      const ticket = await Ticket.update(
        { bagian_tiket: "service", status_tiket: "active" },
        { where: { id: proses.id_tiket } }
      );

      await MasterSparepart.update(
        { jenis_part: "service", umur_service: 360 },
        { where: { id: request.id_master_sparepart } }
      ),
        res.status(201).json({ msg: "Spb Stok Sparepart Done" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  tolakSpbStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const request = await SpbServiceSparepart.findByPk(_id);
      await SpbServiceSparepart.update(
        { status: "nok" },
        { where: { id: _id } }
      );

      res.status(201).json({ msg: "Request Stok Sparepart di Tolak" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  //   createStokSparepart: async (req, res) => {
  //     const {
  //       kode,
  //       nama_sparepart,
  //       nama_mesin,
  //       stok,
  //       part_number,
  //       lokasi,
  //       limit_stok,
  //       grade,
  //       type_part,
  //       foto,
  //       keterangan,
  //       umur_sparepart,
  //     } = req.body;
  //     if (!nama_sparepart || !nama_mesin || !umur_sparepart)
  //       return res.status(404).json({ msg: "incomplete data!!" });

  //     try {
  //       const response = await StokSparepart.create({
  //         kode,
  //         nama_sparepart,
  //         nama_mesin,
  //         stok: 0,
  //         part_number,
  //         lokasi,
  //         limit_stok,
  //         grade,
  //         type_part,
  //         foto,
  //         keterangan,
  //         umur_sparepart,
  //       });
  //       // await RequestStokSparepart.create({
  //       //   id_sparepart: response.id,
  //       //   stok: stok,
  //       //   kode,
  //       //   nama_sparepart,
  //       //   nama_mesin,
  //       //   jenis_part,
  //       //   persen,
  //       //   kebutuhan_bulanan,
  //       //   keterangan,
  //       //   umur_sparepart,
  //       //   vendor,
  //       //   req_sparepart_baru: true,
  //       // });
  //       res.status(200).json(response);
  //     } catch (error) {
  //       res.status(500).json({ msg: error.message });
  //     }
  //   },

  //   updateStokSparepart: async (req, res) => {
  //     const _id = req.params.id;
  //     const {
  //       kode,
  //       nama_sparepart,
  //       nama_mesin,
  //       jenis_part,
  //       persen,
  //       kebutuhan_bulanan,
  //       stok,
  //       keterangan,
  //       umur_sparepart,
  //       vendor,
  //     } = req.body;

  //     let obj = {};
  //     if (kode) obj.kode = kode;
  //     if (nama_sparepart) obj.nama_sparepart = nama_sparepart;
  //     if (nama_mesin) obj.nama_mesin = nama_mesin;
  //     if (umur_sparepart) obj.umur_sparepart = umur_sparepart;
  //     if (jenis_part) obj.jenis_part = jenis_part;
  //     if (persen) obj.persen = persen;
  //     if (kebutuhan_bulanan) obj.kebutuhan_bulanan = kebutuhan_bulanan;
  //     if (stok) obj.stok = stok;
  //     if (keterangan) obj.keterangan = keterangan;
  //     if (vendor) obj.vendor = vendor;

  //     try {
  //       await StokSparepart.update(obj, { where: { id: _id } }),
  //         res.status(201).json({ msg: "Sparepart update Successfuly" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   },

  //   deleteStokSparepart: async (req, res) => {
  //     const _id = req.params.id;
  //     try {
  //       await StokSparepart.destroy({ where: { id: _id } }),
  //         res.status(201).json({ msg: "Sparepart delete Successfuly" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   },

  //   approveRequestStokSparepart: async (req, res) => {
  //     const _id = req.params.id;
  //     const { note } = req.body;

  //     try {
  //       const request = await RequestStokSparepart.findByPk(_id);
  //       await RequestStokSparepart.update(
  //         { status: "approve", note: note },
  //         { where: { id: _id } }
  //       );

  //       const sparepart = await StokSparepart.findByPk(request.id_sparepart);
  //       const stok_sparepart = sparepart.stok + request.qty;

  //       await StokSparepart.update(
  //         { stok: stok_sparepart },
  //         { where: { id: request.id_sparepart } }
  //       ),
  //         res.status(201).json({ msg: "Request Stok Sparepart Approved" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   },

  //   tolakRequestStokSparepart: async (req, res) => {
  //     const _id = req.params.id;
  //     const { note } = req.body;

  //     try {
  //       const request = await RequestStokSparepart.findByPk(_id);
  //       await RequestStokSparepart.update(
  //         { status: "tolak", note: note },
  //         { where: { id: _id } }
  //       );

  //       if (request.req_sparepart_baru == true) {
  //         await StokSparepart.destroy({ where: { id: request.id_sparepart } });
  //       }

  //       res.status(201).json({ msg: "Request Stok Sparepart di Tolak" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   },

  //   addStokSparepart: async (req, res) => {
  //     const _id = req.params.id;
  //     const { new_stok } = req.body;

  //     if (!new_stok) return res.status(404).json({ msg: "stok required" });

  //     try {
  //       const sparepart = await StokSparepart.findByPk(_id);

  //       await RequestStokSparepart.create({
  //         id_stok_sparepart: sparepart.id,
  //         qty: new_stok,
  //       });
  //       res.status(201).json({ msg: "Sparepart Requested Successfuly" });
  //     } catch (error) {
  //       res.status(400).json({ msg: error.message });
  //     }
  //   },
};

module.exports = SpbServiceSparepartController;
