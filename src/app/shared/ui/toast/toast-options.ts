import { ToastAction } from './toast-action';
import { ToastTone } from './toast-tone';

export interface ToastOptions {
  /** Duración mínima en ms; nunca baja de la que corresponde a la longitud del mensaje. */
  duration?: number;
  tone?: ToastTone;
  action?: ToastAction;
}
