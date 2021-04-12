import { hopeHansungEngine } from './hopeHansung.engine';

const id = '';
const password = '';
const baseUrl = 'https://hope.hansung.ac.kr';

describe('HopeHansungEngine', () => {
	it('crawlingMainPage', async () => {
		const result = await hopeHansungEngine.crawlingPage(baseUrl);
		// console.log(result);
	}).timeout(99999);

	it('crawlingLoginPage', async () => {
		const result = await hopeHansungEngine.crawlingLoginPage(id, password);
		// console.log(result);
	}).timeout(99999);

	it('crawlingCareerPage', async () => {
		const result = await hopeHansungEngine.crawlingPage(
			'https://hope.hansung.ac.kr/Career/CareerTask/CareerTask.aspx'
		);
		// console.log(result);
	}).timeout(99999);
});
