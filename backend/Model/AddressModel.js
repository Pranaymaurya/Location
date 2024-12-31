// AddressModel.js
import mongoose from 'mongoose';

const AddressSchema = mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      enum: ['Home', 'Office', 'Other'], // Ensuring only specific labels
      default: 'Home',
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` timestamps
);

const Address = mongoose.model('Address', AddressSchema);
export default Address;
