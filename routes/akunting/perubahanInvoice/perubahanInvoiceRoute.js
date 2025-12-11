const router = require("express").Router();
const PerubahanInvoiceController = require("../../../controller/akunting/perubahanInvoice/perubahanInvoiceController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/perubahanInvoice/:id?",
  auth,
  PerubahanInvoiceController.getPerubahanInvoice
);
router.get(
  "/perubahanInvoiceNomor",
  auth,
  PerubahanInvoiceController.getNoPerubahanInvoice
);
router.post(
  "/perubahanInvoice",
  auth,
  PerubahanInvoiceController.createPerubahanInvoice
);
router.put(
  "/perubahanInvoice/:id",
  auth,
  PerubahanInvoiceController.updatePerubahanInvoice
);
router.put(
  "/perubahanInvoice/request/:id",
  auth,
  PerubahanInvoiceController.requestPerubahanInvoice
);
router.put(
  "/perubahanInvoice/approve/:id",
  auth,
  PerubahanInvoiceController.approvePerubahanInvoice
);
router.put(
  "/perubahanInvoice/reject/:id",
  auth,
  PerubahanInvoiceController.rejectPerubahanInvoice
);
router.delete(
  "/perubahanInvoice/:id",
  auth,
  PerubahanInvoiceController.deletePerubahanInvoice
);

module.exports = router;
