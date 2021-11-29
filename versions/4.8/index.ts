import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from '@dicebear/collection';

const routes = [
  // Legacy API Routes
  `/4.8/v2/:style/.:format`,
  `/4.8/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.8/api/:style/.:format`,
  `/4.8/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Routes
  '/4.8/:style/:format',
  '/4.8/:style/:seed/:format',
];

export { routes, createAvatar, schema, styles };
