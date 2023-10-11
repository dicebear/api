import qs from 'qs';
export function parseQueryString(str) {
    const result = Object.create(null);
    const parsed = qs.parse(str, {
        comma: true,
        plainObjects: true,
        depth: 1,
    });
    for (const key of Object.keys(parsed)) {
        const value = parsed[key];
        // Only add non-empty values
        if (Array.isArray(value)) {
            result[key] = value.filter((v) => v !== '');
        }
        else if (value !== '') {
            result[key] = [value];
        }
    }
    return result;
}
