import { createAvatar, schema, license } from '@dicebear/core';
import * as styles from '@dicebear/collection';
import { Routes } from '../../types';

const exif = license.exif;

const routes: Routes = [
  '/7.x/:style/:format',
  '/7.x/:style/:format/:options',
];

export { routes, createAvatar, schema, styles, exif };
