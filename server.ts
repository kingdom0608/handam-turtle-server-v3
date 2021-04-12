import config from './config';
import * as aws from 'aws-sdk';
import { Consumer } from 'sqs-consumer';
import { infoHansungTarget } from './crawlers';
import { decrypt } from './packages/utils/encryption.util';

function delay(ms: number) {
	return new Promise( resolve => setTimeout(resolve, ms) );
}

aws.config.update({
	region: config.get().sqs.region,
	accessKeyId: config.get().aws.accessKey,
	secretAccessKey: config.get().aws.secretAccessKey
})

const port: number = 3000;

const sqs = new aws.SQS({
	apiVersion: config.get().sqs.apiVersion
});

const app = Consumer.create({
	queueUrl: config.get().sqs.url,
	batchSize: 1,
	waitTimeSeconds: 3,
	handleMessage: async (message) => {
		const messageBody = JSON.parse(message.Body);
		messageBody.infoHansungPassword = decrypt.decrypt(messageBody.infoHansungPassword);
		console.log(`${messageBody.method} consumer start`);

		switch (messageBody.method) {
			case 'createInfoHansung' :
				await infoHansungTarget.crawlingInfoHansung(messageBody.userHrn, messageBody.infoHansungId, messageBody.infoHansungPassword);
				break;
			case 'createInfoHansungSchedule' :
				await infoHansungTarget.crawlingInfoHansungSchedule(messageBody.userHrn, messageBody.infoHansungId, messageBody.infoHansungPassword);
				break;
			case 'createInfoHansungGrade' :
				await infoHansungTarget.crawlingInfoHansungGrade(messageBody.userHrn, messageBody.infoHansungId, messageBody.infoHansungPassword);
				break;
			case 'createInfoHansungNonSubjectPoint' :
				await infoHansungTarget.crawlingInfoHansungNonSubjectPoint(messageBody.userHrn, messageBody.infoHansungId, messageBody.infoHansungPassword);
				break;
			default :
				throw new Error('MessageBody method is undefined');
		}

		console.log(`${messageBody.method} consumer end`);
		await delay(3000);
	},
	sqs: sqs
});

app.on('error', (err) => {
	console.error(`error: ${err.message}`);
});

app.on('processing_error', (err) => {
	console.error(`processing_error: ${err.message}`);
});

app.on('timeout_error', (err) => {
	console.error(`timeout_error: ${err.message}`);
});

console.log('handam turtle server listening on port', port);
console.log('SQS consumer start');
app.start();


