import { Injectable, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnInit {
  map: mapboxgl.Map;
  initialSource: mapboxgl.GeoJSONSourceRaw = {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [-91.3952, -0.9145],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [-90.3295, -0.6344],
          },
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [-91.3403, 0.0164],
          },
        },
      ],
    },
  };
  initialLongitude = -90.3295;
  initialLatitude = -0.6344;
  initialZoom = 5;
  allMarkers: mapboxgl.Marker[] = [];
  constructor() {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  createMap() {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: `https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json?key=${environment.mapTiler.key}`,
      zoom: this.initialZoom,
      center: [this.initialLongitude, this.initialLatitude],
    });
    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load', () => {
      this.addLayers();
      this.getPointerCursorOnEnter();
      this.centerOnClick();
    });
  }

  addLayers() {
    this.map.addSource('points', this.initialSource);

    this.map.addLayer({
      id: 'circle',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-color': '#4264fb',
        'circle-radius': 15,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#000000',
      },
    });
  }

  centerOnClick() {
    this.map.on('click', 'circle', (e) => {
      this.map.flyTo({
        center: e.lngLat,
        zoom: 12,
      });
    });
  }

  getPointerCursorOnEnter() {
    this.map.on('mouseenter', 'circle', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'circle', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  setPopUp(text: string): mapboxgl.Popup {
    return new mapboxgl.Popup({ offset: 25 }).setText(text);
  }

  fitScreen() {
    var bounds = new mapboxgl.LngLatBounds();
    (this.initialSource.data as any).features.forEach((feature: any) => {
      bounds.extend(feature.geometry.coordinates);
    });

    this.map.fitBounds(bounds, { padding: 100 });
  }

  makeMarkersDraggable() {
    this.allMarkers.forEach((marker) => {
      marker.setDraggable(true);
    });
  }
}
