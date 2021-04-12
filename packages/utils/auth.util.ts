import * as jwt from 'jsonwebtoken';
import { jwtToken } from './jwt.util';

export function auth(request: any) {
	const token = request.get('x-access-token');
	const secret = jwtToken.secret;
	let auth = jwt.verify(token, secret);
	return auth;
}
