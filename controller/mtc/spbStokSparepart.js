const { Sequelize, where } = require("sequelize");
const StokSparepart = require("../../model/mtc/stokSparepart");
const SpbStokSparepart = require("../../model/mtc/spbStokSparepart");

const SpbStokSparepartController = {
  getSpbStokSparepart: async (req, res) => {
    const {
      no_spb,
      tgl_spb,
      tgl_permintaan_kedatangan,
      id_stok_sparepart,
      kriteria,
      tgl_po,
      no_po,
      suplier,
      status_pengajuan,
      tgl_aktual,
      limit,
      page,
    } = req.query;

    let offset = (page - 1) * limit;
    let obj = {};
    if (no_spb) obj.no_spb = no_spb;
    if (tgl_spb) obj.tgl_spb = tgl_spb;
    if (tgl_permintaan_kedatangan)
      obj.tgl_permintaan_kedatangan = tgl_permintaan_kedatangan;
    if (id_stok_sparepart) obj.id_stok_sparepart = id_stok_sparepart;
    if (kriteria) obj.kriteria = kriteria;
    if (tgl_po) obj.tgl_po = tgl_po;
    if (no_po) obj.no_po = no_po;
    if (suplier) obj.suplier = suplier;
    if (status_pengajuan) obj.status_pengajuan = status_pengajuan;
    if (tgl_aktual) obj.tgl_aktual = tgl_aktual;

    try {
      if (page && limit) {
        const length_data = await SpbStokSparepart.count({ where: obj });
        const response = await SpbStokSparepart.findAll({
          where: obj,
          include: [{ model: StokSparepart }],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res
          .status(200)
          .json({ data: response, total_page: Math.ceil(length_data / limit) });
      } else {
        const response = await SpbStokSparepart.findAll({
          where: obj,
          include: [{ model: StokSparepart }],
        });
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getSpbStokSparepartById: async (req, res) => {
    try {
      const response = await SpbStokSparepart.findByPk(req.params.id, {
        include: [{ model: StokSparepart }],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createSpbStokSparepart: async (req, res) => {
    const {
      id_stok_sparepart,
      qty,
      tgl_permintaan_kedatangan,
      kriteria,
      note,
      kode_estimasi,
      sumber,
    } = req.body;

    if (
      !id_stok_sparepart ||
      !qty ||
      !tgl_permintaan_kedatangan ||
      !kode_estimasi ||
      !sumber
    )
      return res.status(404).json({ msg: "stok required" });

    try {
      const sparepart = await StokSparepart.findByPk(id_stok_sparepart);

      await SpbStokSparepart.create({
        id_stok_sparepart: sparepart.id,
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

  createManySpbStokSparepart: async (req, res) => {
    const { sparepartRequest } = req.body;

    if (!sparepartRequest || sparepartRequest == [])
      return res.status(404).json({ msg: "incomplite data" });

    try {
      console.log(sparepartRequest);
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
          note: sparepartRequest[i].note,
          kriteria: sparepartRequest[i].kriteria,
          kode_estimasi: sparepartRequest[i].kode_estimasi,
          sumber: sparepartRequest[i].sumber,
        });
      }

      res.status(201).json({ msg: "Sparepart Requested Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateSpbStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const {
      id_stok_sparepart,
      qty,
      tgl_permintaan_kedatangan,
      kriteria,
      note,
      kode_estimasi,
    } = req.body;

    let obj = {};
    if (id_stok_sparepart) obj.id_stok_sparepart = id_stok_sparepart;
    if (qty) obj.qty = qty;
    if (tgl_permintaan_kedatangan)
      obj.tgl_permintaan_kedatangan = tgl_permintaan_kedatangan;
    if (kriteria) obj.kriteria = kriteria;
    if (note) obj.note = note;
    if (kode_estimasi) obj.kode_estimasi = kode_estimasi;

    try {
      await SpbStokSparepart.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "spb update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMonitoringSpbStokSparepart: async (req, res) => {
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
      await SpbStokSparepart.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "spb update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  approveSpbStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const request = await SpbStokSparepart.findByPk(_id);
      await SpbStokSparepart.update(
        { incoming_sparepart: "ok" },
        { where: { id: _id } }
      );

      const sparepart = await StokSparepart.findByPk(request.id_stok_sparepart);
      const stok_sparepart = sparepart.stok + request.qty;

      await StokSparepart.update(
        { stok: stok_sparepart },
        { where: { id: request.id_stok_sparepart } }
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
      const request = await SpbStokSparepart.findByPk(_id);
      await SpbStokSparepart.update({ status: "nok" }, { where: { id: _id } });

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

module.exports = SpbStokSparepartController;
