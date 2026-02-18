import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Cam } from './cam/cam';
import { Camera } from './camera/camera';
import { MatGridList,MatGridTile } from '@angular/material/grid-list';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Cam,Camera,MatGridList,MatGridTile],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  //protected readonly title = signal('tflitecam');

}
