import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'innova-entra-id',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entra-id.html',
  styleUrl: './entra-id.scss'
})
export class EntraIdComponent {
  constructor() {}
}
