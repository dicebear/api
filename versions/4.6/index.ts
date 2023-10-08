import { createAvatar, schema } from '@dicebear/avatars';
import { Routes } from '../../types.js';
import * as styles from './collection.js';

const routes: Routes = [
  // Legacy API Routes
  `/4.6/v2/:style/.:format`,
  `/4.6/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.6/api/:style/.:format`,
  `/4.6/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Routes
  '/4.6/:style/:format',
  '/4.6/:style/:format/:options',
];

export { routes, createAvatar, schema, styles };
