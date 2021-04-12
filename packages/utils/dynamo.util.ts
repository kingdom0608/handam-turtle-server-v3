import * as dynamo from 'dynamodb';
import config from '../../config';

export module dynamoUtil {
	export const dynamoConfig = dynamo.AWS.config.update({
		region: config.get().sqs.region,
		accessKeyId: config.get().aws.accessKey,
		secretAccessKey: config.get().aws.secretAccessKey
	});
}

export class Dynamo {
	db: any;
	hashKey: any;
	rangeKey: any;

	constructor(define?: any, config?: any) {
		dynamoUtil.dynamoConfig;
		this.db = define;
		this.hashKey = config.hashKey;
		this.rangeKey = config.rangeKey || '';
	}

	/**
	 * 항목 생성: Create (해당 항목이 없는 경우에만 수정)
	 * @param params
	 * @returns {Promise<*>|Promise}
	 */
	async create(params: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.create(params, {overwrite: false}, (err, item) => {
				if (err) {
					if (err.code === 'ConditionalCheckFailedException') {
						reject('DynamoDB item already exists'); // 이미 존재하는 항목
					} else {
						reject(err);
					}
				} else {
					resolve(item.get());
				}
			});
		});
	}

	/**
	 * 항목 일괄 생성: bulkCreate (해당 항목이 없는 경우에만 수정)
	 * @param params
	 */
	async bulkCreate(params: Array<any>): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.create(params, {overwrite: false}, (err, items) => {
				if (err) {
					if (err.code === 'ConditionalCheckFailedException') {
						reject('DynamoDB item already exists'); // 이미 존재하는 항목
					} else {
						reject(err);
					}
				} else {
					let results: Array<any> = [];
					for (let row of items) {
						row = row.get();
						results.push(row);
					}
					resolve(results);
				}
			});
		});
	}

	/**
	 * 단일 항목 가져오기
	 * @param index
	 * @param attributes
	 * @returns {Promise<*>}
	 */
	get(index: any, attributes: string[] = null): Promise<any> {
		let expressions: any = {};
		if (attributes && attributes.length) {
			expressions.ProjectionExpression = attributes.join(',')
		}
		return new Promise((resolve, reject) => {
			this.db.get(index, expressions, (err, data) => {
				if (err) {
					reject(err);
				} else if (data === null) {
					reject('DynamoDB item does not exist'); // 존재하지 않는 항목
				} else {
					resolve(data.get());
				}
			});
		});
	}

	/**
	 * 항목 생성: Put (해당 항목이 이미 있을 경우 수정)
	 * @param item
	 * @returns {Promise<*>|Promise}
	 */
	async put(item: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.create(item, (err, item) => {
				if (err) {
					reject(err);
				} else {
					resolve(item.get());
				}
			});
		});
	}

	/**
	 * 항목 업데이트 (해당 항목이 이미 있을 경우에만 수정)
	 * @param params
	 * @returns {Promise<*>|Promise}
	 */
	async update(params: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.update(params, {expected: {[this.hashKey]: {Exists: true}}}, (err, item) => {
				if (err) {
					switch (err.code) {
						case 'ConditionalCheckFailedException':
						case 'ResourceNotFoundException':
							reject('DynamoDB item does not exist'); // 존재하지 않는 항목
							break;
						case 'ValidationException':
							reject('ValidationException'); // 존재하지 않는 항목
							break;
						default:
							reject(err);
					}
				} else {
					resolve(item.attrs);
				}
			});
		});
	}

	/**
	 * 항목 삭제
	 * @returns {Promise<*>|Promise}
	 * @param params
	 */
	async destroy(params: any): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.destroy(params, {ReturnValues: 'ALL_OLD'}, (err, item) => {
				if (err) {
					reject(err);
				} else if (!item) {
					reject('DynamoDB item does not exist'); // 존재하지 않는 항목
				} else {
					resolve(item.attrs);
				}
			});
		});
	}

	/**
	 * 체크 Key Value
	 * @param key
	 * @param value
	 * @returns {Promise<*>|Promise}
	 */
	checkKeyValue(key: string, value: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.scan()
				.where(key)
				.gte(value)
				.exec((err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(this.checkResults(data));
					}
				});
		});
	}

	/**
	 * hashKey 로 해당 항목 존재 유무 체크
	 * True === 해당 항목이 있음
	 * False === 해당 항목이 없음
	 *
	 * @param hashKey
	 * @returns {Promise<*>|Promise}
	 */
	checkByHashKey(hashKey: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db.query(hashKey).exec((err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(this.checkResults(data));
				}
			});
		});
	}

	/**
	 * 쿼리 항목 유무
	 * @param data
	 * @returns {boolean}
	 */
	checkResults(data: any): boolean {
		return !!data.Count;
	}

	/**
	 * 쿼리 항목 반환: 쿼리한 항목이 1개
	 * @param data
	 * @returns {*}
	 */
	getResult(data: any): any {
		if (data.Items.length > 1) {
			throw new Error('Query result has more than two items');
		} else if (data.Items.length === 0) {
			return null;
		} else {
			return data.Items[0].attrs;
		}
	}

	/**
	 * 쿼리 항목 반환: 쿼리한 항목이 다수 개
	 * @param data
	 * @returns {*}
	 */
	getResults(data: any): [any] {
		return data.Items.map((item) => {
			return item.attrs;
		});
	}

	/**
	 * 쿼리 항목 반: 쿼리한 항목이 다수 개이고 페이지네이션 가능하도록 nextToken 값 추가
	 * @param data
	 */
	getPageResults(data: any): any {
		return {
			nextToken: data.LastEvaluatedKey || null,
			results: data.Items.map((item) => {
				return item.attrs;
			})
		};
	}

	/**
	 * 항목 생성
	 * @param items
	 * @returns {Promise<*>}
	 */
	putItems(items: any): Promise<any> {
		let promises: any = items.map((item) => {
			return this.put(item);
		});
		return Promise.all(promises);
	}

	/**
	 * 항목 삭제
	 * @param items
	 * @returns {Promise<*>}
	 */
	destroyItems(items: any): Promise<any> {
		const promises: Promise<any>[] = items.map((item) => {
			let params: any = {};
			params[this.hashKey] = item[this.hashKey];
			if (this.rangeKey && item[this.rangeKey]) {
				params[this.rangeKey] = item[this.rangeKey];
			}
			return this.destroy(params);
		});
		return Promise.all(promises);
	}
}
