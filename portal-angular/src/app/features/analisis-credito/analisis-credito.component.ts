import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'innova-analisis-credito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analisis-credito.html',
  styles: [`
    .info-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-weight: 500;
      color: #334155;
      min-height: 24px;
    }
  `]
})
export class AnalisisCreditoComponent implements OnInit {
  @Input() initialData: any = {};
  
  data: any = {};

  constructor() {}

  ngOnInit() {
    // Si viene como string, intentamos parsear
    if (typeof this.initialData === 'string') {
      try {
        this.data = JSON.parse(this.initialData);
      } catch (e) {
        this.data = {};
      }
    } else {
      this.data = this.initialData || {};
    }

    console.log('=== DATA ANALISIS CREDITO ===', this.data);
  }

  // Mtodos de utilidad para formatear valores
  formatMoney(value: any): string {
    if (value == null || value === '') return '';
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  formatDate(value: any): string {
    if (!value) return '';
    // Lgica simple para intentar mostrar solo la fecha si es ISO
    try {
      if (value.includes('T')) return value.split('T')[0];
    } catch(e) {}
    return value;
  }
}
