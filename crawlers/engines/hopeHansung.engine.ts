import * as qs from 'querystring';
import * as iconv from 'iconv-lite';
import * as tough from 'tough-cookie';

const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const cookieJar = new tough.CookieJar();
const Cookie = tough.Cookie;

axiosCookieJarSupport(axios);
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;

const baseUrl = 'https://hope.hansung.ac.kr';
const loginUrl = 'https://hope.hansung.ac.kr/main/loginPro.aspx';

export class HopeHansungEngine {
	/**
	 * service: 크롤링 페이지
	 * @param url
	 */
	async crawlingPage(url: string) {
		const response = await axios
			.get(url, {
				jar: cookieJar,
				withCredentials: true,
				responseType: 'arraybuffer'
			})
			.then((data) => {
				data.data = iconv.decode(data.data, 'UTF-8');
				return data;
			})
			.catch((error) => {
				throw error;
			});

		return {
			headers: response.headers,
			data: response.data
		}
	}

	/**
	 * 크롤링 로그인 페이지
	 * @param id
	 * @param password
	 */
	async crawlingLoginPage(id: string, password: string) {
		try {
			const body = qs.stringify({
				rUserid: id,
				rPW: password,
				loginBtn: 'on',
				pro: '1'
			});

			let response = await axios
				.post(loginUrl, body,
				{
					headers: {
						host: 'hope.hansung.ac.kr',
						origin: baseUrl,
						referer: 'https://hope.hansung.ac.kr/Main/default.aspx',
						'content-type': 'application/x-www-form-urlencoded; charset=euc-kr',
						cookie: cookieJar
					},
					jar: cookieJar,
					withCredentials: true,
					responseType: 'arraybuffer'
				})
				.then((data) => {
					data.data = iconv.decode(data.data, 'UTF-8');
					return data;
				})
				.catch((error) => {
					throw error;
				});

			const tempTokenArray = response.data.match(/document.cookie.*$/gm);
			tempTokenArray.map((data) => {
				data = `${data.match(/"(.*)"/)[1]}`;

				const cookie = Cookie.parse(data);
				cookieJar.setCookie(cookie, 'https://hope.hansung.ac.kr', (error, cookie) => {
					if (error) {
						throw error;
					}

					return cookie;
				});

				return data;
			});

			return {
				headers: response.headers,
				data: response.data
			};
		} catch (err) {
			throw err;
		}
	}
}

export const hopeHansungEngine = new HopeHansungEngine()
