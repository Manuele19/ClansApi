// import hapi from '@hapi/hapi';
// import fs from 'fs/promises';

import { Client } from 'clashofclans.js';
import config from '../../server/config.json';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';

interface  clan_wars {
    id: number
    enemy_tag: string
    enemy_name: string
    war_data: string
    war_status: 'preparation' | 'inWar' | 'warEnded' | 'notInWar'
    end_time: string
}

const client = new Client({ keys: [config.apiKey]});
const supabase = createClient(config.supabaseUrl, config.supabaseKey)

// client.getClanWarLeagueGroup('#VOUYJCLY')
// .then(async (data)=>{
//     console.log(data)
//     await fs.writeFile('cwlgroup.json', JSON.stringify(data, null, 2));
// })
// client.getClanWarLeagueRound('#VOUYJCLY')
// .then(async (data)=>{
//     console.log(data)
//     await fs.writeFile('cwlround.json', JSON.stringify(data, null, 2));
// })
client.getClanWar('#V0UYJCLY')
.then((data)=>{
    console.log('Clan')
    console.log(JSON.stringify(data))
})

client.getCurrentWar('#V0UYJCLY')
.then((data)=>{
    console.log('Current')
    console.log(JSON.stringify(data))
})


// const server = new hapi.Server({
//     host:'localhost',
//     port: 8921
// })

// server.start()