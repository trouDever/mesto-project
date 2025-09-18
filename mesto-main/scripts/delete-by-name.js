const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const Api = require(path.join(projectRoot, 'src', 'components', 'Api.js'));

// If Api is ESM default export, require might not work; this script assumes CommonJS.
(async () => {
  try {
    const api = new Api({
      baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-42',
      headers: {
        authorization: '6634f396-3fbd-4a4f-858c-8c72fb67fb49',
        'Content-Type': 'application/json'
      }
    });

    const namesToDelete = ['grger', 'Мадрид'];
    const normalized = namesToDelete.map(n => String(n).trim().toLowerCase());

    console.log('Fetching user info and cards...');
    const [userInfo, cards] = await Promise.all([api.getUserInfo(), api.getCards()]);
    const userId = userInfo._id;
    console.log('User id:', userId);

    const targets = cards.filter(card => {
      const title = (card.name || '').toLowerCase();
      const matches = normalized.some(n => title === n || title.includes(n));
      return matches && card.owner && card.owner._id === userId;
    });

    console.log('Found', targets.length, 'matching cards owned by you.');

    for (const card of targets) {
      try {
        await api.deleteCard(card._id);
        console.log('Deleted', card._id, '-', card.name);
      } catch (err) {
        console.error('Failed to delete', card._id, card.name, err);
      }
    }

    console.log('Done.');
  } catch (err) {
    console.error('Script failed:', err);
  }
})();
