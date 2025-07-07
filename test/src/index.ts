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
// client.getClanWar('#V0UYJCLY')
// .then((data)=>{
//     console.log('Clan')
//     console.log(JSON.stringify(data))
// })

// client.getCurrentWar({clanTag: '#V0UYJCLY', round: 'CurrentRound'})
// .then((data)=>{
//     console.log('Current')
//     console.log(data)
// })

// client.getClanWarLeagueGroup('#V0UYJCLY')
// client.getCurrentWar({clanTag: '#V0UYJCLY', round:'PreviousRound'})
client.getClanWarLeagueRound({clanTag: '#V0UYJCLY', warTag: '#8PJ8U80CC'})
.then((data)=>{
    console.log('Current')
    console.log(data)
})


// const server = new hapi.Server({
//     host:'localhost',
//     port: 8921
// })

// server.start()



    // warTags: [ '#8PRU8C0YQ' ],
    // warTags: [ '#8PJ02VRY9' ],
    // warTags: [ '#8PJ8U80CC' ],
    // warTags: [ '#8PJYLRYRC', '#8PJYLRGPY', '#8PJYLRQ02', '#8PJYLRRGR' ],
    // warTags: [ '#8PJG89PPY', '#8PJG89902', '#8PJG89YGR', '#8PJG89LUV' ],