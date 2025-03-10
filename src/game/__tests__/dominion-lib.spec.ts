import { SupplyForPlayerCount, NOT_PRESENT } from '@/game/constants';
import { getPlayerLabel, shuffleArray } from '../dominion-lib';
import { IPlayer } from '../interfaces/player';
import { createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';

describe('SupplyForPlayerCount', () => {
  test('should return correct supply for 2 players without prosperity', () => {
    const supply = SupplyForPlayerCount(2, false);
    expect(supply.supply.estates).toBe(8);
    expect(supply.supply.duchies).toBe(8);
    expect(supply.supply.provinces).toBe(8);
    expect(supply.supply.coppers).toBe(46);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(10);
    expect(supply.supply.colonies).toBe(NOT_PRESENT);
    expect(supply.supply.platinums).toBe(NOT_PRESENT);
  });

  test('should return correct supply for 2 players with prosperity', () => {
    const supply = SupplyForPlayerCount(2, true);
    expect(supply.supply.estates).toBe(8);
    expect(supply.supply.duchies).toBe(8);
    expect(supply.supply.provinces).toBe(8);
    expect(supply.supply.coppers).toBe(46);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(10);
    expect(supply.supply.colonies).toBe(8);
    expect(supply.supply.platinums).toBe(12);
  });

  test('should return correct supply for 3 players without prosperity', () => {
    const supply = SupplyForPlayerCount(3, false);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(12);
    expect(supply.supply.coppers).toBe(39);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(20);
    expect(supply.supply.colonies).toBe(NOT_PRESENT);
    expect(supply.supply.platinums).toBe(NOT_PRESENT);
  });

  test('should return correct supply for 4 players with prosperity', () => {
    const supply = SupplyForPlayerCount(4, true);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(12);
    expect(supply.supply.coppers).toBe(32);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(30);
    expect(supply.supply.colonies).toBe(12);
    expect(supply.supply.platinums).toBe(12);
  });

  test('should return correct supply for 5 players without prosperity', () => {
    const supply = SupplyForPlayerCount(5, false);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(15);
    expect(supply.supply.coppers).toBe(85);
    expect(supply.supply.silvers).toBe(80);
    expect(supply.supply.golds).toBe(60);
    expect(supply.supply.curses).toBe(40);
    expect(supply.supply.colonies).toBe(NOT_PRESENT);
    expect(supply.supply.platinums).toBe(NOT_PRESENT);
  });

  test('should return correct supply for 6 players with prosperity', () => {
    const supply = SupplyForPlayerCount(6, true);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(18);
    expect(supply.supply.coppers).toBe(78);
    expect(supply.supply.silvers).toBe(80);
    expect(supply.supply.golds).toBe(60);
    expect(supply.supply.curses).toBe(50);
    expect(supply.supply.colonies).toBe(12);
    expect(supply.supply.platinums).toBe(12);
  });

  test('should throw an error for invalid player count', () => {
    expect(() => SupplyForPlayerCount(1, false)).toThrow(`Invalid player count: 1`);
    expect(() => SupplyForPlayerCount(7, true)).toThrow(`Invalid player count: 7`);
  });
});

describe('shuffleArray', () => {
  // Test with primitive types
  describe('with primitive types', () => {
    it('should shuffle an array of numbers', () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = shuffleArray(numbers);

      expect(result.shuffled).toHaveLength(10);
      expect(result.shuffled).toEqual(expect.arrayContaining(numbers));
      // Original array shouldn't be modified
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should shuffle an array of strings', () => {
      const strings = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
      const result = shuffleArray(strings);

      expect(result.shuffled).toHaveLength(5);
      expect(result.shuffled).toEqual(expect.arrayContaining(strings));
      // Original array shouldn't be modified
      expect(strings).toEqual(['apple', 'banana', 'cherry', 'date', 'elderberry']);
    });

    it('should handle empty arrays', () => {
      const empty: number[] = [];
      const result = shuffleArray(empty);

      expect(result.shuffled).toEqual([]);
      expect(result.changed).toBe(false);
    });

    it('should handle single-element arrays', () => {
      const single = ['solo'];
      const result = shuffleArray(single);

      expect(result.shuffled).toEqual(['solo']);
      expect(result.changed).toBe(false);
    });
  });

  // Test with complex objects
  describe('with complex objects', () => {
    it('should shuffle an array of objects', () => {
      const objects = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
        { id: 5, name: 'Eve' },
      ];

      const result = shuffleArray(objects);

      expect(result.shuffled).toHaveLength(5);
      // Check all objects are present (by reference)
      objects.forEach((obj) => {
        expect(result.shuffled).toContain(obj);
      });
    });

    it('should maintain object references', () => {
      const obj1 = { id: 1, data: { value: 'test' } };
      const obj2 = { id: 2, data: { value: 'sample' } };
      const obj3 = { id: 3, data: { value: 'example' } };

      const objects = [obj1, obj2, obj3];
      const result = shuffleArray(objects);

      // Verify references are maintained
      result.shuffled.forEach((obj) => {
        // Modifying the shuffled array's objects should affect the original objects
        if (obj.id === 1) {
          obj.data.value = 'modified';
          expect(obj1.data.value).toBe('modified');
        }
      });
    });
  });

  // Test the 'changed' flag
  describe('changed flag behavior', () => {
    it('should report changed=false for empty arrays', () => {
      expect(shuffleArray([]).changed).toBe(false);
    });

    it('should report changed=false for single-element arrays', () => {
      expect(shuffleArray([42]).changed).toBe(false);
    });

    it('should correctly detect when order has changed', () => {
      // Mock Math.random to ensure a specific shuffle order
      const originalRandom = Math.random;
      try {
        // For Fisher-Yates with array [1, 2], we start with i=1
        // We need j=0 to swap elements 1 and 0
        // So Math.random() needs to return < 0.5 to get Math.floor(Math.random() * 2) = 0
        Math.random = jest.fn().mockReturnValueOnce(0.25); // 0.25 * 2 = 0.5, Math.floor(0.5) = 0

        const result = shuffleArray([1, 2]);
        expect(result.shuffled).toEqual([2, 1]);
        expect(result.changed).toBe(true);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should correctly detect when order has not changed', () => {
      // Mock Math.random to ensure the same order
      const originalRandom = Math.random;
      try {
        // For Fisher-Yates, to keep [1, 2, 3] unchanged:
        // When i=2, j must be 2, so Math.random() needs to return ≥ 0.67 to get j=2
        // When i=1, j must be 1, so Math.random() needs to return ≥ 0.5 to get j=1
        Math.random = jest
          .fn()
          .mockReturnValueOnce(0.9) // For i=2: 0.9 * 3 = 2.7, Math.floor(2.7) = 2
          .mockReturnValueOnce(0.7); // For i=1: 0.7 * 2 = 1.4, Math.floor(1.4) = 1

        const result = shuffleArray([1, 2, 3]);
        expect(result.changed).toBe(false);
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle arrays with duplicate values', () => {
      const duplicates = [1, 1, 2, 2, 3, 3];
      const result = shuffleArray(duplicates);

      expect(result.shuffled).toHaveLength(6);
      expect(result.shuffled.sort()).toEqual([1, 1, 2, 2, 3, 3]);
    });
  });
});

describe('getPlayerLabel', () => {
  // Sample players array for testing
  const testPlayers: IPlayer[] = [
    createMockPlayer(0, { name: 'Alice' }),
    createMockPlayer(1, { name: 'Bob' }),
    createMockPlayer(2, { name: '...Charlie' }),
    createMockPlayer(3, { name: ' Dave' }),
    createMockPlayer(4, { name: '' }),
    createMockPlayer(5, { name: '   ' }),
    createMockPlayer(6, { name: '🎮Player' }),
    createMockPlayer(7, { name: '\u200BErin' }), // Zero-width space followed by Erin
    createMockPlayer(8, { name: null as unknown as string }),
    createMockPlayer(9, { name: undefined }),
    createMockPlayer(10, { name: '…Charlie' }),
  ];

  test('returns first letter of name for normal names', () => {
    expect(getPlayerLabel(testPlayers, 0)).toBe('A');
    expect(getPlayerLabel(testPlayers, 1)).toBe('B');
  });

  test('skips non-printable characters at the beginning of name', () => {
    expect(getPlayerLabel(testPlayers, 2)).toBe('.'); // . is renderable
    expect(getPlayerLabel(testPlayers, 3)).toBe('D'); // Skips space
    expect(getPlayerLabel(testPlayers, 7)).toBe('E'); // Skips zero-width space
    expect(getPlayerLabel(testPlayers, 10)).toBe('C'); // Skips ellipsis
  });

  test('returns player number for names with no printable characters', () => {
    expect(getPlayerLabel(testPlayers, 4)).toBe('5'); // Empty string
    expect(getPlayerLabel(testPlayers, 5)).toBe('6'); // Only spaces
  });

  test('returns player number for invalid player objects', () => {
    expect(getPlayerLabel(testPlayers, 8)).toBe('9'); // name is null
    expect(getPlayerLabel(testPlayers, 9)).toBe('10'); // name is undefined
  });

  test('returns player number for emoji and special character names', () => {
    expect(getPlayerLabel(testPlayers, 6)).toBe('P'); // Skips emoji, returns 'P'
  });

  test('handles edge cases with invalid inputs', () => {
    // Invalid players array
    expect(getPlayerLabel(null as unknown as IPlayer[], 0)).toBe('1');
    expect(getPlayerLabel(undefined as unknown as IPlayer[], 0)).toBe('1');
    expect(getPlayerLabel({} as unknown as IPlayer[], 0)).toBe('1');
    expect(getPlayerLabel('not an array' as unknown as IPlayer[], 0)).toBe('1');

    // Invalid player index
    expect(getPlayerLabel(testPlayers, -1)).toBe('0');
    expect(getPlayerLabel(testPlayers, 999)).toBe('1000');
    expect(getPlayerLabel(testPlayers, null as unknown as number)).toBe('1');
    expect(getPlayerLabel(testPlayers, undefined as unknown as number)).toBe('NaN');
  });

  test('handles special character names', () => {
    const specialCharPlayers: IPlayer[] = [
      createMockPlayer(0, { name: '@User1' }),
      createMockPlayer(1, { name: '#HashTag' }),
      createMockPlayer(2, { name: '$Money' }),
      createMockPlayer(3, { name: '%Percent' }),
    ];

    expect(getPlayerLabel(specialCharPlayers, 0)).toBe('@');
    expect(getPlayerLabel(specialCharPlayers, 1)).toBe('#');
    expect(getPlayerLabel(specialCharPlayers, 2)).toBe('$');
    expect(getPlayerLabel(specialCharPlayers, 3)).toBe('%');
  });
});
