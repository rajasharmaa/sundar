"use strict";
const express = require('express');
const router = express.Router();
const { getActiveCatalog } = require('./controller');
router.get('/', getActiveCatalog);
module.exports = router;
