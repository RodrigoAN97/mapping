import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: mapboxgl.Map;
  initialLatitude = 45.899977;
  initialLongitude = 6.172652;
  initialZoom = 12;  
  constructor() {}

  createMap() {
    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: `https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json?key=${environment.mapTiler.key}`,
      zoom: this.initialZoom,
      center: [this.initialLongitude, this.initialLatitude],
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  addMarker(longitude: number, latitude: number) {
    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(this.map);
  }
}
