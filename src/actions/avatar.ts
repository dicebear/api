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

import avataaarsOptions from '../options/avataaars';
import botttsOptions from '../options/bottts';
import femaleOptions from '../options/female';
import gridyOptions from '../options/gridy';
import humanOptions from '../options/human';
import identiconOptions from '../options/identicon';
import initialsOptions from '../options/initials';
import jdenticonOptions from '../options/jdenticon';
import maleOptions from '../options/male';

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

type Params = {
  version?: string;
  style: string;
  seed?: string;
};

type QueryString = Record<string, string>;

export default async function handler(params: Params, queryString: QueryString) {
  let requestOptions = queryString['options'] || queryString;
  let headers = new Headers();

  let [style, options] = styles[params.style] || [];

  if (undefined === style) {
    return new Response('404 Not Found', {
      status: 404,
    });
  }

  try {
    await options.validate(requestOptions, {
      stripUnknown: true,
    });
  } catch (e) {
    return new Response(e['errors'].join(''), {
      status: 400,
    });
  }

  let seed = decodeURIComponent(params.seed || '');
  let avatars = new Avatars(style);
  let svg = avatars.create(seed, options.cast(requestOptions));

  headers.append('Content-Type', 'image/svg+xml');
  headers.append('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

  return new Response(svg, {
    headers: headers,
  });
}
