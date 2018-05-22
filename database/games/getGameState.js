const database = require('../connection');
const findGameById = require('./findGameById').findById;
const findCurrentPlayerIndexById = require('./findCurrentPlayerIndexByGameId')
  .findCurrentPlayerIndexById;
const gamesCards = require('../gamesCards');
const usersGames = require('../usersGames');

const getGameState = gameId => {
  return Promise.all([
    findGameById(gameId),
    findCurrentPlayerIndexById(gameId),
    gamesCards.findTopCardByGameId(gameId),
    gamesCards.findAllCardsInHandsById(gameId),
    usersGames.findByGameId(gameId)
  ]).then(([game, currentIndex, cardOnTop, hands, players]) => {
    let currentPlayerIndex = currentIndex.current_player_index;
    let currentUserId = -1;
    let playersHands = {};
    // console.log('---GAME');
    // console.log(game);

    // console.log('\n---CARD ON TOP');
    // console.log(cardOnTop);

    // console.log('\n---CURRENT INDEX');
    // console.log(currentIndex);

    // console.log('\n---PLAYERS');
    // console.log(players);

    // console.log('\n---HANDS');
    // console.log(hands);

    for (const [index, player] of players.entries()) {
      if (index === currentPlayerIndex) {
        player.currentPlayer = true;
        currentUserId = player.user_id;
      }
      playersHands[player.user_id] = [];
    }

    for (const card of hands) {
      if (
        card.user_id !== currentUserId ||
        (!card.color.includes(cardOnTop.color) &&
          !card.value.includes(cardOnTop.value) &&
          !card.value.includes('wild'))
      ) {
        card.disabled = true;
      }
      playersHands[card.user_id].push(card);
    }

    // console.log('\n---PLAYERS HANDS---');
    // console.log(playersHands);

    return Promise.resolve({ game, players, playersHands });
  });
};

module.exports = getGameState;