export function camelCaseToKebabCase(val: string) {
  return val.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
