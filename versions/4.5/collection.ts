import avataaarsStyle from '@dicebear/avatars-avataaars-sprites';
import botttsStyle from '@dicebear/avatars-bottts-sprites';
import femaleStyle from '@dicebear/avatars-female-sprites';
import gridyStyle from '@dicebear/avatars-gridy-sprites';
import humanStyle from '@dicebear/avatars-human-sprites';
import identiconStyle from '@dicebear/avatars-identicon-sprites';
import initialsStyle from '@dicebear/avatars-initials-sprites';
import jdenticonStyle from '@dicebear/avatars-jdenticon-sprites';
import maleStyle from '@dicebear/avatars-male-sprites';

import avataaarsSchema from './schemas/avataaars.js';
import botttsSchema from './schemas/bottts.js';
import femaleSchema from './schemas/female.js';
import gridySchema from './schemas/gridy.js';
import humanSchema from './schemas/human.js';
import identiconSchema from './schemas/identicon.js';
import initialsSchema from './schemas/initials.js';
import jdenticonSchema from './schemas/jdenticon.js';
import maleSchema from './schemas/male.js';

export const avataaars = {
  // @ts-ignore
  create: avataaarsStyle.default,
  schema: avataaarsSchema,
};

export const bottts = {
  // @ts-ignore
  create: botttsStyle.default,
  schema: botttsSchema,
};

export const female = {
  // @ts-ignore
  create: femaleStyle.default,
  schema: femaleSchema,
};

export const gridy = {
  // @ts-ignore
  create: gridyStyle.default,
  schema: gridySchema,
};

export const human = {
  // @ts-ignore
  create: humanStyle.default,
  schema: humanSchema,
};

export const identicon = {
  // @ts-ignore
  create: identiconStyle.default,
  schema: identiconSchema,
};

export const initials = {
  // @ts-ignore
  create: initialsStyle.default,
  schema: initialsSchema,
};

export const jdenticon = {
  // @ts-ignore
  create: jdenticonStyle.default,
  schema: jdenticonSchema,
};

export const male = {
  // @ts-ignore
  create: maleStyle.default,
  schema: maleSchema,
};
