const { getAbsensiFunction } = require("../../helper/absenFunction");

const AbsensiController = {
  getAbsensi: async (req, res) => {
    const { idDepartment, is_active, startDate, endDate } = req.query;
    console.log(req.body);

    let obj = {};
    if (idDepartment) obj.id_department = idDepartment;
    if (is_active) obj.is_active = is_active;
    try {
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);
      res.status(200).json({ data: absenResult });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = AbsensiController;
