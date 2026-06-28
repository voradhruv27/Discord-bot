const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/adminController");

router.get("/status", getAdminStats);

module.exports = router;
