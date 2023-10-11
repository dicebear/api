export function applyMaxSize(options, minSize, maxSize, defaultSize) {
    const size = Number(options['size'] ?? 0);
    const validatedSize = size < minSize || size > maxSize ? defaultSize : size;
    options['size'] = validatedSize;
    return options;
}
