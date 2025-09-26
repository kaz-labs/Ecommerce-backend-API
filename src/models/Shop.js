import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
