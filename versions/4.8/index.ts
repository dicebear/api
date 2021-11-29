import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from '@dicebear/collection';

const routes = [
  // Legacy API Routes
  `/4.8/v2/:style/.:format`,
  `/4.8/v2/:style/:seed(^.*(?=\.(svg))).:format`,

  `/4.8/api/:style/.:format`,
  `/4.8/api/:style/:seed(^.*(?=\.(svg))).:format`,

  // New API Routes
  '/4.8/:style/:format',
  '/4.8/:style/:seed/:format',
];

export { routes, createAvatar, schema, styles };
