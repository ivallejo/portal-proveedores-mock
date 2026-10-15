import { DOCUMENT, Injectable, NgZone, inject } from '@angular/core';

/** Elementos con tooltip: `data-tooltip="Texto"` o `[attr.data-tooltip]="expresión"`. */
const TOOLTIP_TARGETS = '[data-tooltip]';
/** Retraso al pasar el cursor (M3: ~500 ms); con teclado aparece de inmediato. */
const HOVER_DELAY_MS = 500;
const GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;

/**
 * Tooltip simple de Material Design 3 por delegación: un solo listener en el documento y un único
 * elemento flotante (`.tooltip` en `src/styles.css`). Reemplaza al atributo `title`, que tarda en
 * aparecer, no funciona con teclado ni en pantallas táctiles y no se puede estilar.
 */
@Injectable({ providedIn: 'root' })
export class Tooltip {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly id = 'app-tooltip';
  private element: HTMLElement | null = null;
  private anchor: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private listening = false;

  listen(): void {
    if (this.listening) return;
    this.listening = true;
    this.zone.runOutsideAngular(() => {
      const doc = this.document;
      doc.addEventListener('pointerover', (event) => this.onEnter(event, HOVER_DELAY_MS));
      doc.addEventListener('pointerout', (event) => this.onLeave(event));
      doc.addEventListener('focusin', (event) => {
        if (event.target instanceof Element && event.target.matches(':focus-visible')) {
          this.onEnter(event, 0);
        }
      });
      doc.addEventListener('focusout', () => this.hide());
      doc.addEventListener('pointerdown', () => this.hide(), true);
      doc.addEventListener('keydown', (event) => event.key === 'Escape' && this.hide());
      doc.defaultView?.addEventListener('scroll', () => this.hide(), true);
    });
  }

  private onEnter(event: Event, delay: number): void {
    if (event instanceof PointerEvent && event.pointerType !== 'mouse') return;
    if (!(event.target instanceof Element)) return;
    const target = event.target.closest<HTMLElement>(TOOLTIP_TARGETS);
    if (!target || target === this.anchor) return;
    this.hide();
    this.anchor = target;
    this.timer = setTimeout(() => this.show(target), delay);
  }

  private onLeave(event: PointerEvent): void {
    if (!this.anchor) return;
    const next = event.relatedTarget;
    if (next instanceof Node && this.anchor.contains(next)) return;
    this.hide();
  }

  private show(target: HTMLElement): void {
    const text = target.dataset['tooltip']?.trim();
    if (!text || !target.isConnected) return;
    const tip = this.tooltipElement();
    tip.textContent = text;
    tip.hidden = false;
    // Solo describe al elemento si su nombre accesible no dice ya lo mismo.
    if (target.getAttribute('aria-label') !== text)
      target.setAttribute('aria-describedby', this.id);
    this.place(tip, target);
  }

  private hide(): void {
    clearTimeout(this.timer);
    if (this.anchor?.getAttribute('aria-describedby') === this.id) {
      this.anchor.removeAttribute('aria-describedby');
    }
    this.anchor = null;
    if (this.element) this.element.hidden = true;
  }

  private place(tip: HTMLElement, target: HTMLElement): void {
    const view = this.document.defaultView;
    const width = view?.innerWidth ?? 0;
    const height = view?.innerHeight ?? 0;
    const rect = target.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const below = rect.bottom + GAP_PX;
    const top =
      below + box.height > height - VIEWPORT_MARGIN_PX ? rect.top - GAP_PX - box.height : below;
    const centered = rect.left + rect.width / 2 - box.width / 2;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN_PX, centered),
      width - box.width - VIEWPORT_MARGIN_PX,
    );
    tip.style.top = `${Math.round(top)}px`;
    tip.style.left = `${Math.round(left)}px`;
  }

  private tooltipElement(): HTMLElement {
    if (this.element?.isConnected) return this.element;
    const tip = this.document.createElement('div');
    tip.id = this.id;
    tip.className = 'tooltip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    this.document.body.appendChild(tip);
    this.element = tip;
    return tip;
  }
}
