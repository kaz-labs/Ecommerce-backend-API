import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;
