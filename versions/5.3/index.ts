import { createAvatar, schema, license } from '@dicebear/core';
import * as styles from '@dicebear/collection';
import { Routes } from '../../types';

const exif = license.exif;

const routes: Routes = [
  '/5.3/:style/:format',
  '/5.3/:style/:format/:options',
  '/5.x/:style/:format',
  '/5.x/:style/:format/:options',
];

export { routes, createAvatar, schema, styles, exif };
