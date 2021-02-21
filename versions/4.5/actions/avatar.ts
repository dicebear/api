import Avatars from '@dicebear/avatars';

import avataaars from '@dicebear/avatars-avataaars-sprites';
import bottts from '@dicebear/avatars-bottts-sprites';
import female from '@dicebear/avatars-female-sprites';
import gridy from '@dicebear/avatars-gridy-sprites';
import human from '@dicebear/avatars-human-sprites';
import identicon from '@dicebear/avatars-identicon-sprites';
import initials from '@dicebear/avatars-initials-sprites';
import jdenticon from '@dicebear/avatars-jdenticon-sprites';
import male from '@dicebear/avatars-male-sprites';
import { RequestHandler } from 'express';

import avataaarsOptions from '../options/avataaars';
import botttsOptions from '../options/bottts';
import femaleOptions from '../options/female';
import gridyOptions from '../options/gridy';
import humanOptions from '../options/human';
import identiconOptions from '../options/identicon';
import initialsOptions from '../options/initials';
import jdenticonOptions from '../options/jdenticon';
import maleOptions from '../options/male';

import sharp from 'sharp';

const styles: Record<string, any> = {
  avataaars: [avataaars, avataaarsOptions],
  bottts: [bottts, botttsOptions],
  female: [female, femaleOptions],
  gridy: [gridy, gridyOptions],
  human: [human, humanOptions],
  identicon: [identicon, identiconOptions],
  initials: [initials, initialsOptions],
  jdenticon: [jdenticon, jdenticonOptions],
  male: [male, maleOptions],
};

const handler: RequestHandler = async (req, res) => {
  const format = req.params.format;
  let requestOptions = req.query.options || req.query;

  if (Array.isArray(requestOptions) || typeof requestOptions === 'string') {
    requestOptions = {};
  }

  let [style, options] = styles[req.params.style] || [];

  if (undefined === style) {
    res.sendStatus(404);
    return;
  }

  if (false === ['svg', 'png'].includes(format)) {
    res.sendStatus(404);
    return;
  }

  if (format === 'png') {
    let size = requestOptions['w'] || requestOptions['width'] || requestOptions['h'] || requestOptions['height'];
    let secureSize = typeof size === 'string' ? parseInt(size) : 0;

    delete requestOptions['w'];
    delete requestOptions['width'];
    delete requestOptions['h'];
    delete requestOptions['height'];

    requestOptions['w'] = (secureSize <= 0 || secureSize > 256 ? 256 : secureSize).toString();
    requestOptions['h'] = requestOptions['w'];
  }

  try {
    await options.validate(requestOptions, {
      stripUnknown: true,
    });
  } catch (e) {
    res.status(400).send(e['errors'].join(''));
    return;
  }

  let seed = decodeURIComponent(req.params.seed || '');
  let avatars = new Avatars(style);
  let svg = avatars.create(seed, options.cast(requestOptions));

  res.append('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

  if (format === 'png') {
    const output = await sharp(Buffer.from(svg)).png().toBuffer();

    res.contentType('image/png');
    res.send(output);
    return;
  }

  res.contentType('image/svg+xml');
  res.send(svg);
};

export default handler;
