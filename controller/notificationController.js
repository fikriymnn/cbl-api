const Users = require("../model/userModel");
const Notification = require("../model/notificationModel");

const userController = {
  getNotification: async (req, res) => {
    if (!req.cookies.access_token)
      return res.status(401).json({ msg: "Pliss Login" });

    const uuid = req.user.uuid;

    try {
      const users = await Users.findOne({
        attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
        where: {
          uuid: uuid,
        },
        include: [
          {
            model: Notification,
          },
        ],
      });

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  readAllNotification: async (req, res) => {
    if (!req.cookies.access_token)
      return res.status(401).json({ msg: "Pliss Login" });

    const uuid = req.user.uuid;

    try {
      const users = await Users.findOne({
        attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
        where: {
          uuid: uuid,
        },
      });

      await Notification.update(
        { status: "read" },
        { where: { user_id: users.id } }
      );

      res.status(200).json({ msg: "read success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteAllNotification: async (req, res) => {
    const user_id = req.params.userId;
    console.log(user_id);

    try {
      await Notification.destroy({ where: { user_id: user_id } });

      res.status(200).json({ msg: "delete success" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createNotification: async function (bagian, sumber, message, subject) {
    try {
      const users = await Users.findAll({
        where: { bagian: bagian, status: "aktif" },
      });

      let objNotification = [];
      for (let i = 0; i < users.length; i++) {
        objNotification.push({
          sumber: sumber,
          message: message,
          subject: subject,
          user_id: users[i].id,
        });
      }

      const notification = await Notification.bulkCreate(objNotification);
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = userController;
