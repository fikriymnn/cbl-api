const dbFinger = require("../../config/databaseFinger");

const userController = {
  getAbsensi: async (req, res) => {
    const { bagian, role } = req.query;

    // let obj = {};
    // if (role) obj.role = role;
    // if (bagian) obj.bagian = bagian;

    try {
      const results = await dbFinger.query(
        `
            SELECT CHECKINOUT.*, USERINFO.Name
            FROM CHECKINOUT
            INNER JOIN USERINFO ON CHECKINOUT.USERID = USERINFO.USERID
          `,
        {
          type: dbFinger.QueryTypes.SELECT,
        }
      );
      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = userController;
