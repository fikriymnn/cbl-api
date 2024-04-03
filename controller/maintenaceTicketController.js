const Ticket = require("../model/maintenaceTicketModel");
const Users = require("../model/userModel")

const userController = {
    getTicket: async (req, res) => {
      try {
        const response = await Ticket.findAll();
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
        });
        res.status(200).json(response);
      } catch (error) {
        res.status(500).json({ msg: error.message });
      }
    },
  
    createTiket: async (req, res) => {
      const { idJo, noJo, namaProduk, noIo, noSo, namaCustomer,qty,qtyDruk,spek,proses,mesin,bagian,operator,tanggal,jenisKendala,idKendala,namaKendala } = req.body;

      try {
        await Ticket.create({
            idJo:idJo , 
            noJo:noJo , 
            namaProduk:namaProduk , 
            noIo: noIo, 
            noSo: noSo, 
            namaCustomer: namaCustomer,
            qty: qty,
            qtyDruk: qtyDruk,
            spek: spek,
            proses: proses,
            mesin:mesin ,
            bagian: bagian,
            operator: operator,
            tanggal: tanggal,
            jenisKendala: jenisKendala,
            idKendala: idKendala,
            namaKendala: namaKendala,
        }),
          res.status(201).json({ msg: "Ticket create Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    updateTiket: async (req, res) => {
      const _id = req.params.id;
      const { bagianTiket, statusTiket, statusJadwal,jadwalFrom,jadwalTo,responseTime,doneTime,idMtc,idQc } = req.body;

      let obj = {}
      if(bagianTiket){
        obj.bagianTiket =bagianTiket
      }
      if(statusTiket){
        obj.statusTiket =statusTiket
      }
      if(statusJadwal){
        obj.statusJadwal =statusJadwal
      }
      if(jadwalFrom){
        obj.jadwalFrom =jadwalFrom
      }
      if(jadwalTo){
        obj.jadwalTo =jadwalTo
      }
      if(responseTime){
        obj.responseTime =responseTime
      }
      if(doneTime){
        obj.doneTime =doneTime
      }
      if(idMtc){
        obj.idMtc =idMtc
      }
      if(idQc){
        obj.idQc =idQc
      }
      

      try {
        await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket update Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    updateTiketTypeMtc: async (req, res) => {
      const _id = req.params.id;
      const { typeMtc } = req.body;
      let obj = {}
      if(typeMtc){
        obj.typeMtc = typeMtc
        obj.responseTime = new Date()
        obj.idMtc = req.user.id
        obj.bagianTiket = "os2"
      }
      console.log(obj)
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket update Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },

    approveTiket: async (req, res) => {
      const _id = req.params.id;
      
      let obj = { 
        doneTime : new Date(),
        idQc : req.user.id,
        statusTiket: "done"
        
      }
     
      console.log(obj)
      try {
         await Ticket.update(obj,{where: {id:_id}}),
          res.status(201).json({ msg: "Ticket approved Successfuly" });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
    },
  };
  
  module.exports = userController;