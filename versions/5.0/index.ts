import { createAvatar, schema, license } from '@dicebear/core';
import * as styles from '@dicebear/collection';
import { Routes } from '../../types';

const exif = license.exif;

const routes: Routes = [
  '/5.0/:style/:format',
  '/5.0/:style/:format/:options',
];

export { routes, createAvatar, schema, styles, exif };
