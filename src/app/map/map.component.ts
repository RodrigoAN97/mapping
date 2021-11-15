import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import { Store } from '@ngrx/store';
import * as fromMap from './map.reducer';
import * as Map from './map.actions';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  map: mapboxgl.Map;
  pointsVisible = true;
  constructor(
    private mapService: MapService,
    private store: Store<fromMap.IMapState>
  ) {}

  fitScreen() {
    this.mapService.fitScreen();
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
  }
}
