import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from '@dicebear/collection';

const routes = [
  // Legacy API Routes
  `/v2/:style/.:format`,
  `/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/api/:style/.:format`,
  `/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.10/v2/:style/.:format`,
  `/4.10/v2/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  `/4.10/api/:style/.:format`,
  `/4.10/api/:style/:seed(^.*(?=\.[a-z]{3}$)).:format`,

  // New API Routes
  '/4.10/:style/:format',
  '/4.x/:style/:format',
  '/4.10/:style/:seed/:format',
  '/4.x/:style/:seed/:format',
];

export { routes, createAvatar, schema, styles };
