import { SupabaseClient, createClient } from '@supabase/supabase-js';
import type { MintWorksEngineState } from 'mint-works/dist/mint_works';

export class SupabaseDatabase {
  supabase: SupabaseClient;

  constructor({ url, key }: { url: string; key: string }) {
    this.supabase = createClient(url, key);
  }

  /**
   * Store a new game and return the game ID
   * @param state - The initial state of the game
   *
   * @returns The game ID
   */
  public async createGame({ state }: { state: MintWorksEngineState }): Promise<{ gameId: string }> {
    const { data, error } = await this.supabase
      .from('game')
      .insert({ state, player_to_take_turn: state.playerToTakeTurn ?? state.startingPlayerToken })
      .select('game_id')
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No game data returned from creation');
    if (!data.game_id) throw new Error('No game ID returned from creation');

    return { gameId: data.game_id };
  }

  /**
   * Get the game data for a game
   * @param gameId - The ID of the game to get the data for
   *
   * @returns The game data
   */
  public async getGameData({
    gameId,
  }: {
    gameId: string;
  }): Promise<{ state: MintWorksEngineState }> {
    const { data, error } = await this.supabase
      .from('game')
      .select('state')
      .eq('game_id', gameId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No game data found');

    return { state: data.state as MintWorksEngineState };
  }

  /**
   * Set the game data for a game
   * @param gameId - The ID of the game to set the data for
   */
  public async setGameData({
    gameId,
    state,
  }: {
    gameId: string;
    state: MintWorksEngineState;
  }): Promise<void> {
    const { error } = await this.supabase
      .from('game')
      .update({ state, player_to_take_turn: state.playerToTakeTurn })
      .eq('game_id', gameId);

    if (error) throw new Error(error.message);
  }
}
