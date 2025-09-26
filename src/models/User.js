import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      required: true,
    },
  },
  {
    discriminatorKey: "_type",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const User = mongoose.model("User", UserSchema);

const Customer = User.discriminator(
  "Customer",
  new mongoose.Schema({
    // No additional fields for now
  }),
);

const Vendor = User.discriminator(
  "Vendor",
  new mongoose.Schema({
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: false,
    },
  }),
);

const Admin = User.discriminator(
  "Admin",
  new mongoose.Schema({
    // No additional fields for now
  }),
);

export { User, Customer, Vendor, Admin };
