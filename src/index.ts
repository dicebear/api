import { getVersions } from './utils/getVersions';

console.log('Starting');

console.log(Object.keys(await getVersions()));
