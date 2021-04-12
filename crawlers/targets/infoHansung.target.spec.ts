import { infoHansungTarget } from './infoHansung.target';

const id = '';
const password = '';

describe('InfoHansungTarget', () => {
	it('crawlingInfoHansung', async () => {
		const result = await infoHansungTarget.crawlingInfoHansung('userHrn', id, password);
		// console.log(result);
	}).timeout(99999);

	it('crawlingInfoHansungSchedule', async () => {
		const result = await infoHansungTarget.crawlingInfoHansungSchedule('userHrn', id, password);
		// console.log(result);
	}).timeout(99999);

	it('crawlingInfoHansungGrade', async () => {
		const result = await infoHansungTarget.crawlingInfoHansungGrade('userHrn', id, password);
		// console.log(result);
	}).timeout(99999);

	it('crawlingInfoHansungNonSubjectPoint', async () => {
		const result = await infoHansungTarget.crawlingInfoHansungNonSubjectPoint('userHrn', id, password);
		// console.log(result);
	}).timeout(99999);
});
