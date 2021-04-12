import * as dynamo from 'dynamodb';
import * as Joi from 'joi';
import config from '../../config';
import { Dynamo } from '../../packages/utils/dynamo.util';

let infoHansungDynamo = dynamo.define(`${config.get().stage}-handam-infoHansung`, {
	hashKey: 'userHrn',
	timestamps: true,
	createdAt: true,
	updatedAt: 'updateTimestamp',
	schema: {
		userHrn: Joi.string(),
		infoHansungId: Joi.string(),
		infoHansungPassword: Joi.string(),
		name: Joi.string(),
		status: Joi.string(),
		errorMessage: Joi.string()
	},
	tableName: `${config.get().stage}-handam-infoHansung`
});

export class InfoHansungModel extends Dynamo {
	constructor() {
		super(infoHansungDynamo, {
			hashKey: 'userHrn'
		});
	}
}

export const infoHansungModel: InfoHansungModel = new InfoHansungModel();
