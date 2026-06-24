const Order = require('../models/Order');
const Listing = require('../models/Listing');

// POST /api/orders  — buyer places an order after payment
exports.createOrder = async (req, res) => {
  const { listingId, paymentMethod, utrNumber } = req.body;

  // Validate UPI requires UTR
  if (paymentMethod === 'upi' && !/^\d{12}$/.test(utrNumber)) {
    return res.status(400).json({ message: 'Valid 12-digit UTR required for UPI payment' });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.status === 'sold') return res.status(400).json({ message: 'This cycle is already sold' });

  // Check buyer hasn't already ordered same listing
  const duplicate = await Order.findOne({ listing: listingId, buyer: req.user._id });
  if (duplicate) return res.status(400).json({ message: 'You already have an order for this listing' });

  // Mark listing as sold
  listing.status = 'sold';
  await listing.save();

  const order = await Order.create({
    listing: listingId,
    buyer: req.user._id,
    amount: listing.price,
    paymentMethod,
    utrNumber: paymentMethod === 'upi' ? utrNumber : undefined,
  });

  await order.populate('listing', 'title plate price');
  res.status(201).json(order);
};

// GET /api/orders/mine  — buyer sees their own orders
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('listing', 'title plate price type images status')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// GET /api/orders  — admin sees all orders
exports.getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate('listing', 'title plate price')
    .populate('buyer', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
};