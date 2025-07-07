
<template>
  <div id="app">
    <h1>Drago Nero</h1>
    filtra solo gli attacchi contro avversari con il municipio di livello
    <select id="filter" v-model="filterValue">
      <option v-for="option in filterOptions" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
    <div class="row">
      <div class="container">
        <h3>Attacchi non mancati</h3>
        <div class="card" v-for="player, key in playerByAttacks" :key="key">
          <h2>{{ player.name }} </h2>
          <h3> Attacchi dimenticati: {{ player.forgottenAttacks }} </h3>
          <h6> su {{ player.totalAttacks}} </h6>
          <h6> Distruzione media: {{ player.averageDestruction }}%</h6>
          <br />
          <div v-for="attack in player.attacks">
            <strong>
              <strong :class= "attack.stars >= 1 ? 'filled' : 'empty'">&#9733</strong>
              <strong :class= "attack.stars >= 2 ? 'filled' : 'empty'">&#9733</strong>
              <strong :class= "attack.stars >= 3 ? 'filled' : 'empty'">&#9733</strong> 
            </strong> -
            <!-- <strong>Stars:</strong> {{ attack.stars }} - -->
            {{ attack.destruction }}%
            {{ getAttackDifferenceSymbol(attack.enemyTownHallDifference)}}
            ({{ attack.defenderTag }})
            <!-- <strong>Town Hall Difference:</strong> {{ attack.enemyTownHallDifference }} -->
          </div>
        </div>
      </div>

      <div class="container">
        <h3>Distruzione media</h3>
        <div class="card" v-for="player, key in playerByDestruction" :key="key">
          <h2>{{ player.name }}</h2>
          <h3> Distruzione media: {{ player.averageDestruction }}%</h3>
          <h6> Attacchi dimenticati: {{ player.forgottenAttacks }} su {{ player.totalAttacks}} </h6>
          <br />
          <div v-for="attack in player.attacks">
            <strong>
              <strong :class= "attack.stars >= 1 ? 'filled' : 'empty'">&#9733</strong>
              <strong :class= "attack.stars >= 2 ? 'filled' : 'empty'">&#9733</strong>
              <strong :class= "attack.stars >= 3 ? 'filled' : 'empty'">&#9733</strong> 
            </strong> -
            <!-- <strong>Stars:</strong> {{ attack.stars }} - -->
            {{ attack.destruction }}%
            {{ getAttackDifferenceSymbol(attack.enemyTownHallDifference)}}
            ({{ attack.defenderTag }})
            <!-- <strong>Town Hall Difference:</strong> {{ attack.enemyTownHallDifference }} -->
          </div>
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
    war_data: any
    war_status: 'preparation' | 'inWar' | 'warEnded' | 'notInWar'
    end_time: string
}

interface attack {
  stars: number
  destruction: number
  order: number
  duration: number
  attackerTag: string
  defenderTag: string
  enemyTownHallDifference?: number
}

interface player {
    tag: string
    name: string
    totalAttacks?: number
    forgottenAttacks: number
    attacks: attack[]
    totalDestruction: number
    averageDestruction?: number
    attackRateo?: number
}

const filterValue = ref('tutti')
const supabase = createClient(config.supabaseUrl, config.supabaseKey)
const clanWars = ref<clan_wars[]>([])

const players = computed((): {[key:string]: player} =>{

  const playerss: {[key: string]: player}  = {}
  
  clanWars.value.forEach((war) => {
    const warData = war.war_data
    const enemies: {[key: string]: { th_level: number } }  = {}

    _.forEach(warData.opponent.members, (p) => {
      enemies[p.tag] = { th_level: p.townHallLevel }
    })

    _.forEach(warData.clan.members, (p) => {
      let attacks: attack[] = _.map(p.attacks, (a)=>{
        _.set(a,'enemyTownHallDifference', enemies[a.defenderTag].th_level - p.townHallLevel)
        return a as attack
      })
      
      if(filterValue.value !== 'tutti')
        attacks = _.filter(attacks, (a:attack)=>{
          if(a.enemyTownHallDifference == undefined)a.enemyTownHallDifference = 0
          switch(filterValue.value){
            case 'maggiore': 
              return a.enemyTownHallDifference > 0
            case 'maggiore o uguale':
              return a.enemyTownHallDifference >= 0
            case 'uguale':
              return a.enemyTownHallDifference === 0
            case 'minore o uguale':
              return a.enemyTownHallDifference <= 0
            case 'minore':
              return a.enemyTownHallDifference < 0
            default: return true
          }
        })
      
      let thisWarDestruction = 0

      _.forEach(attacks, (a)=>{
        thisWarDestruction += a.destruction
      })

      if (playerss[p.tag]) {
        playerss[p.tag].attacks.push(...attacks)
        playerss[p.tag].totalDestruction += thisWarDestruction
        playerss[p.tag].forgottenAttacks += warData.attacksPerMember - p.attacks.length
      } else {
        playerss[p.tag]=({
          tag: p.tag,
          name: p.name,
          attacks: attacks,
          totalDestruction: thisWarDestruction,
          forgottenAttacks: warData.attacksPerMember - p.attacks.length
        })
      }
    })
  })

  return _.mapValues(playerss, (player) => {
      player.averageDestruction = player.totalDestruction / player.attacks.length | 0
      player.totalAttacks = player.attacks.length + player.forgottenAttacks
      player.attackRateo = player.attacks.length / player.totalAttacks
      return player
    })

})

const playerByAttacks = computed((): player[] => {
  return _.orderBy(players.value,
    ['forgottenAttacks','totalAttacks','averageDestruction'],['asc','desc','desc']
  )
})

const playerByDestruction = computed((): player[] => {
  return _.orderBy(players.value,
    ['averageDestruction','attackRateo'],['desc','desc']
  )
})

function getAttackDifferenceSymbol(difference?: number) {
  if(!difference || difference == 0) return '='
  if(difference === 1) return '∧'
  if(difference > 1) return difference+'∧'
  if(difference === -1) return '∨'
  if(difference < -1) return -difference+'∨'
}

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

const filterOptions = ['tutti', 'maggiore', 'maggiore o uguale', 'uguale', 'minore o uguale', 'minore']

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
  width:50%;
  height:100%;
  flex-direction: column;
  align-items: center;
}

.card {
  background: #1d1c1c;
  border: 1px solid #eee;
  border-radius: 20px;
  margin-bottom: 20px;
  width: 80%
}

h2, h3, h5, h6 {
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
.row {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  justify-content: center;
  min-width: 700px;
}
</style>
