const database = require('../connection');
const getCardInDeck = require('./getCardInDeck').getCardInDeck;
const changeInDeck = require('./changeInDeck').changeInDeck;
const changeInHand = require('./changeInHand').changeInHand;
const changeOnTop = require('./changeOnTop').changeOnTop;
const changeUserId = require('./changeUserId').changeUserId;
const findCardById = require('./findCardById').findCardById;
const incrementNumberOfCardsById = require('../usersGames/incrementNumberOfCardsById')
  .incrementNumberOfCardsById;

const draw = (gameId, userId, numberOfCardsToDraw = 1) => {
  return incrementNumberOfCardsById(userId, gameId, numberOfCardsToDraw).then(
    () => {
      return getCardInDeck(gameId, numberOfCardsToDraw).then(cards => {
        console.log('num cards to draw: ');
        console.log(numberOfCardsToDraw);
        console.log('userid to draw cards to');
        console.log(userId);

        return database.task(databaseTask => {
          let queries = [];
          console.log('drawing cards below:');
          cards.forEach(card => {
            console.log(card);
            queries.push(
              Promise.all([
                changeInDeck(false, gameId, card.card_id),
                changeInHand(true, gameId, card.card_id),
                changeOnTop(false, gameId, card.card_id),
                changeUserId(userId, gameId, card.card_id)
              ]).then(() => {
                return findCardById(card.card_id, gameId);
              })
            );
          });
          return databaseTask.batch(queries);
        });
      });
    }
  );
};

module.exports = {
  draw
};
