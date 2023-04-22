import { MintWorks, MintWorksStateManager, MintWorksTurnFactory } from 'mint-works';
import { SupabaseDatabase } from './database';
import type { Turn } from 'mint-works/dist/turn';

export interface CreateGamePlayer {
  name: string;
  age: number;
  tokens: number;
}

/**
 * Create a new game and return the game ID
 * @param players - A list of players to add to the game
 * @param database - The database to store the game in
 *
 * @returns The game ID
 */
export async function createGame({
  players,
  database,
}: {
  players: Array<CreateGamePlayer>;
  database: SupabaseDatabase;
}): Promise<string> {
  const engine = new MintWorks();

  players.forEach((player) => {
    const enginePlayer: Parameters<MintWorks['addPlayer']> = [
      {
        name: player.name,
        age: player.age,
        tokens: player.tokens,
        interactionHooks: {
          getTurnFromInterface(turns: Array<Turn>) {
            return new Promise((resolve) => resolve(turns[0]));
          },
          getPlayerSelectionFromInterface(players: Array<string>) {
            return new Promise((resolve) => resolve(players[0]));
          },
        },
      },
    ];
    engine.addPlayer(...enginePlayer);
  });

  engine.createGame();

  if (!engine.gameEngine) throw new Error('No game engine found');

  const initialGameState = engine.gameEngine.getEngineState();

  const { gameId } = await database.createGame({ state: initialGameState });

  return gameId;
}

/**
 * Get the valid turns for a game
 * @param gameId - The ID of the game to get the turns for
 * @param database - The database to get the game data from
 *
 * @returns The valid turns for the game
 */
export async function getTurns({
  gameId,
  database,
}: {
  gameId: string;
  database: SupabaseDatabase;
}): Promise<Array<Turn>> {
  const { state } = await database.getGameData({ gameId });

  const turnFactory = new MintWorksTurnFactory({
    state,
  });

  const turns = turnFactory.getTurns();

  return turns;
}

/**
 * Apply a turn to a game
 * @param gameId - The ID of the game to apply the turn to
 * @param turn - The turn to apply
 * @param database - The database to get the game data from
 */
export async function applyTurn({
  gameId,
  turn,
  database,
}: {
  gameId: string;
  turn: Turn;
  database: SupabaseDatabase;
}): Promise<void> {
  const { state } = await database.getGameData({ gameId });

  const stateManager = new MintWorksStateManager({
    state,
    turn,
  });

  const updatedState = await stateManager.simulateTurn();

  await database.setGameData({ gameId, state: updatedState });
}
