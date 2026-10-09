import { FileState } from '../components/file-drop/file-state';

/** Estado de carga de un archivo del comprobante. */
export interface SlotState {
  state: FileState;
  file: File | null;
  name: string;
  size: string;
  error: string;
}
