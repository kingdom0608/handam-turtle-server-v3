import * as cheerio from 'cheerio';
import { infoHansungEngine, hopeHansungEngine } from '../engines';
import { infoHansungService } from '../services';

export class InfoHansungTarget {
	/**
	 * target: 인포한성 인증정보 수집
	 * @param userHrn
	 * @param id
	 * @param password
	 */
	async crawlingInfoHansung(userHrn: string, id: string, password: string) {
		try {
			await infoHansungEngine.crawlingLoginPage(id, password);

			const credentialPage = await infoHansungEngine.crawlingPage('https://info.hansung.ac.kr/tonicsoft/jik/register/collage_register_hakjuk_rwd.jsp');

			let $ = cheerio.load(credentialPage.data);

			const nameContainer = await $($(`body > form > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(3)`));
			const departmentContainer = await $($(`body > form > div > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(2)`));
			let name = null;
			let department = null;

			nameContainer.each(function() {
				name = $(this).text().trim();
			});

			departmentContainer.each(function() {
				department = $(this).text().trim();
			});

			if (name || department) {
				await infoHansungService.updateInfoHansung(userHrn, {
					status: 'SUCCESS',
					name: name,
					department: department
				});
			} else {
				await infoHansungService.updateInfoHansung(userHrn, {
					status: 'FAIL',
					name: name,
					department: department
				});
			}

			return await infoHansungService.getInfoHansung(userHrn);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * target: 인포한성 시간표 수집
	 * @param userHrn
	 * @param id
	 * @param password
	 */
	async crawlingInfoHansungSchedule(userHrn: string, id: string, password: string) {
		try {
			await infoHansungEngine.crawlingLoginPage(id, password);
			const schedulePage = await infoHansungEngine.crawlingPage('https://info.hansung.ac.kr/fuz/sugang/dae_h_siganpyo.jsp');

			let seedData: any = {
				monday: [],
				tuesday: [],
				wednesday: [],
				thursday: [],
				friday: []
			};

			let $ = cheerio.load(schedulePage.data);
			let scheduleData: any = [];

			for (let i = 2; i < 7; i++) {
				let day = [];
				let time = [];
				let content = [];

				const mainContainer = await $($(`#calendar > div.fc-view-container > div > table > tbody > tr > td > div.fc-time-grid-container.fc-scroller > div > div.fc-content-skeleton > table > tbody > tr > td:nth-child(${i})`));
				const contentContainer = await $($(`#calendar > div.fc-view-container > div > table > tbody > tr > td > div.fc-time-grid-container.fc-scroller > div > div.fc-content-skeleton > table > tbody > tr > td:nth-child(${i}) > div > a > div.fc-content > div.fc-title`));

				for (let x = 1; x < 10; x++) {
					const timeContainer = await $(`#calendar > div.fc-view-container > div > table > tbody > tr > td > div.fc-time-grid-container.fc-scroller > div > div.fc-content-skeleton > table > tbody > tr > td:nth-child(${i}) > div > a:nth-child(${x}) > div.fc-content > div.fc-time`)
						.data();

					if (timeContainer) {
						time.push(String(timeContainer.full));
					}
				}

				mainContainer.each(function() {
					const index: number = i;

					contentContainer.each(function() {
						day.push(index);
						content.push($(this).text());
					});

					if (day.length > 0 && day.length > 0) {
						for (let i = 0; i < day.length; i++) {
							scheduleData.push({
								day: day[i],
								time: time[i],
								content: content[i]
							});
						}
					}
				});
			}

			let schedule: any = {};
			let monday = [];
			let tuesday = [];
			let wednesday = [];
			let thursday = [];
			let friday = [];

			for (const row of scheduleData) {
				if (row.day === 2) {
					delete row.day;
					monday.push(row);
				}

				if (row.day === 3) {
					delete row.day;
					tuesday.push(row);
				}

				if (row.day === 4) {
					delete row.day;
					wednesday.push(row);
				}

				if (row.day === 5) {
					delete row.day;
					thursday.push(row);
				}

				if (row.day === 6) {
					delete row.day;
					friday.push(row);
				}
			}

			schedule.monday = monday;
			schedule.tuesday = tuesday;
			schedule.wednesday = wednesday;
			schedule.thursday = thursday;
			schedule.friday = friday;

			await infoHansungService.updateInfoHansung(userHrn, {
				schedule: schedule
			});

			return await infoHansungService.getInfoHansung(userHrn);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * target: 인포한성 성적 수집
	 * @param userHrn
	 * @param id
	 * @param password
	 */
	async crawlingInfoHansungGrade(userHrn: string, id: string, password: string) {
		try {
			await infoHansungEngine.crawlingLoginPage(id, password);
			const gradePage = await infoHansungEngine.crawlingPage( 'https://info.hansung.ac.kr/fuz/seongjeok/seongjeok_new_rwd.jsp');

			let seedData: any = {
				summaryGrade: {
					applyGrade: '0',
					acquisitionGrade: '0',
					ratedTotal: '0',
					averageRating: '0',
					percentile: '0',
					requiredAccomplishments: '0',
					foundationAccomplishments: '0',
					hansungHumanResources: '0',
					autonomy: '0',
					generalSelection: '0',
					requiredTeaching: '0',
					optionalTeaching: '0',
					requiredMinor: '0',
					optionalMinor: '0',
					foundationMinor: '0',
					requiredDoubleMajor: '0',
					optionalDoubleMajor: '0',
					foundationDoubleMajor: '0',
					requiredConnectedMajor: '0',
					optionalConnectedMajor: '0',
					foundationConnectedMajor: '0',
					foundationMajor: '0',
					requiredMajor: '0',
					optionalMajor: '0'
				},
				detailGrade: []
			};

			let $ = cheerio.load(gradePage.data);
			let infoSummaryArray: any = [];
			let infoDetailArray: any = [];

			for (let i = 0; i < 27; i++) {
				let text;
				const infoSummaryUri = $($(`#div_total > div:nth-child(${i}) > div.panel-body`));
				infoSummaryUri.each(function(index, element) {
					text = $(element).text();
					text = text.trim();
					infoSummaryArray.push(text);
				});
			}

			let infoSummaryObj;
			if (infoSummaryArray.length > 0) {
				infoSummaryObj = {
					applyGrade: infoSummaryArray[0], // 신청학점
					acquisitionGrade: infoSummaryArray[1], // 취득학점
					ratedTotal: infoSummaryArray[2], // 평점총계
					averageRating: infoSummaryArray[3], // 평균평점
					percentile: infoSummaryArray[4], // 백분위
					requiredAccomplishments: infoSummaryArray[5], // 기초(필수)
					foundationAccomplishments: infoSummaryArray[6], // 토대
					hansungHumanResources: infoSummaryArray[7], // 한성인재
					autonomy: infoSummaryArray[8], // 자율
					knowledge: infoSummaryArray[9], // 소양
					core: infoSummaryArray[10], // 핵심
					foundationMajor: infoSummaryArray[11], // 전기(트랙1,2)
					requiredMajor: infoSummaryArray[12], // 전지(트랙1,2)
					optionalMajor: infoSummaryArray[13], // 전선(트랙(1,2)
					generalSelection: infoSummaryArray[14], // 일선
					requiredTeaching: infoSummaryArray[15], // 교직
					optionalTeaching: infoSummaryArray[16], // 교직선
					requiredMinor: infoSummaryArray[17], // 부전지
					optionalMinor: infoSummaryArray[18], // 주전선
					foundationMinor: infoSummaryArray[19], // 부전기
					requiredDoubleMajor: infoSummaryArray[20], // 복전지
					optionalDoubleMajor: infoSummaryArray[21], // 복전선
					foundationDoubleMajor: infoSummaryArray[22], // 복전기
					requiredConnectedMajor: infoSummaryArray[23], // 연전지
					optionalConnectedMajor: infoSummaryArray[24], // 연전선
					foundationConnectedMajor: infoSummaryArray[25] // 연전기
				};
			}

			if (infoSummaryArray.length > 1 && infoSummaryArray[0] === '') {
				infoSummaryObj = {
					applyGrade: 0,
					acquisitionGrade: 0,
					ratedTotal: 0,
					averageRating: 0,
					percentile: 0,
					requiredAccomplishments: 0,
					foundationAccomplishments: 0,
					hansungHumanResources: 0,
					autonomy: 0,
					generalSelection: 0,
					requiredTeaching: 0,
					optionalTeaching: 0,
					requiredMinor: 0,
					optionalMinor: 0,
					foundationMinor: 0,
					requiredDoubleMajor: 0,
					optionalDoubleMajor: 0,
					foundationDoubleMajor: 0,
					requiredConnectedMajor: 0,
					optionalConnectedMajor: 0,
					foundationConnectedMajor: 0,
					foundationMajor: 0,
					requiredMajor: 0,
					optionalMajor: 0
				};
			}

			for (let i = 0; i < 10; i++) {
				let infoDetailObj: any = {};
				let text;
				const semesterUri = $($(`#main_content > div.container.divOutSide > div:nth-child(${i}) > div > div > div.panel-heading > h3`));
				semesterUri.each(function() {
					text = $(this).text();
					text = text.replace(/\n/g, '');
					text = text.replace(/\t/g, '');
					text = text.replace(/^\s+|\s+$/g, '');
					infoDetailObj.semester = text;
				});

				for (let x = 0; x < 6; x++) {
					const gradeSummary = $($(`#main_content > div.container.divOutSide > div:nth-child(${i}) > div > div > div.panel-body > div > div > div:nth-child(${x}) > div.panel-body`));
					const resultGradeSummary = gradeSummary.each(function() {
						text = $(this).text();
						text = text.replace(/\n/g, '');
						text = text.replace(/\t/g, '');
						text = text.replace(/^\s+|\s+$/g, '');
						return text;
					});

					if (x === 1) {
						infoDetailObj.gradeSummary = {
							applyGrade: resultGradeSummary.text()
						};
					}

					if (x === 2) {
						infoDetailObj.gradeSummary.acquisitionGrade = resultGradeSummary.text();
					}

					if (x === 3) {
						infoDetailObj.gradeSummary.totalScore = resultGradeSummary.text();
					}

					if (x === 4) {
						infoDetailObj.gradeSummary.averageScore = resultGradeSummary.text();
					}

					if (x === 5) {
						infoDetailObj.gradeSummary.percentage = resultGradeSummary.text();
					}
				}

				let division;
				let subjectName;
				let acquisitionGrade;
				let record;
				let subjectArray = [];
				const gradeDetailUri = $($(`#main_content > div.container.divOutSide > div:nth-child(${i}) > div > div > div.panel-body > table > tbody > tr`));
				gradeDetailUri.each(function() {
					subjectName = $(this).find('th').text().trim();
					division = $(this).find('td').text().trim();
					acquisitionGrade = $(this).find('td').next().next().next().next().text().trim();
					record = $(this).find('td').next().next().next().next().next().text().trim();

					subjectName.trim();
					division = division.split(/(?=[A-Z])/);
					division[0].trim();

					subjectArray.push({
						division: division[0],
						subjectName: subjectName,
						acquisitionGrade: acquisitionGrade,
						record: record
					});
				});

				infoDetailObj.gradeDetail = subjectArray;
				if (infoDetailObj.gradeDetail.length > 0) {
					infoDetailArray.push(infoDetailObj);
				}
			}

			await infoHansungService.updateInfoHansung(userHrn, {
				summaryGrade: infoSummaryObj,
				detailGrade: infoDetailArray
			});

			return await infoHansungService.getInfoHansung(userHrn);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * target: 인포한성 비교과포인트 수집
	 * @param userHrn
	 * @param id
	 * @param password
	 */
	async crawlingInfoHansungNonSubjectPoint(userHrn: string, id: string, password: string) {
		try {
			await hopeHansungEngine.crawlingLoginPage(id, password);
			const nonSubjectPointPage = await hopeHansungEngine.crawlingPage('https://hope.hansung.ac.kr/Career/CareerTask/CareerTask.aspx');

			let seedData: any = {
				applyAvailableList: '0',
				waitingCertification: '0',
				completedCertification: '0',
				declinedCertification: '0',
				myTotalPoint: '0',
				semester: {
					semester: '0',
					semesterPoint: '0'
				},
				carryOverPoint: '0',
				departmentAverage: '0',
				departmentMaximum: '0',
				gradeAverage: '0',
				gradeMaximum: '0'
			};

			let nonSubjectPoint: any = {};
			let nonSubjectPointDetail: any = [];
			let $ = cheerio.load(nonSubjectPointPage.data);

			const mainContainer = $($('#CareerTaskForm > div.wrapper.row > div.col-lg-12.m-t.no-padder > div.col-lg-3'));
			const subContainer = $($('#ReportArea > section > div > div > div > div:nth-child(3) > div.col-lg-9.lbl > span'));
			const container = $('div[class="form-group col-lg-12"]', mainContainer);
			let semester: any;
			let completedCertification: any = 0;

			$($('#Span2')).each(function() {
				nonSubjectPoint.applyAvailableList = $(this).text();
			});

			$($('#Span4')).each(function() {
				nonSubjectPoint.waitingCertification = $(this).text();
			});

			$($('#Span5')).each(function() {
				completedCertification = $(this).text();
				nonSubjectPoint.completedCertification = $(this).text();
			});

			$($('#Span6')).each(function() {
				nonSubjectPoint.declinedCertification = $(this).text();
			});

			subContainer.each(function() {
				semester = $(this).text();
			});

			container.find('div > div[class="col-lg-3 lbb text-center"]').each(function(index, element) {
				if (index === 1) {
					nonSubjectPoint.myTotalPoint = $(this).text();
				}

				if (index === 2) {
					nonSubjectPoint.semester = {
						semester: semester,
						semesterPoint: $(this).text()
					}
				}

				if (index === 3) {
					nonSubjectPoint.carryOverPoint = $(this).text();
				}

				if (index === 4) {
					nonSubjectPoint.departmentAverage = $(this).text();
				}

				if (index === 5) {
					nonSubjectPoint.departmentMaximum = $(this).text();
				}

				if (index === 6) {
					nonSubjectPoint.gradeAverage = $(this).text();
				}

				if (index === 7) {
					nonSubjectPoint.gradeMaximum = $(this).text();
				}
			});

			if (completedCertification > 0) {
				let pageCount = Math.floor(completedCertification / 10 + 1);

				for (let x = 1; x < pageCount + 1; x++) {
					const nonSubjectPointDetailPage = await hopeHansungEngine.crawlingPage(`https://hope.hansung.ac.kr/Career/CareerTask/CareerTaskMngListNew.aspx?tab=1&rp=${x}`);

					let $ = cheerio.load(nonSubjectPointDetailPage.data);

					for (let y = 1; y < 11; y++) {
						let statusContainer = await $($(`body > table > tbody > tr:nth-child(${y}) > td:nth-child(1) > label`));
						let itemContainer = await $($(`body > table > tbody > tr:nth-child(${y}) > td.ta.titleArea`));
						let scoreContainer = await $($(`body > table > tbody > tr:nth-child(${y}) > td.ta.countArea`));
						let status;
						let item;
						let score;

						statusContainer.each(function() {
							status = $(this).text().trim();
						});

						itemContainer.each(function() {
							item = $(this).text().trim();
						});

						scoreContainer.each(function() {
							score = $(this).text().trim();
						});

						let nonSubjectPointDetailList: any = {
							status: status,
							item: item,
							score: score
						};

						if (nonSubjectPointDetailList && nonSubjectPointDetailList.item && nonSubjectPointDetailList.score) {
							nonSubjectPointDetail.push(nonSubjectPointDetailList);
						}
					}
				}
			}

			let hopeHansungData: any = {
				nonSubjectPoint: nonSubjectPoint
			};

			if (nonSubjectPointDetail.length > 0) {
				hopeHansungData.nonSubjectPointDetail = nonSubjectPointDetail;
			}

			await infoHansungService.updateInfoHansung(userHrn, hopeHansungData);

			return await infoHansungService.getInfoHansung(userHrn);
		}
		catch(err) {
			throw err;
		}
	}
}

export const infoHansungTarget = new InfoHansungTarget();
