import mongoose from 'mongoose';


export const Config = mongoose.model('Config', new mongoose.Schema({
  key: { type: String, default: 'owner', unique: true },  // only one 'owner' can ever exist
  codeHash: String,
  previewHash : String,
  ownerEmail: String,
  otpHash: String,
  otpExpires: Date,
}));