import { Injectable, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import * as fromMap from './map.reducer';
import * as Map from './map.actions';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class MapService implements OnInit {
  map: mapboxgl.Map;

  initialLongitude = -90.3295;
  initialLatitude = -0.6344;
  initialZoom = 5;
  dragging: string;
  newLayers: fromMap.IPointFeature[];
  constructor(private store: Store<fromMap.IMapState>) {}
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
      this.initialLayers();
      this.setPopUp();
      this.getPointerCursorOnEnter();
      this.centerOnClick();
      this.makeDraggable();
    });

    return this.map;
  }

  makeDraggable() {
    let down = false;
    this.map.on('mousedown', 'points', (e) => {
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
    this.store.select(fromMap.getLayers).subscribe((layers) => {
      const index = layers.findIndex(
        (point: any) => point.properties.description === this.dragging
      );

      this.newLayers = _.cloneDeep(layers);
      this.newLayers[index].geometry.coordinates = [lng, lat];

      const source: mapboxgl.GeoJSONSource = this.map.getSource(
        'points'
      ) as mapboxgl.GeoJSONSource;
      source.setData({ type: 'FeatureCollection', features: this.newLayers });
    });
  }

  onUp() {
    this.store.dispatch(new Map.setLayers(this.newLayers));
    this.map.off('mousemove', (e) => this.onMove(e));
  }

  initialLayers() {
    this.store
      .select(fromMap.getLayers)
      .pipe(first())
      .subscribe((layers) => {
        this.map.addSource('points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: layers },
        });

        this.map.addLayer({
          id: 'points',
          source: 'points',
          type: 'circle',
          paint: {
            'circle-color': '#4264fb',
            'circle-radius': 15,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#000000',
          },
        });
      });
  }

  centerOnClick() {
    this.map.on('click', 'points', (e) => {
      if (e.features) {
        this.map.flyTo({
          center: (e.features[0].geometry as any).coordinates,
          zoom: 12,
        });
      }
    });
  }

  getPointerCursorOnEnter() {
    this.map.on('mouseenter', 'points', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'points', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  setPopUp() {
    this.map.on('dblclick', 'points', (e) => {
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
    this.store.select(fromMap.getLayers).subscribe((layers) => {
      layers.forEach((layer) => {
        bounds.extend(layer.geometry.coordinates);
      });
    });

    this.map.fitBounds(bounds, { padding: 100 });
  }
}
