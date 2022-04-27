export function applyMaxSize(
  options: Record<string, any>,
  minWidth: number,
  maxWidth: number
) {
  // Validate Size for PNG Format
  const size = parseInt(
    options['size'] ||
      options['w'] ||
      options['width'] ||
      options['h'] ||
      options['height'] ||
      '0'
  );

  const validatedSize = size < minWidth || size > maxWidth ? maxWidth : size;

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
