const masterMesin = require("../../model/masterData/masterMesinModel")

const masterMesinController = {
    getMasterMesin: async (req, res) => {
        try {
            const response = await masterMesin.findAll();
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },
    getMasterMesinById: async (req, res) => {
        try {
            const response = await masterMesin.findByPk(req.params.id);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    createMasterMesin: async (req, res)=>{
        const {serialNumber, machineName, machineType,machineLocation} = req.body;
        if(!serialNumber|| !machineName|| !machineType||!machineLocation)return res.status(404).json({msg:"incomplete data!!"})

        try {
            const response = await masterMesin.create({
                serialNumber:serialNumber,
                machineName:machineName,
                machineType:machineType,
                machineLocation:machineLocation
            })
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    },

    updateMasterMesin: async (req, res)=>{
        const _id = req.params.id;
        const {serialNumber, machineName, machineType,machineLocation} = req.body;

        let obj = {}
        if(serialNumber)obj.serialNumber = serialNumber;
        if(machineName)obj.machineName = machineName;
        if(machineType)obj.machineType = machineType;
        if(machineLocation)obj.machineLocation = machineLocation;

        try {
            await masterMesin.update(obj,{where: {id:_id}}),
              res.status(201).json({ msg: "Machine update Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    },

    deleteMasterMachine: async (req,res)=>{
        const _id = req.params.id;
        try {
            await masterMesin.destroy({where: {id:_id}}),
              res.status(201).json({ msg: "Machine delete Successfuly" });
          } catch (error) {
            res.status(400).json({ msg: error.message });
          }
    }
}

module.exports = masterMesinController;