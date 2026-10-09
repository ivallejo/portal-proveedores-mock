import { IconName } from '../../../../shared/ui/icon/icon-name';
import { RegisterEntry } from '../facades/register-entry';

export const ENTRY_CARDS: {
  value: RegisterEntry;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  {
    value: 'oc',
    label: 'Con orden de compra',
    description: 'Factura asociada a una orden de bien (carrier) o de servicio.',
    icon: 'cart',
  },
  {
    value: 'sin',
    label: 'Sin orden de compra',
    description: 'Factura o recibo sin OC que requiere aprobación de un área.',
    icon: 'file-text',
  },
  {
    value: 'esp',
    label: 'Documentos especiales',
    description: 'Boletos aéreos, recibos públicos, no domiciliados y liquidaciones.',
    icon: 'star',
  },
];
