import { Component,ViewChild,ElementRef, ChangeDetectorRef} from '@angular/core';

import {MatCardModule} from '@angular/material/card';
import { CommonModule } from '@angular/common';


import { drawConnectors } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import { FaceMesh,FACEMESH_TESSELATION, FACEMESH_LIPS, FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_LEFT_IRIS, FACEMESH_RIGHT_IRIS, FACEMESH_FACE_OVAL} from '@mediapipe/face_mesh';


@Component({
  selector: 'app-cam',
  imports: [MatCardModule,CommonModule],
  templateUrl: './cam.html',
  styleUrl: './cam.css',
})
export class Cam {

    cameraGranted = false;

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  faceMesh!: FaceMesh;
  mpCamera!: Camera;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.video = this.videoRef.nativeElement;
    this.canvas = this.canvasRef.nativeElement;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');
    this.ctx = ctx;
  }

  async requestCamera() {
    this.cameraGranted = true;
    this.cdr.detectChanges();

    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults(this.onResults.bind(this));

    this.mpCamera = new Camera(this.video, {
      onFrame: async () => {
        await this.faceMesh.send({ image: this.video });
      },
      width: 640,
      height: 480
    });

    await this.mpCamera.start();
  }

  private onResults(results: any) {
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);

    if (results.multiFaceLandmarks) {
      for (const landmarks of results.multiFaceLandmarks) {
        drawConnectors(this.ctx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        drawConnectors(this.ctx, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
        drawConnectors(this.ctx, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
        drawConnectors(this.ctx, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
        drawConnectors(this.ctx, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
        drawConnectors(this.ctx, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
        drawConnectors(this.ctx, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
        drawConnectors(this.ctx, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
        drawConnectors(this.ctx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
      }
    }

    this.ctx.restore();
  }

}
