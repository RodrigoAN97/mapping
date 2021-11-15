import {
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import * as fromMap from './map/map.reducer';

export interface IState {
  map: fromMap.IMapState;
}

export const reducers: ActionReducerMap<IState> = {
  map: fromMap.mapReducer as any,
};

export const getMapState = createFeatureSelector<fromMap.IMapState>('auth');
export const getLayers = createSelector(getMapState, fromMap.getLayers);
