import { Component, OnInit } from '@angular/core';
import { MapService } from './map.service';
import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  constructor(private mapService: MapService) {}

  fitScreen() {
    this.mapService.fitScreen();
  }

  ngOnInit(): void {
    this.mapService.createMap();
  }
}
