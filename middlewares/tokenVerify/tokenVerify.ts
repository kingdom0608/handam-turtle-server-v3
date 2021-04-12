import * as jwt from 'jsonwebtoken';
import { jwtToken } from '../../packages/utils/jwt.util';

export function verifyUser(token: any): Promise<any> {
	return new Promise(async (resolve, reject) => {
		await jwt.verify(token, jwtToken.secret, (err, decoded) => {
			if (err) {
				return reject(err);
			}
			return resolve(decoded);
		});
	});
}
