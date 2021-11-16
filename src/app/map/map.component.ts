import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { Store } from '@ngrx/store';
import * as fromMap from './map.reducer';
import * as Map from './map.actions';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  map: mapboxgl.Map;
  pointsVisible = true;
  mapsForm: FormGroup;
  layersArray: FormArray;
  constructor(
    private mapService: MapService,
    public store: Store<fromMap.IMapState>,
    private formBuilder: FormBuilder
  ) {
    this.initialForm();
  }

  initialForm() {
    this.mapsForm = this.formBuilder.group({
      layers: this.formBuilder.array([]),
    });
  }

  get fromMap(): typeof fromMap {
    return fromMap;
  }

  get layersFields(): FormArray {
    return this.mapsForm.get('layers') as FormArray;
  }

  fitScreen() {
    this.mapService.fitScreen();
  }

  addLayerOnForm(add: AbstractControl | null) {
    if (add === null) {
      const center = this.map.getCenter();
      add = this.formBuilder.group({
        description: ['', Validators.required],
        longitude: [center.lng, Validators.required],
        latitude: [center.lat, Validators.required],
      });
    }
    this.layersArray = this.layersFields;
    this.layersArray.push(add);
  }

  deleteLayerOnForm(index: number) {
    this.layersArray = this.layersFields;
    this.layersArray.removeAt(index);
  }

  hideShowLayers() {
    this.pointsVisible =
      this.map.getLayoutProperty('points', 'visibility') === 'visible' ||
      !this.map.getLayoutProperty('points', 'visibility');
    if (this.pointsVisible) {
      this.map.setLayoutProperty('points', 'visibility', 'none');
    } else {
      this.map.setLayoutProperty('points', 'visibility', 'visible');
    }
    this.store.dispatch(new Map.setLayersVisible(!this.pointsVisible));
    this.pointsVisible = !this.pointsVisible;
  }

  initialLayers(layers: fromMap.IPointFeature[]) {
    this.initialForm();
    for (let layer of layers) {
      const newLayer = this.formBuilder.group({
        description: [layer.properties.description, Validators.required],
        longitude: [layer.geometry.coordinates[0], Validators.required],
        latitude: [layer.geometry.coordinates[1], Validators.required],
      });
      this.addLayerOnForm(newLayer);
    }
  }

  updateCoordinates(updatedLayers: fromMap.IPointFeature[]) {
    const newLayers = this.layersFields.value.map((layer: any, i: number) => {
      const coordinates = updatedLayers[i].geometry.coordinates;
      layer.longitude = coordinates[0];
      layer.latitude = coordinates[1];
      return layer;
    });
    this.layersFields.patchValue(newLayers);
  }

  ngOnInit(): void {
    this.map = this.mapService.createMap();

    this.store
      .select(fromMap.getLayers)
      .pipe(first())
      .subscribe((layers) => {
        this.initialLayers(layers);
      });

    this.layersFields.valueChanges.subscribe((changes) => {
      let newLayers: fromMap.IPointFeature[] = changes.map(
        (layer: any, index: number) => {
          return {
            type: 'Feature',
            properties: {
              description: layer.description,
              id: index,
            },
            geometry: {
              type: 'Point',
              coordinates: [layer.longitude, layer.latitude],
            },
          };
        }
      );
      console.log(newLayers);
      const source: mapboxgl.GeoJSONSource = this.map.getSource(
        'points'
      ) as mapboxgl.GeoJSONSource;
      source.setData({ type: 'FeatureCollection', features: newLayers });
      this.store.dispatch(new Map.setLayers(newLayers));
    });

    this.map.on('mousedown', 'points', (e) => {
      e.preventDefault();
      this.map.once('mouseup', () => {
        this.store
          .select(fromMap.getLayers)
          .pipe(first())
          .subscribe((layers) => {
            layers?.length && this.updateCoordinates(layers);
          });
      });
    });
  }
}
