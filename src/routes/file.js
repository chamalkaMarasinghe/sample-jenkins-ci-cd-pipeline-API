const express = require("express");
const router = express.Router();
const { signature } = require("../controllers/file");

router.post("/upload/signature", signature);
// router.get("/verify-forgot/admin/:id/:token", idTokenValidator, validate, verifyAdminForgot);

module.exports = router;