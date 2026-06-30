const express = require('express');
const Otp = require('../models/Otp');
const User = require('../models/User');
const sendOtpSms = require('../utils/sendOtp');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/profile/details  { rollNumber, phone }
// Saves roll number + phone, sends OTP
router.post('/details', protect, async (req, res) => {
  const { rollNumber, phone } = req.body;

  if (!rollNumber?.trim()) return res.status(400).json({ message: 'Roll number is required' });
  if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: 'Enter a valid 10-digit phone number' });

  // Prevent same roll number / phone being used by another account
  const clash = await User.findOne({
    _id: { $ne: req.user._id },
    $or: [{ rollNumber: rollNumber.trim().toUpperCase() }, { phone }],
  });
  if (clash) return res.status(400).json({ message: 'Roll number or phone already registered' });

  req.user.rollNumber = rollNumber.trim().toUpperCase();
  req.user.phone = phone;
  req.user.phoneVerified = false;
  await req.user.save();

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ phone });
  await Otp.create({ phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

  try {
    await sendOtpSms(phone, code);
    res.json({ message: 'OTP sent to your phone' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP. Try again.' });
  }
});

// POST /api/profile/verify-otp  { code }
router.post('/verify-otp', protect, async (req, res) => {
  const { code } = req.body;
  const record = await Otp.findOne({ phone: req.user.phone, code });
  if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

  await Otp.deleteMany({ phone: req.user.phone });

  req.user.phoneVerified = true;
  req.user.profileComplete = true;
  await req.user.save();

  res.json({ message: 'Phone verified', user: req.user });
});

// POST /api/profile/resend-otp
router.post('/resend-otp', protect, async (req, res) => {
  if (!req.user.phone) return res.status(400).json({ message: 'No phone number on file' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await Otp.deleteMany({ phone: req.user.phone });
  await Otp.create({ phone: req.user.phone, code, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });

  try {
    await sendOtpSms(req.user.phone, code);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

module.exports = router;
