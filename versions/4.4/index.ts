import Avatars from '@dicebear/avatars';
import { Routes } from '../../types.js';

import * as styles from './collection.js';
import schema from './schemas/core.js';

const routes: Routes = [
  // Legacy API Routes
  `/4.4/v2/:style/.:format`,
  `/4.4/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.4/api/:style/.:format`,
  `/4.4/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Route
  '/4.4/:style/:format',
];

const createAvatar = (style: any, options: any) => {
  // @ts-ignore
  let avatars = new Avatars.default(style.create);

  return avatars.create(options.seed, options);
};

export { routes, createAvatar, schema, styles };
