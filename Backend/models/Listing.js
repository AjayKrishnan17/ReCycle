const mongoose = require('mongoose');

// Auto-generate next plate: CC-0001, CC-0002 ...
async function generatePlate() {
  const last = await mongoose
    .model('Listing')
    .findOne({}, { plate: 1 })
    .sort({ createdAt: -1 });
  if (!last) return 'CC-0001';
  const num = parseInt(last.plate.split('-')[1], 10) + 1;
  return `CC-${String(num).padStart(4, '0')}`;
}

const listingSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    
    condition: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [{ type: String }], // Cloudinary URLs
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-assign plate before creating
listingSchema.pre('save', async function (next) {
  if (this.isNew && !this.plate) {
    this.plate = await generatePlate();
  }
  next();
});

module.exports = mongoose.model('Listing', listingSchema);
