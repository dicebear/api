import config from '../../config.js';

export function adjustPngOptions(options: Record<string, any>) {
  // Validate Size for PNG Format
  const size = parseInt(
    options['size'] ||
      options['w'] ||
      options['width'] ||
      options['h'] ||
      options['height'] ||
      '0'
  );

  const { min, max } = config.png.size;

  const validatedSize = size < min || size > max ? max : size;

  delete options['size'];
  delete options['w'];
  delete options['width'];
  delete options['h'];
  delete options['height'];

  options['w'] = validatedSize;
  options['h'] = validatedSize;
  options['size'] = validatedSize;

  return options;
}
