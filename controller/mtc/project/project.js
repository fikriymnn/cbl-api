const Project = require("../../../model/mtc/project/projectModel");
const SubProject = require("../../../model/mtc/project/subProjectModel");
const projectControllers = {
  getProject: async (req, res) => {
    const { id } = req.params;
    const { page, limit, task, start, end, days, done, work_days } = req.query;
    let obj = {};
    let offset = (page - 1) * limit;

    if (task) obj.task = task;
    if (start) obj.start = start;
    if (end) obj.end = end;
    if (days) obj.days = days;
    if (done) obj.done = done;
    if (work_days) obj.work_days = work_days;

    try {
      if (id) {
        const data = await Project.findOne({
          include: { model: SubProject, as: "sub_project" },
          where: { id },
        });
        res.json({ message: "OK", data });
      } else if (task || start || end || days || done || work_days) {
        console.log(obj);
        console.log("test");
        const data = await Project.findAll({
          include: { model: SubProject, as: "sub_project" },
          where: obj,
        });
        res.json({ message: "OK", data });
      } else if (page && limit) {
        console.log("test 2");
        const data = await Project.findAll({
          include: { model: SubProject, as: "sub_project" },
          offset: parseInt(offset),
          limit: parseInt(limit),
        });
        res.json({ message: "OK", data });
      } else {
        const data = await Project.findAll({
          include: { model: SubProject, as: "sub_project" },
        });
        res.json({ message: "OK", data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createProject: async (req, res) => {
    const { task, start, end, days, done, work_days, subProject } = req.body;
    console.log("test");
    if (!task && !start && !end && !days && !done && !work_days) {
      res.status(400).json({ msg: "Field is incomplete!" });
    }
    try {
      const data = await Project.create({
        task,
        start,
        end,
        days,
        done,
        work_days,
      });
      console.log(data);
      if (data && subProject) {
        for (let i = 0; i < subProject.length; i++) {
          await SubProject.create({
            id_project: data.id,
            task: subProject[i]?.task,
            start: subProject[i]?.start,
            end: subProject[i]?.end,
            days: subProject[i]?.days,
            done: subProject[i]?.done,
            work_days: subProject[i]?.work_days,
            lead: subProject[i]?.lead,
            qty: subProject[i]?.qty,
            problem: subProject[i]?.problem,
          });
        }
      }
      res.json({ message: "OK", data: "Create project successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  deleteProject: async (req, res) => {
    const { id } = req.params;
    try {
      await SubProject.destroy({ where: { id_project: id } });
      await Project.destroy({ where: { id } });
      res.json({ message: "OK", data: "Delete project successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  updateProject: async (req, res) => {
    const { id } = req.params;
    const { task, start, end, days, done, work_days } = req.body;
    let obj = {};

    if (task) obj.task = task;
    if (start) obj.start = start;
    if (end) obj.end = end;
    if (days) obj.days = days;
    if (done) obj.done = done;
    if (work_days) obj.work_days = work_days;
    try {
      await Project.update(obj, { where: { id } });
      res.json({ message: "OK", data: "Update project successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = projectControllers;
