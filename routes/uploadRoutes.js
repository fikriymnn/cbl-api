const express = require("express");
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

function getExtension(filename) {
  const regex = /\.[^.]+$/;
  return filename.match(regex)[0];
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../file"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = getExtension(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({
  storage: storage,
});

router.post("/images", upload.single("file"), (req, res) => {
  res.json({
    filename: req.file.filename,
  });
});

router.delete("/images/:file", (req, res) => {
  fs.unlink(path.join(__dirname, `../file/${req.params.file}`), (err) => {
    if (err) throw err;
    //console.log("path/file.txt was deleted");
  });
  res.json({
    data: "Delete image successfully!",
  });
});

module.exports = router;
