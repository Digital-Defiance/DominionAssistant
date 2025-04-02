import { IProphecyMat } from '@/game/interfaces/set-mats/prophecy';

export interface IRisingSunFeatures {
  /**
   * Mat to track prophecy points.
   */
  prophecy: IProphecyMat;
  /**
   * Whether the great leader prophecy is in play.
   */
  greatLeaderProphecy: boolean;
}
