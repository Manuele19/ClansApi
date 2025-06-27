import axios from 'axios';

const config = await fetch('/config.json').then(response => response.json());

export const fetchClanInfo = async (clanTag:string) => {
  const apiKey = config.apiKey;
  const url = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(clanTag)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching clan information:', error);
    throw error;
  }
};