const SubProject = require("../../../model/mtc/project/subProjectModel")
const Project = require("../../../model/mtc/project/projectModel")
const subProjectControllers = {
    getSubProject : async (req,res)=>{
        const {id} = req.params;
        if(!id) res.status(400).json({msg:"Sub project id does not exist!"})
        try{
            const data = await SubProject.findOne({ include: { model: Project,as:"project" }, where: { id } })
            res.json({ message: "OK", data })
        }catch(err){
            res.status(500).json({msg:err.message})
        }
    },
    // createSubProject : async (req,res)=>{
    //     const { task,lead,qty,problem,start, end, days, done, work_days } = req.body
    //     if (!task && !start && !end && !days && !done && !work_days && !lead && !qty && !problem) {
    //         res.status(400).json({ msg: "Field is incomplete!" })
    //     }
    //     try {
    //         const data = await Project.create({task, start, end, days, done, work_days})
    //         res.json({ message: "OK", data })
    //     } catch (err) {
    //         res.status(500).json({ msg: err.message })
    //     }
    // },
    deleteSubProject : async (req,res)=>{
        const {id} = req.params
        try{
            await SubProject.destroy({where:{id: id}}) 
            res.json({ message: "OK", data:"Delete sub project successfully!" })
        }catch(err){
            res.status(500).json({msg:err.message})
        }
    },
    updateSubProject : async (req,res)=>{
        const {id} = req.params
        const { task,lead,qty,problem,start, end, days, done, work_days } = req.body
        let obj = {}
        
        if (task) obj.task = task
        if (start) obj.start = start
        if (end) obj.end = end
        if (days) obj.days = days
        if (done) obj.done = done
        if (work_days) obj.work_days = work_days
        if (lead) obj.lead = lead
        if (qty) obj.qty = qty
        if (problem) obj.problem = problem

        try{
            await SubProject.update(obj,{where:{id}})
            res.json({ message: "OK", data:"Update sub project successfully!" })
        }catch(err){
            res.status(500).json({msg:err.message})
        }
    }
}

module.exports = subProjectControllers