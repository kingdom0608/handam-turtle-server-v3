import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export class Config {
	get() {
		const file = './package.json';
		let stage = 'local';
		let packageData: any = fs.readFileSync(file, 'utf8');
		packageData = JSON.parse(packageData);

		if (packageData && packageData.stage === 'dv') {
			stage = 'dv';
		}

		if (packageData && packageData.stage === 'prod') {
			stage = 'prod';
		}

		dotenv.config({
			path: path.join(__dirname, `/env/${stage}.env`)
		});

		return {
			stage: process.env.STAGE,
			aws: {
				accessKey: process.env.AWS_ACCESS_KEY,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
			},
			mysql: {
				host: process.env.MYSQL_HOST,
				user: process.env.MYSQL_USER,
				password: process.env.MYSQL_PASSWORD
			},
			encrypt: {
				salt: process.env.ENCRYPTION_SALT,
				digest: process.env.ENCRYPTION_DIGEST
			},
			sqs: {
				url: process.env.SQS_URL,
				apiVersion: process.env.SQS_APIVERSION,
				region: process.env.SQS_REGION
			}
		}
	}
}

const config: Config = new Config();
export default config;
