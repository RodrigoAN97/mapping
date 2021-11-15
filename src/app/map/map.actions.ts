import { Action } from '@ngrx/store';
import { IPointFeature } from './map.reducer';

export const SET_LAYERS = 'SET_LAYERS';
export const SET_LAYERS_VISIBLE = 'SET_LAYERS_VISIBLE';

export class setLayers implements Action {
  readonly type = SET_LAYERS;

  constructor(public payload: IPointFeature[]) {}
}

export class setLayersVisible implements Action {
  readonly type = SET_LAYERS_VISIBLE;

  constructor(public payload: boolean) {}
}

export type mapActions = setLayers | setLayersVisible;
