// import hapi from '@hapi/hapi';
// import fs from 'fs/promises';

import { Client } from 'clashofclans.js';
import config from '../config.json';
import { createClient } from '@supabase/supabase-js';

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

const fetchData = async() =>{
    const currentClanWar = await client.getClanWar('#VOUYJCLY');
    console.log('fetched last war against ' + currentClanWar.opponent.name, currentClanWar.clan.attackCount);

    let { data: clan_wars, error } = await supabase
        .from('clan_wars')
        .select('id,enemy_tag,war_status,end_time')
        .eq('enemy_tag', currentClanWar.opponent.tag)
        // .in('war_status',['preparation','inWar'])
        .eq('end_time', new Date(currentClanWar.endTime).toDateString())

    if (error) {
        console.error('Error fetching clan wars:', error);
        return
    }
    
    if (clan_wars.length > 0) {
        if(clan_wars[0].war_status === 'warEnded'){
            console.log('War already ended for ' + clan_wars[0].enemy_tag + ' on ' + clan_wars[0].end_time);
            return
        }
        const war: Partial<clan_wars> = {
            war_data: JSON.stringify(currentClanWar),
            war_status: currentClanWar.state,
        }
        const { error } = await supabase
        .from('clan_wars')
        .update(war)
        .eq('id', clan_wars[0].id)
        
        if (error) {
            console.error('Error updating clan war:', error);
            return
        }
        console.log('Updated existing war with id: ' + clan_wars[0].id);
    }
    else{
        const war: Partial<clan_wars> = {
            enemy_tag: currentClanWar.opponent.tag,
            enemy_name: currentClanWar.opponent.name,
            war_data: JSON.stringify(currentClanWar),
            war_status: currentClanWar.state,
            end_time: new Date(currentClanWar.endTime).toDateString()
        }
        const { error } = await supabase
        .from('clan_wars')
        .insert(war)
        if (error) {
            console.error('Error inserting clan war:', error);
            return
        }
        console.log('Inserted new war against ' + currentClanWar.opponent.name);
    }
    
    // await fs.writeFile('./currentWar.json', JSON.stringify(clan, null, 2))
    
    
    // const clan2 = await client.getClanWarLog('#VOUYJCLY');
    // console.log(clan2[0]);
    // await fs.writeFile('./lastWar.json', JSON.stringify(clan2[0], null, 2))
}

const fetchInterval =  (seconds: number)=>{
    try{
        fetchData()
    }
    catch(error) {
        console.error('Error fetching data:', error)
    }
    
    setTimeout(() => fetchInterval(seconds), seconds * 1000); // Fetch every 60 seconds
}

fetchInterval(60)
// const server = new hapi.Server({
//     host:'localhost',
//     port: 8921
// })

// server.start()