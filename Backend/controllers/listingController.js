const Listing = require('../models/Listing');

// GET /api/listings
exports.getListings = async (req, res) => {
  const { type, status, q } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { plate: { $regex: q, $options: 'i' } },
    { description: { $regex: q, $options: 'i' } },
  ];

  const listings = await Listing.find(filter).sort({ createdAt: -1 });
  res.json(listings);
};

// GET /api/listings/:id
exports.getListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json(listing);
};

// POST /api/listings  (admin only)
exports.createListing = async (req, res) => {
  const { title, price, type, condition, description, plate } = req.body;
  const images = req.files?.map((f) => f.path) || [];

  const listing = await Listing.create({
    title, price, type, condition, description,
    plate: plate || undefined, // auto-generated if blank
    images,
    addedBy: req.user._id,
  });
  res.status(201).json(listing);
};

// PUT /api/listings/:id  (admin only)
exports.updateListing = async (req, res) => {
  const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json(listing);
};

// DELETE /api/listings/:id  (admin only)
exports.deleteListing = async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  res.json({ message: 'Listing deleted' });
};