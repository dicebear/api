import { createAvatar, schema } from '@dicebear/avatars';
import * as styles from './collection';

const routes = [
  // Legacy API Routes
  `/4.6/v2/:style/.:format`,
  `/4.6/v2/:style/:seed(^.*(?=\.(svg))).:format`,

  `/4.6/api/:style/.:format`,
  `/4.6/api/:style/:seed(^.*(?=\.(svg))).:format`,

  // New API Routes
  '/4.6/:style/:format',
  '/4.6/:style/:seed/:format',
];

export { routes, createAvatar, schema, styles };
