import * as fs from 'fs';
import { slack } from './slack';

describe('slack', () => {
	it('sendMessage - 메시지 전송 성공', async () => {
		const file = './packages/utils/config/env.json';
		let envData: any = await fs.readFileSync(file, 'utf8');
		envData = JSON.parse(envData);
		await slack.sendMessage('deploy', {
			attachments: [
				{
					'color': '#36a64f',
					'mrkdwn_in': ['text', 'fields'],
					'fields': [
						{
							'title': `${envData.stage} 서버 배포`,
							'value': `${envData.stage} 서버가 정상적으로 배포되었습니다.`,
							'short': false
						}
					]
				}
			]
		});
	}).timeout(1000 * 60);
});
