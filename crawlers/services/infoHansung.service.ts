import { InfoHansungModel } from '../models';

interface IInfoHansung {
	userHrn: string,
	infoHansungId: string,
	infoHansungPassword: string,
	name?: string,
	status?: string,
	errorMessage?: string
}

export class InfoHansungService extends InfoHansungModel {
	/**
	 * service: infoHansung 생성
	 * @param data
	 */
	async createInfoHansung(data: IInfoHansung) {
		data.status = data.status || 'UNVERIFIED';
		return await this.create(data);
	}

	/**
	 * service: infoHansung 리스트 조회
	 * @param userHrn
	 */
	async listInfoHansung(userHrn: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this.db
				.query(userHrn)
				.exec((err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(this.getResults(result));
					}
				})
		})
	}

	/**
	 * service: infoHansung 조회
	 * @param userHrn
	 */
	async getInfoHansung(userHrn: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			this.db
				.query(userHrn)
				.exec((err, result) => {
					if (err) {
						reject(err);
					} else {
						resolve(this.getResult(result));
					}
				});
		});
	}

	/**
	 * service: infoHansung 업데이트
	 * @param userHrn
	 * @param infoHansungData
	 */
	async updateInfoHansung(userHrn: string, infoHansungData: any) {
		infoHansungData.userHrn = userHrn;
		return super.update(infoHansungData);
	}

	/**
	 * service: infoHansung 삭제
	 * @param userHrn
	 */
	async deleteInfoHansung(userHrn: string) {
		return super.destroy(userHrn);
	}
}

export const infoHansungService: InfoHansungService = new InfoHansungService();
