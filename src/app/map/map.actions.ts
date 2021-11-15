import { Action } from '@ngrx/store';
import { IPointFeature } from './map.reducer';

export const SET_LAYERS = 'SET_LAYERS';

export class setLayers implements Action {
  readonly type = SET_LAYERS;

  constructor(public payload: IPointFeature[]) {}
}

export type mapActions = setLayers;
