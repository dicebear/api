import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from '@dicebear/collection';
import { Routes } from '../../types';

const routes: Routes = [
  // Legacy API Routes
  `/4.8/v2/:style/.:format`,
  `/4.8/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.8/api/:style/.:format`,
  `/4.8/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Route
  '/4.8/:style/:format',
];

export { routes, createAvatar, schema, styles };
