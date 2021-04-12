import * as yaml from 'yamljs';

export module jsonUtil {
	/**
	 * string 을 JSON 으로 변환
	 * @param data
	 * @returns {Object}
	 */
	export function jsonParser(data: string | Object): any {
		try {
			return (typeof data === 'string') ? JSON.parse(data) : data;
		} catch (err) {
			throw err;
		}
	}

	/**
	 * JSON 을 string 으로 변환
	 * @param data
	 * @param replacer
	 * @param space
	 * @returns {string}
	 */
	export function jsonStringify(data: string | Object, replacer: (key: string, value: any) => any = null, space: number = 2): string {
		return (typeof data === 'string') ? data : JSON.stringify(data, null, 2);
	}

	/**
	 * Error 를 json 또는 string 으로 변환
	 * @param err
	 * @param replacer
	 * @param space
	 * @returns {string}
	 */
	export function errorStringify(err: any, replacer: (key: string, value: any) => any = null, space: number = 2): string {
		if (!err || typeof err !== 'object' || !Object.keys(err).length) {
			return `${err}`;
		}
		return (err.message) ? err.message : jsonStringify(err, replacer, space);
	}

	/**
	 * json 을 yml 으로 변환
	 * @param json
	 * @param indent
	 * @param indentation
	 * @returns {string}
	 */
	export function jsonToYml(json: any, indent: number = 2, indentation: number = 8): string {
		if (!json || typeof json !== 'object' || !Object.keys(json).length) {
			return `${json}`;
		} else if (json instanceof Error) {
			return (json.message) ? json.message : json.toString();
		} else {
			return yaml.stringify(json, indentation, indent);
		}
	}

	/**
	 * json 을 log 에 적합한 문자열로 변환
	 * @param json
	 * @param {string} key
	 * @returns {string}
	 */
	export function jsonLogStringify(json: any, key: string = ''): string {
		let result: string = '';
		if (!json || typeof json !== 'object' || !Object.keys(json).length) {
			return (key) ? `${key}: ${json}\n` : `${json}`;
		}
		if (Array.isArray(json)) {
			key = (key) ? key : 'Array';
			json.forEach((arratValue, index) => {
				result = result + jsonLogStringify(arratValue, `${key}[${index}]`);
			});
		} else {
			key = (key) ? key + '.' : key;
			Object.keys(json).forEach(objectKey => {
				const value = json[objectKey];
				result = result + jsonLogStringify(value, key + objectKey);
			});
		}
		return result;
	}

	/**
	 * case-converter: https://github.com/travelperk/case-converter
	 * deeply converts keys of an object from one case to another
	 * @param oldObject
	 * @param converterFunction
	 * @returns {}
	 */
	export function convertCase(oldObject: object, converterFunction: (key: string) => string): object {
		let newObject;
		if (!oldObject || typeof oldObject !== 'object' || !Object.keys(oldObject).length) {
			return oldObject;
		}
		if (Array.isArray(oldObject)) {
			newObject = oldObject.map(element => convertCase(element, converterFunction));
		} else {
			newObject = {};
			Object.keys(oldObject).forEach(oldKey => {
				const newKey = converterFunction(oldKey);
				newObject[newKey] = convertCase(oldObject[oldKey], converterFunction);
			});
		}
		return newObject;
	}

	/**
	 * object camlCase converter
	 * @param obj
	 */
	export const toCamelCase = obj => convertCase(obj, camelCaseConverter);

	/**
	 * object camlCase converter
	 * @param obj
	 */
	export const toPascalCase = obj => convertCase(obj, parcalCaseConverter);

	/**
	 * 첫 글자 대문자화
	 * http://jsperf.com/capitalize-the-first-letter-of-string-in-javascript/2
	 * @param key
	 * @returns {string}
	 */
	export function camelCaseConverter(key: string): string {
		return key.charAt(0).toLowerCase() + key.slice(1);
	}

	/**
	 * 첫 글자 소문자화
	 * http://jsperf.com/capitalize-the-first-letter-of-string-in-javascript/2
	 * @param key
	 * @returns {string}
	 */
	export function parcalCaseConverter(key: string): string {
		return key.charAt(0).toUpperCase() + key.slice(1);
	}

	/**
	 * object null value 정리
	 * 업데이트 API에서 payload를 정리할때 사용
	 * https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript
	 * @param obj
	 */
	export function cleanObject(obj: object): object {
		Object.keys(obj).forEach((key) => {
			if (obj[key] && typeof obj[key] === 'object') {
				cleanObject(obj[key])
			} else if (obj[key] == null) {
				delete obj[key];
			} else if (obj[key] == undefined) {
				delete obj[key];
			}
		});
		return obj;
	}
}
