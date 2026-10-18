const router = require("express").Router();
const InvoiceApController = require("../../../controller/akunting/invoiceAp/invoiceApController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/invoiceAp/ap", auth, InvoiceApController.getAccountPayable);
router.get("/invoiceApNomor", auth, InvoiceApController.getNoInvoiceAp);
router.get("/invoiceAp/:id?", auth, InvoiceApController.getInvoiceAp);
router.post("/invoiceAp", auth, InvoiceApController.createInvoiceAp);
router.put("/invoiceAp/:id", auth, InvoiceApController.updateInvoiceAp);
router.put("/invoiceAp/request/:id", auth, InvoiceApController.requestInvoiceAp);
router.put("/invoiceAp/approve/:id", auth, InvoiceApController.approveInvoiceAp);
router.put("/invoiceAp/reject/:id", auth, InvoiceApController.rejectInvoiceAp);
router.delete("/invoiceAp/:id", auth, InvoiceApController.deleteInvoiceAp);

module.exports = router;
