import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from '@dicebear/collection';

const routes = [
  // Legacy API Routes
  `/4.7/v2/:style/.:format`,
  `/4.7/v2/:style/:seed(^.*(?=\.(svg))).:format`,

  `/4.7/api/:style/.:format`,
  `/4.7/api/:style/:seed(^.*(?=\.(svg))).:format`,

  // New API Routes
  '/4.7/:style/:format',
  '/4.7/:style/:seed/:format',
];

export { routes, createAvatar, schema, styles };
