import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    brand: { type: String, required: [true, 'Brand is required'], trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Skincare', 'Makeup', 'Bath & Body', 'Haircare'],
    },
    subCategory: { type: String, trim: true, default: 'General' },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be at least 1'] },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, required: [true, 'Stock is required'], min: [0, 'Stock cannot be negative'], default: 0 },
    image: { type: String, default: '' }, // optional image URL
    color: { type: String, default: '#F2B8C6' }, // shade / theme colour (hex)
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
