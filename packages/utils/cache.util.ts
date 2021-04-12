import * as fs from 'fs';
import * as redis from 'redis';

export module cacheUtil {
	const file = './packages/utils/config/env.json';
	let cacheData: any = fs.readFileSync(file, 'utf8');
	cacheData = JSON.parse(cacheData);
	cacheData.cache.port = parseInt(cacheData.cache.port);

	export const client = redis.createClient(cacheData.cache.port, cacheData.cache.endpoint);
}
