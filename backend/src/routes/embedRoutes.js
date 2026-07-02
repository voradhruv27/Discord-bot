const express = require("express");
const router = express.Router();
const {
  getChannels,
  createEmbed,
  getEmbeds,
  deleteEmbed,
  repostEmbed,
} = require("../controllers/embedController");

router.get("/channels", getChannels);
router.post("/embeds", createEmbed);
router.get("/embeds", getEmbeds);
router.delete("/embeds/:embedId", deleteEmbed);
router.post("/embeds/:embedId/repost", repostEmbed);

module.exports = router;
