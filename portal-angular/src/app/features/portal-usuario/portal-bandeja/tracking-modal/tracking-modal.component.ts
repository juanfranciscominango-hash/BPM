import { Component, Input, OnInit, OnChanges, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessService, TrackingItem } from '../../../../core/services/process.service';

@Component({
  selector: 'app-tracking-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracking-modal.component.html',
  styleUrls: ['./tracking-modal.component.css']
})
export class TrackingModalComponent implements OnInit, OnChanges {
  @Input() processInstanceId!: string;
  @Input() processName!: string;

  private processService = inject(ProcessService);
  
  trackingItems: TrackingItem[] = [];
  loading = false;
  error = '';
  expandedRow: string | null = null;

  ngOnInit() {
    if (this.processInstanceId) {
      this.loadTracking();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['processInstanceId'] && !changes['processInstanceId'].isFirstChange()) {
      if (this.processInstanceId) {
        this.loadTracking();
      }
    }
  }

  loadTracking() {
    this.loading = true;
    this.error = '';
    this.expandedRow = null;

    this.processService.getTracking(this.processInstanceId).subscribe({
      next: (items) => {
        this.trackingItems = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching tracking', err);
        this.error = 'No se pudo cargar el tracking del caso.';
        this.loading = false;
      }
    });
  }

  toggleRow(itemId: string) {
    if (this.expandedRow === itemId) {
      this.expandedRow = null;
    } else {
      this.expandedRow = itemId;
    }
  }
}
