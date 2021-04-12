import * as aws from 'aws-sdk';
import * as lodash from 'lodash';
import config from '../../config';

export module sqsUtil {
	aws.config.update({
		region: config.get().sqs.region,
		accessKeyId: config.get().aws.accessKey,
		secretAccessKey: config.get().aws.secretAccessKey
	});

	/** SQS 객체 생성 */
	export const sqs = new aws.SQS({
		apiVersion: config.get().sqs.apiVersion
	});

	/** 송신 메세지 파라미터 */
	export const sendParams = {
		QueueUrl: config.get().sqs.url,
		MessageBody: null,
		DelaySeconds: 0,
		MessageGroupId: 'credential'
	};

	/** 수신 메세지 파라미터 */
	export const receiveParams = {
		QueueUrl: config.get().sqs.url,
		MaxNumberOfMessages: 10
	};

	/** SQS 메세지 송신 */
	export async function sendMessage(sendParams) {
		return await sqs.sendMessage(sendParams).promise()
			.then(onReceiveMessage)
			.catch(error => {
				console.error(error);
			});
	}

	/** SQS 메세지 수신 */
	export async function receiveMessage(receiveParams) {
		return await sqs.receiveMessage(receiveParams).promise()
			.then(deleteMessages)
			.catch(error => {
				console.error(error);
			});
	}

	/** SQS 에서 받은 메시지를 콘솔에 출력 */
	export function onReceiveMessage(messages) {
		if (lodash.isNil(messages.Messages) === false) {
			messages.Messages.forEach(message => {
				console.log(message.Body);
			});
		}

		return messages;
	}

	/** SQS 에서 받은 메시지를 삭제 */
	export async function deleteMessages(messages) {
		if (lodash._.isNil(messages.Messages)) {
			return;
		}

		/** SQS 삭제에 필요한 형식으로 변환 */
		const entries = messages.Messages.map((msg) => {
			return {
				Id: msg.MessageId,
				ReceiptHandle: msg.ReceiptHandle,
			};
		});

		/** 메시지 일괄 삭제 */
		await sqs.deleteMessageBatch({
			Entries: entries,
			QueueUrl: config.get().sqs.url,
		}).promise();

		return messages;
	}
}
