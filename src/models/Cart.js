import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: [CartItemSchema],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

// Create compound index for user and shop combination
CartSchema.index({ user: 1, shop: 1 }, { unique: true });

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
