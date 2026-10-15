import { DOCUMENT, Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Foco de una ventana modal (diálogo, drawer, confirmación): al abrirse lleva el foco al panel para que
 * el lector de pantalla anuncie su título, mantiene Tab / Shift+Tab dentro del panel y, al cerrarse,
 * devuelve el foco al elemento que la abrió.
 */
@Directive({
  selector: '[appFocusTrap]',
  host: {
    tabindex: '-1',
    '(keydown.tab)': 'cycle($event)',
    '(keydown.shift.tab)': 'cycle($event)',
  },
})
export class FocusTrapDirective implements OnDestroy {
  private readonly panel = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly opener = this.document.activeElement;

  constructor() {
    afterNextRender(() => {
      if (!this.panel.contains(this.document.activeElement))
        this.panel.focus({ preventScroll: true });
    });
  }

  ngOnDestroy(): void {
    if (this.opener instanceof HTMLElement && this.opener.isConnected) {
      this.opener.focus({ preventScroll: true });
    }
  }

  cycle(event: Event): void {
    const keyboard = event as KeyboardEvent;
    const items = Array.from(this.panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (item) => item.getClientRects().length > 0,
    );
    if (!items.length) {
      keyboard.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.document.activeElement;
    if (keyboard.shiftKey && (active === first || active === this.panel)) {
      keyboard.preventDefault();
      last.focus();
    } else if (!keyboard.shiftKey && active === last) {
      keyboard.preventDefault();
      first.focus();
    }
  }
}
