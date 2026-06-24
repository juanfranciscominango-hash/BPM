import { Component, Input, OnInit, OnChanges, inject, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessService, TimelineItem } from '../../../../core/services/process.service';

@Component({
  selector: 'app-timeline-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-modal.component.html',
  styleUrls: ['./timeline-modal.component.css']
})
export class TimelineModalComponent implements OnInit, OnChanges {
  @Input() processInstanceId!: string;
  @Input() processName!: string;

  private processService = inject(ProcessService);
  
  timelineItems: TimelineItem[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    if (this.processInstanceId) {
      this.loadTimeline();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['processInstanceId'] && !changes['processInstanceId'].isFirstChange()) {
      if (this.processInstanceId) {
        this.loadTimeline();
      }
    }
  }

  loadTimeline() {
    this.loading = true;
    this.error = '';

    this.processService.getTimeline(this.processInstanceId).subscribe({
      next: (items) => {
        this.timelineItems = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching timeline', err);
        this.error = 'No se pudo cargar la línea de tiempo del caso.';
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name || name === 'Pendiente') return 'N/A';
    // If it's a username like 'admin', we can return 'A'
    // If it's a full name like 'Juan Perez', we return 'JP'
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
