const router = require("express").Router();

const bookingJadwalController = require("../../../controller/ppic/bookingJadwal/bookingJadwalController");

router.get(
  "/ppic/bookingJadwal/:id?",
  bookingJadwalController.getBookingJadwal
);
router.post("/ppic/bookingJadwal", bookingJadwalController.createBookingJadwal);

router.put(
  "/ppic/bookingJadwal/:id",
  bookingJadwalController.updateBookingJadwal
);

router.put(
  "/ppic/bookingJadwalDone/:id",
  bookingJadwalController.doneBookingJadwal
);

module.exports = router;
