export function applyMaxSize(
  options: Record<string, any>,
  minSize: number,
  maxSize: number,
  defaultSize: number
) {
  const size = Number(options['size'] ?? 0);
  const validatedSize = size < minSize || size > maxSize ? defaultSize : size;

  options['size'] = validatedSize;

  return options;
}
