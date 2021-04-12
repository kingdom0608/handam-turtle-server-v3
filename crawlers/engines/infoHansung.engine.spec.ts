import { infoHansungEngine } from './infoHansung.engine';

const id = '';
const password = '';
const baseUrl = 'https://info.hansung.ac.kr';

describe('InfoHansungEngine', () => {
	it('crawlingMainPage', async () => {
		const result = await infoHansungEngine.crawlingPage(baseUrl);
		// console.log(result);
	}).timeout(99999);

	it('crawlingLoginPage', async () => {
		const result = await infoHansungEngine.crawlingLoginPage(id, password);
		// console.log(result);
	}).timeout(99999);

	it('crawlingGradePage', async () => {
		const result = await infoHansungEngine.crawlingPage(
			'https://info.hansung.ac.kr/fuz/seongjeok/seongjeok_new_rwd.jsp'
		);
		// console.log(result);
	}).timeout(99999);
});
