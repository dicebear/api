import avatarAction from './actions/avatar';
import express from 'express';

const router = express.Router();

router.get('/api/:style/:seed.svg', avatarAction);
router.get('/v2/:style/:seed.svg', avatarAction);

export default router;
