import { expect } from 'chai';
import { sqsUtil } from './sqs.util';
import { uuidV4 } from './uuid.util';
import sendMessage = sqsUtil.sendMessage;
import receiveMessage = sqsUtil.receiveMessage;

describe('sqs', () => {
	const messageBody = uuidV4();

	it('sendMessage', async () => {
		const params = sqsUtil.sendParams;
		params.MessageBody = messageBody;
		const result = await sendMessage(params);
		// console.log(result);
		expect(result).to.be.eqls({
			ResponseMetadata: {
				RequestId: result.ResponseMetadata.RequestId
			},
			MD5OfMessageBody: result.MD5OfMessageBody,
			MessageId: result.MessageId,
			SequenceNumber: result.SequenceNumber
		});
	});

	it('receiveMessage', async () => {
		const params = sqsUtil.receiveParams;
		const result = await receiveMessage(params);
		// console.log(result);
		expect(result).to.be.eqls({
			ResponseMetadata: {
				RequestId: result.ResponseMetadata.RequestId
			},
			Messages: [{
				MessageId: result.Messages[0].MessageId,
				ReceiptHandle: result.Messages[0].ReceiptHandle,
				MD5OfBody: result.Messages[0].MD5OfBody,
				Body: messageBody
			}]
		});
	});
});
