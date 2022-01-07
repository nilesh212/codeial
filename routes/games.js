const express = require("express");

const router = express.Router();

const gameController = require("../controllers/game_controller");

router.get("/game-name", gameController.gameName);

module.exports = router; // You need to do this so that it can available for index.js
