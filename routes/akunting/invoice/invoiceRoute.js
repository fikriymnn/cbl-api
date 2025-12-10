const router = require("express").Router();
const InvoiceController = require("../../../controller/akunting/invoice/invoiceController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/invoice/:id?", auth, InvoiceController.getInvoice);
router.get("/invoiceNomor", auth, InvoiceController.getNoInvoice);
router.post("/invoice", auth, InvoiceController.createInvoice);
router.put("/invoice/:id", auth, InvoiceController.updateInvoice);
router.put("/invoice/request/:id", auth, InvoiceController.requestInvoice);
router.put("/invoice/approve/:id", auth, InvoiceController.approveInvoice);
router.put("/invoice/reject/:id", auth, InvoiceController.rejectInvoice);
router.delete("/invoice/:id", auth, InvoiceController.deleteInvoice);

module.exports = router;
