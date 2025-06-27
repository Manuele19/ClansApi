import hapi from '@hapi/hapi';
import fs from 'fs/promises';

const server = new hapi.Server({
	host:'10.10.1.168',
	port: 8921
})

server.start()
import { Client } from 'clashofclans.js';
import config from '../config.json';

const client = new Client({ keys: [config.apiKey]});

(async function () {
    const clan = await client.getClanWar('#VOUYJCLY');
    console.log(clan);
    const clan2 = await client.getClanWarLog('#VOUYJCLY');
    console.log(clan2[0]);
    await fs.writeFile('./currentWar.json', JSON.stringify(clan, null, 2))
    await fs.writeFile('./lastWar.json', JSON.stringify(clan2[0], null, 2))

    // try {
    //     const data = await client.getPlayer('#2PP');
    //     console.log(data);
    // } catch (error) {
    //     if (error.reason === 'notFound') {
    //         console.log('Player not Found!');
    //     } else {
    //         console.log(error);
    //     }
    // }
})();