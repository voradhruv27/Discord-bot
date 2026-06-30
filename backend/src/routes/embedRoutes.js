const express = require("express");
const router = express.Router();
const {
  getChannels,
  createEmbed,
  getEmbeds,
  deleteEmbed,
} = require("../controllers/embedController");

router.get("/channels", getChannels);
router.post("/embeds", createEmbed);
router.get("/embeds", getEmbeds);
router.delete("/embeds/:embedId", deleteEmbed);

module.exports = router;
