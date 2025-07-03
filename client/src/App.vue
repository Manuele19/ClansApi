
<template>
  <div id="app">
    <h1>Drago Nero</h1>
    <div class="container">
      <div class="card" v-for="player, key in players" :key="key">
        <h2>{{ player.name }} ({{ player.tag }}) Attacchi: {{ player.attacks.length }} su {{ player.totalAttacks }} = {{ player.attackRateo? (player.attackRateo * 100)+'%': '' }} </h2>
        <h5> Distruzione media: {{ player.averageDestruction }}% , Contro stesso livello th: {{ player.averageDestructionAgainstSameTh }}%</h5>
        <br />
        <div v-for="attack in player.attacks">
          <strong>
            <strong :class= "attack.stars >= 1 ? 'filled' : 'empty'">&#9733</strong>
            <strong :class= "attack.stars >= 2 ? 'filled' : 'empty'">&#9733</strong>
            <strong :class= "attack.stars >= 3 ? 'filled' : 'empty'">&#9733</strong> 
          </strong>-
          <!-- <strong>Stars:</strong> {{ attack.stars }} - -->
          <strong>Destruction:</strong> {{ attack.destruction }}% -
          <strong>Enemy Tag:</strong> {{ attack.defenderTag }} 
          <!-- <strong>Town Hall Difference:</strong> {{ attack.enemyTownHallDifference }} -->
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { createClient } from '@supabase/supabase-js';
import config from '../config.json';
import { computed, onBeforeMount, ref } from 'vue';
import _ from 'lodash'

interface clan_wars {
    id: number
    enemy_tag: string
    enemy_name: string
    war_data: string
    war_status: 'preparation' | 'inWar' | 'warEnded' | 'notInWar'
    end_time: string
}

interface attack {
    stars: number
    destruction: number
    defenderTag: string
    enemyTownHallDifference?: number
}

interface player {
    tag: string
    name: string
    totalAttacks: number
    attacks: attack[]
    totalDestruction: number
    averageDestruction?: number
    attackRateo?: number
    totalAttacksAgainstSameTh: number
    totalDestructionAgainstSameTh:  number
    averageDestructionAgainstSameTh?: number
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey)
const clanWars = ref<clan_wars[]>([])

const players = computed((): player[] =>{

  const playerss: {[key: string]: player}  = {}
  
  clanWars.value.forEach((war) => {
    const warData = JSON.parse(war.war_data)
    
    const enemies: {[key: string]: { th_level: number } }  = {}

    warData.opponent.members.forEach((p: any) => {
      enemies[p.tag]=({
        th_level:p.townHallLevel
      })
    })

    warData.clan.members.forEach((p: any) => {
      let thisWarDestruction = 0
      let attacksAgainstSameTh = 0
      let thisWarDestructionAgainstSameTh = 0
      
      const attacks: attack[] = _.map(p.attacks, (a: attack)=>{
        a.enemyTownHallDifference = enemies[a.defenderTag].th_level - p.townHallLevel
        thisWarDestruction += a.destruction
        if(a.enemyTownHallDifference == 0){
          thisWarDestructionAgainstSameTh += a.destruction
          attacksAgainstSameTh++
        }
        return a
      })

      if (playerss[p.tag]) {
        playerss[p.tag].attacks.push(...attacks)
        playerss[p.tag].totalAttacks += warData.attacksPerMember
        playerss[p.tag].totalAttacksAgainstSameTh += attacksAgainstSameTh
        playerss[p.tag].totalDestruction += thisWarDestruction
        playerss[p.tag].totalDestructionAgainstSameTh += thisWarDestructionAgainstSameTh
      } else {
        playerss[p.tag]=({
          tag: p.tag,
          totalAttacks: warData.attacksPerMember,
          name: p.name,
          attacks: p.attacks,
          totalAttacksAgainstSameTh: attacksAgainstSameTh,
          totalDestruction: thisWarDestruction,
          totalDestructionAgainstSameTh: thisWarDestructionAgainstSameTh
        })
      }
    })
  })

  return _.orderBy(_.mapValues(playerss, (player) => {
      player.averageDestruction = player.totalDestruction / player.attacks.length | 0
      player.averageDestructionAgainstSameTh = player.totalDestructionAgainstSameTh / player.totalAttacksAgainstSameTh | 0
      player.attackRateo = player.attacks.length / player.totalAttacks
      return player
    }),
    ['averageDestructionAgainstSameTh','averageDestruction','attackRateo'],['desc']
  )
})

onBeforeMount(async () => {
    const { data, error } = await supabase
        .from('clan_wars')
        .select('*')

    if (error) {
        console.error('Error fetching clan wars:', error)
    } else {
        clanWars.value = data
    }
})


</script>
<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #f5b8b8;
  background-color: #8b3737;
  width:100vw;
  height:100vh;
  margin: 0px;
}

#app {
  width:inherit;
  height:95%;
  width: 90%;
  overflow: scroll;
  scrollbar-width: none;;
}

.container {
  display: flex;
  width:100%;
  height:100%;
  flex-direction: column;
  align-items: center;
}

.card {
  background: #1d1c1c;
  border: 1px solid #eee;
  border-radius: 20px;
  margin-bottom: 20px;
  width: 95%;
}

h2, h5 {
  margin-top: 0;
  text-align: left;
}

.filled {
  color: #eeff00;
  width: 10px;
}
.empty {
  color: #ffffff70;
  width: 10px;
}
</style>
