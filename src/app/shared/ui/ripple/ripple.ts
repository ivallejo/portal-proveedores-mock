import { DOCUMENT, Injectable, NgZone, inject } from '@angular/core';

/** Elementos que reciben la onda: todos los `.btn-*` y cualquiera marcado con la clase `ripple`. */
const RIPPLE_TARGETS = '.btn, .ripple';
/** Duración de la expansión (`--duration-medium-2`); la onda no se desvanece antes de completarla. */
const ENTER_MS = 300;
/** Margen para retirar la onda si `transitionend` no llega (pestaña oculta, elemento retirado). */
const EXIT_FALLBACK_MS = 400;

/**
 * Onda de pulsación de Material Design 3 (ink ripple) por delegación de eventos: un solo listener en el
 * documento, fuera de la detección de cambios, sin directivas en cada componente. La onda usa el color
 * del texto del propio elemento (`currentColor`) con la opacidad de estado de M3; los estilos están en
 * `src/styles.css` (`.ripple-container`, `.ripple-wave`). Se omite con `prefers-reduced-motion: reduce`.
 */
@Injectable({ providedIn: 'root' })
export class Ripple {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private listening = false;

  listen(): void {
    if (this.listening) return;
    this.listening = true;
    this.zone.runOutsideAngular(() =>
      this.document.addEventListener('pointerdown', (event) => this.launch(event), {
        passive: true,
      }),
    );
  }

  private launch(event: PointerEvent): void {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    const host = event.target.closest<HTMLElement>(RIPPLE_TARGETS);
    if (!host || host.matches(':disabled, [aria-disabled="true"]')) return;
    const view = this.document.defaultView;
    if (view?.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (view?.getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const container = this.containerOf(host);
    const rect = host.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));

    const wave = this.document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.left = `${x - radius}px`;
    wave.style.top = `${y - radius}px`;
    wave.style.width = wave.style.height = `${radius * 2}px`;
    container.appendChild(wave);
    // Fuerza el estilo inicial (escala 0) antes de activar la transición de entrada.
    void wave.offsetWidth;
    wave.classList.add('ripple-wave-active');

    const startedAt = performance.now();
    const release = () => {
      this.document.removeEventListener('pointerup', release);
      this.document.removeEventListener('pointercancel', release);
      host.removeEventListener('pointerleave', release);
      const wait = Math.max(0, ENTER_MS - (performance.now() - startedAt));
      setTimeout(() => this.fadeOut(wave, container), wait);
    };
    this.document.addEventListener('pointerup', release);
    this.document.addEventListener('pointercancel', release);
    host.addEventListener('pointerleave', release);
  }

  private containerOf(host: HTMLElement): HTMLElement {
    const existing = Array.from(host.children).find((child) =>
      child.classList.contains('ripple-container'),
    );
    if (existing instanceof HTMLElement) return existing;
    const container = this.document.createElement('span');
    container.className = 'ripple-container';
    container.setAttribute('aria-hidden', 'true');
    host.appendChild(container);
    return container;
  }

  private fadeOut(wave: HTMLElement, container: HTMLElement): void {
    let removed = false;
    const remove = () => {
      if (removed) return;
      removed = true;
      wave.remove();
      if (!container.childElementCount) container.remove();
    };
    wave.addEventListener('transitionend', (event) => event.propertyName === 'opacity' && remove());
    setTimeout(remove, EXIT_FALLBACK_MS);
    wave.classList.add('ripple-wave-out');
  }
}
