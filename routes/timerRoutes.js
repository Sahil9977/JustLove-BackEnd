import { Router } from 'express';
import { getTimer } from '../controllers/timerController.js';

const r = Router();
r.get('/', getTimer);
export default r;