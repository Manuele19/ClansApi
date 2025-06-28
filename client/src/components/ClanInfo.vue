<template>
  <div class="clan-info">
    <h2>{{ clan?.name }}</h2>
    <p><strong>Tag:</strong> {{ clan?.tag }}</p>
    <p><strong>Level:</strong> {{ clan?.level }}</p>
    <p><strong>Type:</strong> {{ clan?.type }}</p>
    <p><strong>Description:</strong> {{ clan?.description }}</p>
  </div>
</template>

<script setup lang="ts">

import { Clan, Client } from 'clashofclans.js';
import { onBeforeMount, ref } from 'vue';
import config from '../../../server/config.json';

const client = new Client({ keys: [config.apiKey]});
const clan = ref<Clan>();

onBeforeMount(async () => {
  clan.value = await client.getClan('#VOUYJCLY');
})

</script>

<style scoped>
.clan-info {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>
