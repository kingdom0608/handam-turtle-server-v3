import * as qs from 'querystring';
import * as iconv from 'iconv-lite';
import * as tough from 'tough-cookie';

const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const cookieJar = new tough.CookieJar();

axiosCookieJarSupport(axios);
axios.defaults.jar = cookieJar;
axios.defaults.withCredentials = true;

const baseUrl = 'https://info.hansung.ac.kr';
const loginUrl = 'https://info.hansung.ac.kr/servlet/s_gong.gong_login_ssl';

export class InfoHansungEngine {
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
				data.data = iconv.decode(data.data, 'EUC-KR');
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
				id: id,
				passwd: password,
				return_url: null,
				changePass: ''
			});

			const response = await axios
				.post(loginUrl, body,
				{
					headers: {
						host: 'info.hansung.ac.kr',
						origin: baseUrl,
						referer: 'https://info.hansung.ac.kr/index.jsp',
						'content-type': 'application/x-www-form-urlencoded; charset=euc-kr',
						connection: 'keep-alive',
						cookie: cookieJar,
					},
					jar: cookieJar,
					withCredentials: true,
					responseType: 'arraybuffer'
				})
				.then((data) => {
					data.data = iconv.decode(data.data, 'EUC-KR');
					return data;
				})
				.catch((error) => {
					throw error;
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

export const infoHansungEngine = new InfoHansungEngine();
