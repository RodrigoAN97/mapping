import { Injectable, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnInit {
  map: mapboxgl.Map;
  data: any = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { description: 'First' },
        geometry: {
          type: 'Point',
          coordinates: [-91.3952, -0.9145],
        },
      },
      {
        type: 'Feature',
        properties: { description: 'Second' },
        geometry: {
          type: 'Point',
          coordinates: [-90.3295, -0.6344],
        },
      },
      {
        type: 'Feature',
        properties: { description: 'Third' },
        geometry: {
          type: 'Point',
          coordinates: [-91.3403, 0.0164],
        },
      },
    ],
  };

  initialLongitude = -90.3295;
  initialLatitude = -0.6344;
  initialZoom = 5;
  dragging: string;
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
      this.setPopUp();
      this.getPointerCursorOnEnter();
      this.centerOnClick();
      this.makeDraggable();
    });
  }

  makeDraggable() {
    let down = false;
    this.map.on('mousedown', 'initial', (e) => {
      down = true;
      const description = e.features && e.features[0].properties?.description;
      this.dragging = description;
      e.preventDefault();
      this.map.on('mousemove', (e) => {
        down && this.onMove(e);
      });
      this.map.once('mouseup', () => {
        down = false;
        this.onUp();
      });
    });
  }

  onMove(
    e: (mapboxgl.MapMouseEvent | mapboxgl.MapTouchEvent) & mapboxgl.EventData
  ) {
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;
    const index = this.data.features.findIndex(
      (point: any) => point.properties.description === this.dragging
    );
    this.data.features[index].geometry.coordinates = [lng, lat];

    const source: mapboxgl.GeoJSONSource = this.map.getSource(
      'initial'
    ) as mapboxgl.GeoJSONSource;
    source.setData(this.data);
  }

  onUp() {
    this.map.off('mousemove', (e) => this.onMove(e));
  }

  addLayers() {
    this.map.addSource('initial', {
      type: 'geojson',
      data: this.data,
    });

    this.map.addLayer({
      id: 'initial',
      source: 'initial',
      type: 'circle',
      paint: {
        'circle-color': '#4264fb',
        'circle-radius': 15,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#000000',
      },
    });
  }

  centerOnClick() {
    this.map.on('click', 'initial', (e) => {
      if (e.features) {
        this.map.flyTo({
          center: (e.features[0].geometry as any).coordinates,
          zoom: 12,
        });
      }
    });
  }

  getPointerCursorOnEnter() {
    this.map.on('mouseenter', 'initial', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'initial', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  setPopUp() {
    this.map.on('dblclick', 'initial', (e) => {
      if (e.features && e.features[0].properties) {
        e.preventDefault();
        new mapboxgl.Popup()
          .setLngLat((e.features[0].geometry as any).coordinates)
          .setText(e.features[0].properties.description)
          .addTo(this.map);
      }
    });
  }

  fitScreen() {
    var bounds = new mapboxgl.LngLatBounds();
    this.data.features.forEach((feature: any) => {
      bounds.extend(feature.geometry.coordinates);
    });

    this.map.fitBounds(bounds, { padding: 100 });
  }
}
