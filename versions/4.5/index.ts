import avatarAction from './actions/avatar';
import express from 'express';

const router = express.Router();

router.get('/api/:style/:seed.:format', avatarAction);
router.get('/v2/:style/:seed.:format', avatarAction);

export default router;
