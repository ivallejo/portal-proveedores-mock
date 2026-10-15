import { ToastAction } from './toast-action';
import { ToastTone } from './toast-tone';

export interface ToastState {
  message: string;
  busy: boolean;
  tone: ToastTone;
  action?: ToastAction;
}
