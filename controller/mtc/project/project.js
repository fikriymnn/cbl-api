const Project = require("../../../model/mtc/project/projectModel")
const SubProject = require("../../../model/mtc/project/subProjectModel")
const projectControllers = {
    getProject: async (req, res) => {
        const { id } = req.params;
        const { page, limit } = req.query
        const { task, start, end, days, done, work_days } = req.body
        let obj = {}
        let offset = (page - 1) * limit

        if (task) obj.task = task
        if (start) obj.start = start
        if (end) obj.end = end
        if (days) obj.days = days
        if (done) obj.done = done
        if (work_days) obj.work_days = work_days

        try {
            if (id) {
                const data = await Project.findOne({ include: { model: SubProject }, where: { id } })
                res.json({ message: "OK", data })
            } else if (page && limit && (task || start || end || days || done || work_days)) {
                const data = await Project.findOne({ include: { model: SubProject }, where: obj, offset: parseInt(offset), limit: parseInt(limit) })
                res.json({ message: "OK", data })
            } else if (page && limit) {
                const data = await Project.findOne({ include: { model: SubProject }, offset: parseInt(offset), limit: parseInt(limit) })
                res.json({ message: "OK", data })
            } else {
                const data = await Project.findAll({ include: { model: SubProject } })
                res.json({ message: "OK", data })
            }
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    createProject: async (req, res) => {
        const { task, start, end, days, done, work_days } = req.body
        if (!task && !start && !end && !days && !done && !work_days) {
            res.status(400).json({ msg: "Field is incomplete!" })
        }
        try {
            const data = await Project.create({task, start, end, days, done, work_days})
            res.json({ message: "OK", data })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    deleteProject: async (req, res) => {
        const {id} = req.params
        try {
            await SubProject.destroy({where:{id_project: id}}) 
            await Project.destroy({where:{id}})
            res.json({ message: "OK", data:"Delete project successfully!" })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    },
    updateProject: async (req, res) => {
        const { id } = req.params;
        const { task, start, end, days, done, work_days } = req.body
        let obj = {}

        if (task) obj.task = task
        if (start) obj.start = start
        if (end) obj.end = end
        if (days) obj.days = days
        if (done) obj.done = done
        if (work_days) obj.work_days = work_days
        try {
            await Project.update(obj,{where:{id}})
            res.json({ message: "OK", data:"Update project successfully!" })
        } catch (err) {
            res.status(500).json({ msg: err.message })
        }
    }
}

module.exports = projectControllers