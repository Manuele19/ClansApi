
<template>
  <div id="app">
    <h1>Drago Nero</h1>
    <div class="container">
      <div class="card" v-for="player, tag in players" :key="tag">
        <h2>{{ player.name }} ({{ tag }}) Attacchi: {{ player.attacks.length }} su {{ player.totalAttacks }}</h2>
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
    destruction: string
    defenderTag: string
    enemyTownHallDifference: number
}

interface player {
    name: string
    totalAttacks:number
    attacks: attack[]
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey)
const clanWars = ref<clan_wars[]>([])
const players = computed((): {[key: string]: player} =>{

  const playerss: {[key: string]: player}  = {}

  clanWars.value.forEach((war) => {
    const warData = JSON.parse(war.war_data)
    warData.clan.members.forEach((p: any) => {
      if (playerss[p.tag]) {
        playerss[p.tag].attacks.push(...p.attacks)
        playerss[p.tag].totalAttacks += warData.attacksPerMember
      } else {
        playerss[p.tag]=({
          totalAttacks: warData.attacksPerMember,
          name: p.name,
          attacks: p.attacks
        })
      }
    })
  })
  return playerss
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

h2 {
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
