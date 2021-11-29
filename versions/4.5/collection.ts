import avataaarsStyle from '@dicebear/avatars-avataaars-sprites';
import botttsStyle from '@dicebear/avatars-bottts-sprites';
import femaleStyle from '@dicebear/avatars-female-sprites';
import gridyStyle from '@dicebear/avatars-gridy-sprites';
import humanStyle from '@dicebear/avatars-human-sprites';
import identiconStyle from '@dicebear/avatars-identicon-sprites';
import initialsStyle from '@dicebear/avatars-initials-sprites';
import jdenticonStyle from '@dicebear/avatars-jdenticon-sprites';
import maleStyle from '@dicebear/avatars-male-sprites';

import avataaarsSchema from './schemas/avataaars';
import botttsSchema from './schemas/bottts';
import femaleSchema from './schemas/female';
import gridySchema from './schemas/gridy';
import humanSchema from './schemas/human';
import identiconSchema from './schemas/identicon';
import initialsSchema from './schemas/initials';
import jdenticonSchema from './schemas/jdenticon';
import maleSchema from './schemas/male';

export const avataaars = {
  create: avataaarsStyle,
  schema: avataaarsSchema,
};

export const bottts = {
  create: botttsStyle,
  schema: botttsSchema,
};

export const female = {
  create: femaleStyle,
  schema: femaleSchema,
};

export const gridy = {
  create: gridyStyle,
  schema: gridySchema,
};

export const human = {
  create: humanStyle,
  schema: humanSchema,
};

export const identicon = {
  create: identiconStyle,
  schema: identiconSchema,
};

export const initials = {
  create: initialsStyle,
  schema: initialsSchema,
};

export const jdenticon = {
  create: jdenticonStyle,
  schema: jdenticonSchema,
};

export const male = {
  create: maleStyle,
  schema: maleSchema,
};
