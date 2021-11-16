import { createFeatureSelector, createSelector } from '@ngrx/store';
import { mapActions, SET_LAYERS, SET_LAYERS_VISIBLE } from './map.actions';

export interface IMapState {
  layers: IPointFeature[];
  layersVisible: boolean;
}

export interface IPointFeature {
  type: 'Feature';
  properties: { description: string; id: number };
  geometry: { type: 'Point'; coordinates: [number, number] };
}

const initialState: IMapState = {
  layers: [
    {
      type: 'Feature',
      properties: { description: 'First', id: 0 },
      geometry: {
        type: 'Point',
        coordinates: [-91.3952, -0.9145],
      },
    },
    {
      type: 'Feature',
      properties: { description: 'Second', id: 1 },
      geometry: {
        type: 'Point',
        coordinates: [-90.3295, -0.6344],
      },
    },
    {
      type: 'Feature',
      properties: { description: 'Third', id: 2 },
      geometry: {
        type: 'Point',
        coordinates: [-91.3403, 0.0164],
      },
    },
  ],
  layersVisible: true,
};

export function mapReducer(state = initialState, action: mapActions) {
  switch (action.type) {
    case SET_LAYERS:
      return {
        ...state,
        layers: action.payload,
      };
    case SET_LAYERS_VISIBLE:
      return { ...state, layersVisible: action.payload };
    default: {
      return state;
    }
  }
}

export const getMapState = createFeatureSelector<IMapState>('map');

export const getLayers = createSelector(
  getMapState,
  (state: IMapState) => state.layers
);

export const getLayersVisible = createSelector(
  getMapState,
  (state: IMapState) => state.layersVisible
);
