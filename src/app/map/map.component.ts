import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { Store } from '@ngrx/store';
import * as fromMap from './map.reducer';
import * as Map from './map.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
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

  addLayerOnForm(add: AbstractControl) {
    this.layersArray = this.layersFields;
    this.layersArray.push(add);
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

  ngOnInit(): void {
    this.map = this.mapService.createMap();

    this.store
      .select(fromMap.getLayers)
      .pipe(first())
      .subscribe((layers) => {
        for (let layer of layers) {
          const newLayer = this.formBuilder.group({
            description: [layer.properties.description, Validators.required],
            longitude: [layer.geometry.coordinates[0], Validators.required],
            latitude: [layer.geometry.coordinates[1], Validators.required],
          });
          this.addLayerOnForm(newLayer);
        }
      });

    this.mapsForm.valueChanges.subscribe((changes) => {
      let descriptions: string[] = [];
      let newLayers: fromMap.IPointFeature[] = changes.layers.map(
        (layer: any) => {
          if (!descriptions.includes(layer.description)) {
            descriptions.push(layer.description);
            return {
              type: 'Feature',
              properties: { description: layer.description },
              geometry: {
                type: 'Point',
                coordinates: [layer.longitude, layer.latitude],
              },
            };
          } else {
            this.snackBar.open('Description needs to be unique', 'ERROR', {
              duration: 3000,
            });
          }
        }
      );
      const source: mapboxgl.GeoJSONSource = this.map.getSource(
        'points'
      ) as mapboxgl.GeoJSONSource;
      source.setData({ type: 'FeatureCollection', features: newLayers });
      this.store.dispatch(new Map.setLayers(newLayers));
    });
  }
}
