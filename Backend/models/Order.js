const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['upi', 'cash'],
      required: true,
    },
    // Only for UPI payments — store for dispute resolution
    utrNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (this.paymentMethod === 'upi') return /^\d{12}$/.test(v);
          return true;
        },
        message: 'UTR must be 12 digits for UPI payments',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);