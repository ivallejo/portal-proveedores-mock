import { DocumentItem } from '../../shared/documents/document.model';
import { Currency } from '../../shared/utils/format';

/** Datos que se muestran en la revisión, leídos del XML del comprobante (UBL 2.1). */
export interface ElectronicDocument {
  number: string;
  series: string;
  documentType: string;
  issuerName: string;
  issuerRuc: string;
  receiverName: string;
  receiverRuc: string;
  issuedAt: string;
  currency: Currency;
  paymentTerms: string;
  items: DocumentItem[];
  subtotal: number;
  igv: number | null;
  total: number;
  /** false cuando los datos se completaron con valores de ejemplo. */
  fromXml: boolean;
}

const DOCUMENT_TYPES: Record<string, string> = {
  '01': 'Factura electrónica',
  '03': 'Boleta de venta electrónica',
  '07': 'Nota de crédito electrónica',
  '08': 'Nota de débito electrónica',
};

function children(parent: Element | null | undefined, name: string): Element[] {
  return parent ? Array.from(parent.children).filter((child) => child.localName === name) : [];
}

function child(parent: Element | null | undefined, ...path: string[]): Element | null {
  let current: Element | null = parent ?? null;
  for (const name of path) {
    current = children(current, name)[0] ?? null;
    if (!current) return null;
  }
  return current;
}

function text(parent: Element | null | undefined, ...path: string[]): string {
  return child(parent, ...path)?.textContent?.trim() ?? '';
}

function amount(parent: Element | null | undefined, ...path: string[]): number {
  const value = Number(text(parent, ...path));
  return Number.isFinite(value) ? value : 0;
}

function party(root: Element, role: string): { name: string; ruc: string } {
  const node = child(root, role, 'Party');
  const ruc =
    text(node, 'PartyIdentification', 'ID') || text(child(root, role), 'CustomerAssignedAccountID');
  const name =
    text(node, 'PartyLegalEntity', 'RegistrationName') || text(node, 'PartyName', 'Name');
  return { name, ruc };
}

/** Lee un comprobante electrónico UBL (factura, boleta, nota de crédito o débito). */
export function parseUblDocument(xml: string): ElectronicDocument | null {
  let root: Element;
  try {
    const parsed = new DOMParser().parseFromString(xml, 'application/xml');
    if (parsed.getElementsByTagName('parsererror').length) return null;
    root = parsed.documentElement;
  } catch {
    return null;
  }
  if (!['Invoice', 'CreditNote', 'DebitNote'].includes(root.localName)) return null;

  const number = text(root, 'ID').toUpperCase();
  if (!number) return null;
  const typeCode =
    text(root, 'InvoiceTypeCode') ||
    (root.localName === 'CreditNote' ? '07' : root.localName === 'DebitNote' ? '08' : '01');
  const issuer = party(root, 'AccountingSupplierParty');
  const receiver = party(root, 'AccountingCustomerParty');
  const totals = child(root, 'LegalMonetaryTotal') ?? child(root, 'RequestedMonetaryTotal');
  const lineName =
    root.localName === 'CreditNote'
      ? 'CreditNoteLine'
      : root.localName === 'DebitNote'
        ? 'DebitNoteLine'
        : 'InvoiceLine';
  const quantityName =
    root.localName === 'CreditNote'
      ? 'CreditedQuantity'
      : root.localName === 'DebitNote'
        ? 'DebitedQuantity'
        : 'InvoicedQuantity';

  const items = children(root, lineName).map((line) => {
    const quantity = amount(line, quantityName) || 1;
    const lineTotal = amount(line, 'LineExtensionAmount');
    const unitPrice = amount(line, 'Price', 'PriceAmount') || lineTotal / quantity;
    return {
      description: text(line, 'Item', 'Description') || text(line, 'Item', 'Name') || 'Ítem',
      quantity,
      unitPrice,
    };
  });

  const igv = children(root, 'TaxTotal').length ? amount(root, 'TaxTotal', 'TaxAmount') : null;
  const total = amount(totals, 'PayableAmount');
  const subtotal =
    amount(totals, 'LineExtensionAmount') ||
    items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const currencyCode =
    text(root, 'DocumentCurrencyCode') ||
    child(totals, 'PayableAmount')?.getAttribute('currencyID') ||
    'PEN';
  const issuedAt = text(root, 'IssueDate');
  const dueDate = text(root, 'DueDate') || text(root, 'PaymentTerms', 'PaymentDueDate');
  const creditDays =
    dueDate && issuedAt ? Math.round((Date.parse(dueDate) - Date.parse(issuedAt)) / 86400000) : 0;

  return {
    number,
    series: number.split('-')[0],
    documentType: DOCUMENT_TYPES[typeCode] ?? 'Comprobante electrónico',
    issuerName: issuer.name,
    issuerRuc: issuer.ruc,
    receiverName: receiver.name,
    receiverRuc: receiver.ruc,
    issuedAt,
    currency: currencyCode === 'USD' ? 'USD' : 'PEN',
    paymentTerms: creditDays > 0 ? `Crédito a ${creditDays} días` : 'Contado',
    items,
    subtotal,
    igv,
    total: total || subtotal + (igv ?? 0),
    fromXml: true,
  };
}

/** Serie a partir del nombre del archivo («F001-00004530.xml» → «F001»). */
export function seriesFromFileName(name: string): string | null {
  const match = /([A-Z0-9]{4})-\d{1,8}/i.exec(name);
  return match ? match[1].toUpperCase() : null;
}
