import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from '@dicebear/collection';
import { Routes } from '../../types';

const routes: Routes = [
  // Legacy API Routes
  `/4.7/v2/:style/.:format`,
  `/4.7/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.7/api/:style/.:format`,
  `/4.7/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Route
  '/4.7/:style/:format',
];

export { routes, createAvatar, schema, styles };
