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
    .custom-tabs {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background-color: #f8fafc;
      overflow: hidden;
      margin-bottom: 1rem;
      display: flex;
    }
    .custom-tabs .nav-item {
      border-right: 1px solid #e2e8f0;
      flex: 1 1 auto;
      text-align: center;
    }
    .custom-tabs .nav-item:last-child {
      border-right: none;
    }
    .custom-tabs .nav-link {
      color: #64748b;
      font-weight: 600;
      border: none;
      border-radius: 0;
      transition: all 0.2s ease;
      background-color: transparent;
      padding: 0.75rem 1rem;
    }
    .custom-tabs .nav-link:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .custom-tabs .nav-link.active {
      color: #0d6efd;
      background-color: white;
      border-bottom: 2px solid #0d6efd;
    }
  `]
})
export class AnalisisCreditoComponent implements OnInit {
  @Input() initialData: any = {};
  
  data: any = {};
  activeTab: string = 'info';

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
