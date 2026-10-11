// import mongoose from 'mongoose';

// // A gallery photo: either an external link (url) or an uploaded image stored in MongoDB (data).
// export const Photo = mongoose.model('Photo', new mongoose.Schema({
//   url: { type: String, default: '', trim: true },
//   caption: { type: String, default: '', trim: true, maxlength: 200 },
//   order: { type: Number, default: 0 },
//   hasImage: { type: Boolean, default: false },
//   contentType: String,
//   data: { type: Buffer, select: false }, // never sent in lists
// }, { timestamps: true }));
