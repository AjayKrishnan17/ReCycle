const express = require('express');
const {
  getListings, getListing, createListing, updateListing, deleteListing,
} = require('../controllers/listingController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getListings);
router.get('/:id', getListing);
router.post('/', protect, adminOnly, upload.array('images', 5), createListing);
router.put('/:id', protect, adminOnly, updateListing);
router.delete('/:id', protect, adminOnly, deleteListing);

module.exports = router;