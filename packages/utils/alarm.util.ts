import * as fs from 'fs';

export module alarmUtil {
	const file = './packages/utils/config/env.json';
	let alarmData: any = fs.readFileSync(file, 'utf8');
	alarmData = JSON.parse(alarmData);

	export interface IAlarm {
		include_player_ids: Array<string>,
		contents: {
			en?: string,
			ko?: string
		} | object
	}

	/**
	 * 알림 전송
	 * @param sendParams
	 */
	export function sendAlarm(sendParams: IAlarm) {
		let headers = {
			'Content-Type': 'application/json; charset=utf-8',
			'Authorization': `${alarmData.alarm.authorization}`
		};

		let message: any = sendParams;
		message.app_id = alarmData.alarm.appId;

		let options = {
			host: 'onesignal.com',
			port: 443,
			path: '/api/v1/notifications',
			method: 'POST',
			headers: headers
		};

		if (alarmData.alarm.isPublish === true) {
			let https = require('https');
			let req = https.request(options, function(res) {
				res.on('data', function(message) {
					console.log('Response:');
					console.log(JSON.parse(message));
				});
			});

			req.on('error', function(e) {
				console.log('ERROR:');
				console.log(e);
			});

			req.write(JSON.stringify(message));
			req.end();
		}
	}
}
