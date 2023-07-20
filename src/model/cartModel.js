const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  totalAmount: {
    type: Number,
    default: 0,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
