export function adjustPngOptions(options: Record<string, any>) {
  // Validate Size for PNG Format
  const size = options['size'] || options['w'] || options['width'] || options['h'] || options['height'];
  const minSize = parseInt(process.env.MIN_PNG_SIZE ?? '0') || 1;
  const maxSize = parseInt(process.env.MAX_PNG_SIZE ?? '0') || 128;
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
