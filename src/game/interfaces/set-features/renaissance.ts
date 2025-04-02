import { IPlayer } from '../player';

export interface IRenaissanceFeatures {
  /**
   * Whether to enable the Flag Bearer card.
   */
  flagBearerEnabled: boolean;
  /**
   * Tracks who holds the Flag Bearer card.
   */
  flagBearer: IPlayer | null;
}
