// UserModel.js
import mongoose from 'mongoose';// Import the Address model

const UserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: [{ type: String }],
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }], // Array of Address references
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` timestamps
);

const User = mongoose.model('User', UserSchema);
export default User;
