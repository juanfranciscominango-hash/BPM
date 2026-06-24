import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SCROLL } from '../../constantes';

@Component({
  selector: 'innova-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-to-top.html',
  styleUrl: './scroll-to-top.scss'
})
export class ScrollToTopComponent implements OnInit {
  isVisible = false; // Restaurado a la lógica normal
  private scrollThreshold = SCROLL.THRESHOLD_SHOW;

  ngOnInit() {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isVisible = scrollTop > this.scrollThreshold;
  }

  scrollToTop() {
    window.scrollTo({
      top: SCROLL.SCROLL_OFFSET,
      behavior: 'smooth'
    });
  }
}

