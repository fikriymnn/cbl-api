const Ticket = require("../model/maintenaceTicketModel");

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
  };
  
  module.exports = userController;