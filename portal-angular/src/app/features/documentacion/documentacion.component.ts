import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'innova-documentacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './documentacion.html',
  styleUrl: './documentacion.scss'
})
export class DocumentacionComponent {
  constructor() {}
}
