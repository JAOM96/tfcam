import { Component, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.html',
  styleUrls: ['./camera.css'],
  imports: [MatCardModule, CommonModule]
})

export class Camera implements AfterViewInit {
  cameraGranted = false;

  @ViewChild('video2') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas2') canvasRef!: ElementRef<HTMLCanvasElement>;

  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  detector!: faceLandmarksDetection.FaceLandmarksDetector;

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.video = this.videoRef?.nativeElement;
    this.canvas = this.canvasRef?.nativeElement;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');
    this.ctx = ctx;
  }

  async requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'user' } },
        audio: false
      });

      this.cameraGranted = true;
      this.cdr.detectChanges();

      this.video.srcObject = stream;
      await this.video.play();

      // Inicializar modelo
      await tf.setBackend('webgl');
      this.detector = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        { runtime: 'tfjs', maxFaces: 1, refineLandmarks: true }
      );

      // Comenzar loop de detección
      this.detectFaces();
    } catch (err) {
      console.error('Error cámara:', err);
      alert('No se pudo acceder a la cámara. Revisa los permisos.');
    }
  }

  private async detectFaces() {
    if (!this.detector) return;

    const loop = async () => {
      if (!this.video.paused && !this.video.ended) {
        // Detectar landmarks
        const faces = await this.detector.estimateFaces(this.video, { flipHorizontal: false });

        //console.log(faces)

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Dibujar la imagen del video en todo el canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

        // Dibujar landmarks
        faces.forEach(face => {
          face.keypoints.forEach(kp => {
            this.ctx.beginPath();
            this.ctx.arc(kp.x, kp.y, 1.5, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'blue';
            this.ctx.fill();
          });
        });
      }
      requestAnimationFrame(loop);
    };

    loop();
  }


}
