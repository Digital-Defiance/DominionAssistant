import { fieldSubfieldToGameLogAction } from '@/game/dominion-lib-log';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { PlayerSubField } from '../types';

describe('victoryFieldToGameLogAction', () => {
  it('should return ADD_ACTIONS for turn actions increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'actions', 1)).toBe(GameLogAction.ADD_ACTIONS);
  });

  it('should return REMOVE_ACTIONS for turn actions decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'actions', -1)).toBe(GameLogAction.REMOVE_ACTIONS);
  });

  it('should return ADD_BUYS for turn buys increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'buys', 1)).toBe(GameLogAction.ADD_BUYS);
  });

  it('should return REMOVE_BUYS for turn buys decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'buys', -1)).toBe(GameLogAction.REMOVE_BUYS);
  });

  it('should return ADD_COINS for turn coins increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'coins', 1)).toBe(GameLogAction.ADD_COINS);
  });

  it('should return REMOVE_COINS for turn coins decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'coins', -1)).toBe(GameLogAction.REMOVE_COINS);
  });

  it('should return ADD_CARDS for turn cards increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'cards', 1)).toBe(GameLogAction.ADD_CARDS);
  });

  it('should return REMOVE_CARDS for turn cards decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'cards', -1)).toBe(GameLogAction.REMOVE_CARDS);
  });

  it('should return ADD_GAINS for turn gains increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'gains', 1)).toBe(GameLogAction.ADD_GAINS);
  });

  it('should return REMOVE_GAINS for turn gains decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'gains', -1)).toBe(GameLogAction.REMOVE_GAINS);
  });

  it('should return ADD_POTIONS for turn potions increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'potions', 1)).toBe(GameLogAction.ADD_POTIONS);
  });

  it('should return REMOVE_POTIONS for turn potions decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'potions', -1)).toBe(GameLogAction.REMOVE_POTIONS);
  });

  it('should return ADD_COFFERS for mats coffers increment', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'coffers', 1)).toBe(GameLogAction.ADD_COFFERS);
  });

  it('should return REMOVE_COFFERS for mats coffers decrement', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'coffers', -1)).toBe(GameLogAction.REMOVE_COFFERS);
  });

  it('should return ADD_VILLAGERS for mats villagers increment', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'villagers', 1)).toBe(GameLogAction.ADD_VILLAGERS);
  });

  it('should return REMOVE_VILLAGERS for mats villagers decrement', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'villagers', -1)).toBe(
      GameLogAction.REMOVE_VILLAGERS
    );
  });

  it('should return ADD_DEBT for mats debt increment', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'debt', 1)).toBe(GameLogAction.ADD_DEBT);
  });

  it('should return REMOVE_DEBT for mats debt decrement', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'debt', -1)).toBe(GameLogAction.REMOVE_DEBT);
  });

  it('should return ADD_FAVORS for mats favors increment', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'favors', 1)).toBe(GameLogAction.ADD_FAVORS);
  });

  it('should return REMOVE_FAVORS for mats favors decrement', () => {
    expect(fieldSubfieldToGameLogAction('mats', 'favors', -1)).toBe(GameLogAction.REMOVE_FAVORS);
  });

  it('should fail for mats invalid field', () => {
    expect(() =>
      fieldSubfieldToGameLogAction('mats', 'invalid' as unknown as PlayerSubField<'mats'>, 1)
    ).toThrow(InvalidFieldError);
  });

  it('should return ADD_CURSES for victory curses increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'curses', 1)).toBe(GameLogAction.ADD_CURSES);
  });

  it('should return REMOVE_CURSES for victory curses decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'curses', -1)).toBe(GameLogAction.REMOVE_CURSES);
  });

  it('should return ADD_ESTATES for victory estates increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'estates', 1)).toBe(GameLogAction.ADD_ESTATES);
  });

  it('should return REMOVE_ESTATES for victory estates decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'estates', -1)).toBe(
      GameLogAction.REMOVE_ESTATES
    );
  });

  it('should return ADD_DUCHIES for victory duchies increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'duchies', 1)).toBe(GameLogAction.ADD_DUCHIES);
  });

  it('should return REMOVE_DUCHIES for victory duchies decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'duchies', -1)).toBe(
      GameLogAction.REMOVE_DUCHIES
    );
  });

  it('should return ADD_PROVINCES for victory provinces increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'provinces', 1)).toBe(
      GameLogAction.ADD_PROVINCES
    );
  });

  it('should return REMOVE_PROVINCES for victory provinces decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'provinces', -1)).toBe(
      GameLogAction.REMOVE_PROVINCES
    );
  });

  it('should return ADD_COLONIES for victory colonies increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'colonies', 1)).toBe(GameLogAction.ADD_COLONIES);
  });

  it('should return REMOVE_COLONIES for victory colonies decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'colonies', -1)).toBe(
      GameLogAction.REMOVE_COLONIES
    );
  });

  it('should return ADD_VP_TOKENS for victory tokens increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'tokens', 1)).toBe(GameLogAction.ADD_VP_TOKENS);
  });

  it('should return REMOVE_VP_TOKENS for victory tokens decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'tokens', -1)).toBe(
      GameLogAction.REMOVE_VP_TOKENS
    );
  });

  it('should return ADD_OTHER_VP for victory other increment', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'other', 1)).toBe(GameLogAction.ADD_OTHER_VP);
  });

  it('should return REMOVE_OTHER_VP for victory other decrement', () => {
    expect(fieldSubfieldToGameLogAction('victory', 'other', -1)).toBe(
      GameLogAction.REMOVE_OTHER_VP
    );
  });

  it('should fail for victory invalid field', () => {
    expect(() =>
      fieldSubfieldToGameLogAction('victory', 'invalid' as unknown as PlayerSubField<'victory'>, 1)
    ).toThrow(InvalidFieldError);
  });

  it('should throw InvalidFieldError for invalid field', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fieldSubfieldToGameLogAction('invalidField' as any, 'actions', 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should throw InvalidFieldError for invalid subfield', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fieldSubfieldToGameLogAction('turn', 'invalidSubfield' as any, 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should return ADD_ACTIONS for newTurn actions increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'actions', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_ACTIONS
    );
  });

  it('should return REMOVE_ACTIONS for newTurn actions decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'actions', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_ACTIONS
    );
  });

  it('should return ADD_BUYS for newTurn buys increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'buys', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_BUYS
    );
  });

  it('should return REMOVE_BUYS for newTurn buys decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'buys', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_BUYS
    );
  });

  it('should return ADD_COINS for newTurn coins increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'coins', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_COINS
    );
  });

  it('should return REMOVE_COINS for newTurn coins decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'coins', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_COINS
    );
  });

  it('should return ADD_POTIONS for newTurn potions increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'potions', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_POTIONS
    );
  });

  it('should return REMOVE_POTIONS for newTurn potions decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'potions', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_POTIONS
    );
  });

  it('should return ADD_CARDS for newTurn cards increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'cards', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_CARDS
    );
  });

  it('should return REMOVE_CARDS for newTurn cards decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'cards', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_CARDS
    );
  });

  // Test for invalid subfield
  it('should throw InvalidFieldError for invalid subfield in newTurn', () => {
    expect(() =>
      fieldSubfieldToGameLogAction('newTurn', 'invalidSubfield' as PlayerSubField<'newTurn'>, 1)
    ).toThrow(InvalidFieldError);
  });
});
