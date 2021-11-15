import { Action } from '@ngrx/store';

export const SET_LAYERS = 'SET_LAYERS';

export class setLayers implements Action {
  readonly type = SET_LAYERS;

  constructor(public payload: string) {}
}

export type mapActions = setLayers;
