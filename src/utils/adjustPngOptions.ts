import config from '../../config';

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

  const minSize = parseInt(config.png.size.min);
  const maxSize = parseInt(config.png.size.max);
  const validatedSize = size < minSize || size > maxSize ? maxSize : size;

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
