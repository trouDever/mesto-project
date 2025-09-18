const fetch = require('node-fetch');
const baseUrl = 'https://mesto.nomoreparties.co/v1/cohort-42';
const headers = {
  authorization: '6634f396-3fbd-4a4f-858c-8c72fb67fb49',
  'Content-Type': 'application/json'
};

const namesToDelete = ['grger', 'Мадрид'];
const normalized = namesToDelete.map(n => String(n).trim().toLowerCase());

async function handleResponse(res) {
  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(`HTTP ${res.status}: ${text}`);
}

(async () => {
  try {
    console.log('Fetching user info...');
    const userRes = await fetch(`${baseUrl}/users/me`, { method: 'GET', headers });
    const userInfo = await handleResponse(userRes);
    const userId = userInfo._id;
    console.log('User id:', userId);

    console.log('Fetching cards...');
    const cardsRes = await fetch(`${baseUrl}/cards`, { method: 'GET', headers });
    const cards = await handleResponse(cardsRes);

    const targets = cards.filter(card => {
      const title = (card.name || '').toLowerCase();
      const matches = normalized.some(n => title === n || title.includes(n));
      return matches && card.owner && card.owner._id === userId;
    });

    console.log('Found', targets.length, 'matching cards owned by you.');

    for (const card of targets) {
      try {
        const delRes = await fetch(`${baseUrl}/cards/${card._id}`, { method: 'DELETE', headers });
        await handleResponse(delRes);
        console.log('Deleted', card._id, '-', card.name);
      } catch (err) {
        console.error('Failed to delete', card._id, card.name, err.message || err);
      }
    }

    console.log('Done.');
  } catch (err) {
    console.error('Script failed:', err.message || err);
  }
})();
