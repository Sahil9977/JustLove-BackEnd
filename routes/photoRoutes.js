// import { Router } from 'express';
// import { requireAuth } from '../middleware/auth.js';
// import { uploadImage } from '../middleware/upload.js';
// import { Photo } from '../models/Photo.js';
// import { reorderHandler } from '../controllers/crud.js';
// import { listPhotos, createPhoto, updatePhoto, deletePhoto, photoImage } from '../controllers/photoController.js';

// const r = Router();
// r.use(requireAuth);
// r.get('/', listPhotos);
// r.put('/reorder', reorderHandler(Photo));   // before '/:id'
// r.post('/', uploadImage, createPhoto);
// r.get('/:id/image', photoImage);
// r.patch('/:id', uploadImage, updatePhoto);
// r.delete('/:id', deletePhoto);
// export default r;
