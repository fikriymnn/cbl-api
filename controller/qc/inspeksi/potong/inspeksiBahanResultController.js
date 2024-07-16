const inspeksiPotongResultController = {
    startInspeksiPotongResult : async (req,res)=>{
       try{

       }catch(err){
         res.status(500).json({msg: err.message})
       }
    },
    stopInspeksiPotongResult : async (req,res)=>{
        try{

        }catch(err){
          res.status(500).json({msg: err.message})
        }
    }
}

module.exports = inspeksiPotongResultController