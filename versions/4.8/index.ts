import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from './collection.js';
import { Routes } from '../../types';

const routes: Routes = [
  // Legacy API Routes
  `/4.8/v2/:style/.:format`,
  `/4.8/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.8/api/:style/.:format`,
  `/4.8/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Routes
  '/4.8/:style/:format',
  '/4.8/:style/:format/:options',
];

export { routes, createAvatar, schema, styles };
