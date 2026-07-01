import { Directive, ElementRef, HostListener, OnInit, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTwoDecimals]',
  standalone: true
})
export class TwoDecimalsDirective implements OnInit {

  constructor(private el: ElementRef, @Optional() private control: NgControl) {}

  ngOnInit() {
    setTimeout(() => {
      this.formatValue(this.el.nativeElement.value);
    }, 100);
    
    // Listen for model changes to keep it formatted
    if (this.control && this.control.valueChanges) {
      this.control.valueChanges.subscribe(value => {
        if (document.activeElement !== this.el.nativeElement) {
          this.formatValue(value);
        }
      });
    }
  }

  @HostListener('blur')
  onBlur() {
    this.formatValue(this.el.nativeElement.value);
  }

  private formatValue(value: string) {
    if (value !== null && value !== undefined && value !== '') {
      const val = parseFloat(value);
      if (!isNaN(val)) {
        // change to text to ensure .00 is shown
        if (this.el.nativeElement.type === 'number') {
           this.el.nativeElement.type = 'text';
        }
        this.el.nativeElement.value = val.toFixed(2);
      }
    }
  }
}
