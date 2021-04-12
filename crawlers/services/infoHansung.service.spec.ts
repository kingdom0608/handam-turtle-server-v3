import { expect } from 'chai';
import { uuidV4 } from '../../packages/utils/uuid.util';
import { infoHansungService } from './infoHansung.service';

describe('hansung', async () => {
	const userHrn = uuidV4();
	let createInfoHansung;

	it('createInfoHansung', async () => {
		const result: any = await infoHansungService.createInfoHansung({
			userHrn: userHrn,
			infoHansungId: 'testInfoHansungId',
			infoHansungPassword: 'testInfoHansungPassword',
			status: 'UNVERIFIED'
		});
		createInfoHansung = result;
		// console.log(result);
		expect(result).to.instanceof(Object);
	});

	it('listInfoHansung', async () => {
		const result: any = await infoHansungService.listInfoHansung(createInfoHansung.userHrn);
		// console.log(result);
		expect(result).to.instanceof(Array);
	});

	it('getInfoHansung', async () => {
		const result: any = await infoHansungService.getInfoHansung(createInfoHansung.userHrn);
		// console.log(result);
		expect(result).to.instanceof(Object);
	});

	it('updateInfoHansung', async () => {
		const result: any = await infoHansungService.updateInfoHansung(createInfoHansung.userHrn, {
			status: 'ACTIVE'
		});
		// console.log(result);
		expect(result).to.instanceof(Object);
	});

	it('deleteInfoHansung', async () => {
		const result: any = await infoHansungService.deleteInfoHansung(userHrn);
		// console.log(result);
		expect(result).to.instanceof(Object);
	});
});
