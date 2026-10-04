import { approverEmail } from '../data/catalog';
import { formatDate } from '../utils/format';
import { DocumentItem, HistoryEvent, PortalDocument } from './document.model';

type Seed = Omit<PortalDocument, 'subtotal' | 'igv' | 'amount' | 'history' | 'approverEmail'> & {
  /** Importe para documentos sin detalle de ítems (especiales). */
  total?: number;
  extraHistory?: HistoryEvent[];
};

function totals(seed: Seed): Pick<PortalDocument, 'subtotal' | 'igv' | 'amount'> {
  if (!seed.items.length) {
    const amount = seed.total ?? 0;
    return { subtotal: amount, igv: null, amount };
  }
  const subtotal = seed.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const withIgv = seed.documentType.toLowerCase().includes('factura');
  const igv = withIgv ? +(subtotal * 0.18).toFixed(2) : null;
  return { subtotal: +subtotal.toFixed(2), igv, amount: +(subtotal + (igv ?? 0)).toFixed(2) };
}

/** Historial base según cómo ingresó el documento y su estado actual. */
function history(doc: Seed): HistoryEvent[] {
  const registered = formatDate(doc.registeredAt);
  const events: HistoryEvent[] = [];
  if (doc.entryType === 'Con OC') {
    events.push({
      title: 'Orden validada en SAP',
      who: `Servicio 01 SAP · ${doc.orderNumber}`,
      when: `${registered} · 09:10`,
      kind: 'done',
    });
  }
  events.push(
    {
      title: 'Documento registrado',
      who: `${doc.registeredBy} · ${
        doc.entryType === 'Con OC'
          ? 'Con orden de compra'
          : doc.entryType === 'Sin OC'
            ? 'Sin orden de compra'
            : 'Documento especial'
      }`,
      when: `${registered} · 09:12`,
      kind: 'done',
    },
    {
      title:
        doc.documentType === 'Liquidación de cobranzas'
          ? 'Validado en SUNAT y SAP'
          : doc.entryType === 'Documento especial'
            ? 'Duplicidad validada en SAP'
            : 'Documento validado en SAP y SUNAT',
      who: 'Servicio 02 SAP',
      when: `${registered} · 09:13`,
      kind: 'done',
    },
  );
  if (doc.approver) {
    events.push({
      title: 'Asignado para aprobación',
      who: `${doc.approver} · ${doc.area}`,
      when: `${registered} · 09:14`,
      kind: 'done',
    });
  }
  return [...events, ...(doc.extraHistory ?? [])];
}

const ANDES = {
  providerName: 'Andes Suministros Industriales S.A.C.',
  providerRuc: '20512345678',
  providerEmail: 'facturacion@andessuministros.com.pe',
};
const PACIFICO = {
  providerName: 'Logística Pacífico S.R.L.',
  providerRuc: '20601122334',
  providerEmail: 'facturacion@logpacifico.pe',
};

const item = (description: string, quantity: number, unitPrice: number): DocumentItem => ({
  description,
  quantity,
  unitPrice,
});

const SEEDS: Seed[] = [
  {
    number: 'F001-00004521',
    entryType: 'Sin OC',
    documentType: 'Factura electrónica',
    ...ANDES,
    currency: 'PEN',
    items: [item('Mantenimiento correctivo de compresores – Planta Lurín', 1, 15635.59)],
    concept:
      'Mantenimiento correctivo de compresores en la planta de Lurín, setiembre 2026. Servicio prestado sin orden de compra por urgencia operativa.',
    issuedAt: '2026-09-21',
    registeredAt: '2026-09-22',
    registeredBy: 'Andes Suministros (proveedor)',
    companyCode: 'CAN',
    status: 'Pendiente de aprobación',
    area: 'Finanzas',
    approver: 'María Torres',
    attachments: [
      { tag: 'XML', name: 'F001-00004521.xml' },
      { tag: 'PDF', name: 'F001-00004521.pdf' },
      { tag: 'CDR', name: 'R-F001-00004521.zip' },
    ],
    extraHistory: [
      {
        title: 'Reasignado a María Torres',
        who: 'Por Ana Ríos · Logística',
        when: '23/09/2026 · 08:47',
        kind: 'done',
        note: 'El servicio corresponde al centro de costo de Finanzas.',
      },
      {
        title: 'Pendiente de aprobación',
        who: 'En revisión de María Torres',
        when: 'Desde 22/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'F002-00000879',
    entryType: 'Documento especial',
    documentType: 'No domiciliado',
    ...PACIFICO,
    currency: 'USD',
    items: [],
    total: 9800,
    concept:
      'Flete marítimo de importación Callao – Shanghái, contenedor 40HC, embarque 2026-0912.',
    issuedAt: '2026-09-18',
    registeredAt: '2026-09-19',
    registeredBy: 'Jorge Paredes (interno)',
    companyCode: 'MSU',
    status: 'Pendiente de aprobación',
    area: 'Finanzas',
    approver: 'María Torres',
    validation: 'Sin duplicidad en SAP (Servicio 02)',
    attachments: [{ tag: 'PDF', name: 'F002-00000879.pdf' }],
    extraHistory: [
      {
        title: 'Pendiente de aprobación',
        who: 'En revisión de María Torres',
        when: 'Desde 19/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'E001-00000045',
    entryType: 'Sin OC',
    documentType: 'Recibo por honorarios electrónico',
    providerName: 'Mendoza Ríos, Carla',
    providerRuc: '10456789012',
    providerEmail: 'cmendoza.asesoria@gmail.com',
    currency: 'PEN',
    items: [item('Asesoría tributaria para el cierre del tercer trimestre 2026', 1, 3500)],
    concept: 'Asesoría tributaria para el cierre del tercer trimestre 2026.',
    issuedAt: '2026-09-16',
    registeredAt: '2026-09-16',
    registeredBy: 'Carla Mendoza (proveedor)',
    companyCode: 'CAN',
    status: 'Pendiente de aprobación',
    area: 'Finanzas',
    approver: 'María Torres',
    attachments: [
      { tag: 'XML', name: 'E001-00000045.xml' },
      { tag: 'PDF', name: 'E001-00000045.pdf' },
    ],
    extraHistory: [
      {
        title: 'Pendiente de aprobación',
        who: 'En revisión de María Torres',
        when: 'Desde 16/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'F001-00000932',
    entryType: 'Sin OC',
    documentType: 'Factura electrónica',
    providerName: 'Imprenta Lima Norte E.I.R.L.',
    providerRuc: '20601987654',
    providerEmail: 'ventas@imprentalimanorte.pe',
    currency: 'PEN',
    items: [item('Impresión de 2,000 formatos de guías internas y talonarios', 1, 728.81)],
    concept: 'Impresión de 2,000 formatos de guías internas y talonarios.',
    issuedAt: '2026-09-12',
    registeredAt: '2026-09-13',
    registeredBy: 'Imprenta Lima Norte (proveedor)',
    companyCode: 'SIP',
    status: 'Pendiente de aprobación',
    area: 'Finanzas',
    approver: 'María Torres',
    attachments: [
      { tag: 'XML', name: 'F001-00000932.xml' },
      { tag: 'PDF', name: 'F001-00000932.pdf' },
      { tag: 'CDR', name: 'R-F001-00000932.zip' },
    ],
    extraHistory: [
      {
        title: 'Pendiente de aprobación',
        who: 'En revisión de María Torres',
        when: 'Desde 13/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'F001-00004530',
    entryType: 'Con OC',
    documentType: 'Factura electrónica',
    ...ANDES,
    currency: 'PEN',
    items: [
      item('Mantenimiento correctivo de compresores – Planta Lurín', 1, 12500),
      item('Repuestos: kit de válvulas y empaquetaduras', 2, 1567.7966),
    ],
    concept: 'Mantenimiento correctivo de compresores – Planta Lurín.',
    issuedAt: '2026-10-01',
    registeredAt: '2026-10-01',
    registeredBy: 'Andes Suministros (proveedor)',
    companyCode: 'CAN',
    status: 'Pendiente de contabilización',
    orderType: 'Servicio',
    orderNumber: '4500012873',
    orderBalance: 18450,
    orderDescription: 'Mantenimiento correctivo de compresores – Planta Lurín',
    attachments: [
      { tag: 'XML', name: 'F001-00004530.xml' },
      { tag: 'PDF', name: 'F001-00004530.pdf' },
      { tag: 'CDR', name: 'R-F001-00004530.zip' },
      { tag: 'PDF', name: 'Acta_conformidad.pdf' },
    ],
    extraHistory: [
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 01/10/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'F001-00004531',
    entryType: 'Sin OC',
    documentType: 'Factura electrónica',
    ...ANDES,
    currency: 'PEN',
    items: [item('Reparación de tableros eléctricos – nave 2', 1, 6000)],
    concept: 'Reparación de tableros eléctricos – nave 2.',
    issuedAt: '2026-09-29',
    registeredAt: '2026-09-29',
    registeredBy: 'Andes Suministros (proveedor)',
    companyCode: 'CAN',
    status: 'Pendiente de contabilización',
    area: 'Finanzas',
    approver: 'María Torres',
    approvedAt: '30/09/2026 · 10:24',
    attachments: [
      { tag: 'XML', name: 'F001-00004531.xml' },
      { tag: 'PDF', name: 'F001-00004531.pdf' },
      { tag: 'CDR', name: 'R-F001-00004531.zip' },
      { tag: 'PDF', name: 'Anexos_F001-00004531.pdf' },
    ],
    extraHistory: [
      {
        title: 'Documento aprobado',
        who: 'Por María Torres · Finanzas · N° de pedido PED-2026-01790',
        when: '30/09/2026 · 10:24',
        kind: 'done',
      },
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 30/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: '075-2310045678',
    entryType: 'Documento especial',
    documentType: 'Boleto aéreo',
    providerName: 'Aerolíneas del Pacífico S.A.',
    providerRuc: '20341841357',
    providerEmail: '',
    currency: 'USD',
    items: [],
    total: 1236.5,
    concept: 'Boleto aéreo Lima – Arequipa – Lima para supervisión de planta.',
    issuedAt: '2026-09-25',
    registeredAt: '2026-09-26',
    registeredBy: 'Rocío Medina (interno)',
    companyCode: 'CAN',
    status: 'Pendiente de contabilización',
    validation: 'Sin duplicidad en SAP (Servicio 02)',
    attachments: [{ tag: 'PDF', name: '075-2310045678.pdf' }],
    extraHistory: [
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 26/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'L001-00012876',
    entryType: 'Documento especial',
    documentType: 'Liquidación de cobranzas',
    providerName: 'Banco Andino del Perú S.A.',
    providerRuc: '20100999881',
    providerEmail: '',
    currency: 'PEN',
    items: [],
    total: 12480,
    concept: 'Liquidación de cobranza de letras – setiembre 2026.',
    issuedAt: '2026-09-29',
    registeredAt: '2026-09-30',
    registeredBy: 'Jorge Paredes (interno)',
    companyCode: 'SIP',
    status: 'Pendiente de contabilización',
    validation: 'Válido en SUNAT y sin duplicidad en SAP (Servicio 02)',
    attachments: [{ tag: 'PDF', name: 'L001-00012876.pdf' }],
    extraHistory: [
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 30/09/2026',
        kind: 'current',
      },
    ],
  },
  {
    number: 'F002-00000877',
    entryType: 'Con OC',
    documentType: 'Factura electrónica',
    ...PACIFICO,
    currency: 'USD',
    items: [item('Repuestos para fajas transportadoras', 4, 2076.2712)],
    concept: 'Repuestos para fajas transportadoras · 3 entregas recibidas.',
    issuedAt: '2026-09-18',
    registeredAt: '2026-09-19',
    registeredBy: 'Logística Pacífico (proveedor)',
    companyCode: 'MSU',
    status: 'Contabilizado',
    orderType: 'Bien',
    orderNumber: 'CR-2026-00418',
    orderBalance: 9800,
    orderDescription: 'Repuestos para fajas transportadoras · 3 entregas recibidas',
    attachments: [
      { tag: 'XML', name: 'F002-00000877.xml' },
      { tag: 'PDF', name: 'F002-00000877.pdf' },
      { tag: 'CDR', name: 'R-F002-00000877.zip' },
    ],
    extraHistory: [
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 19/09/2026',
        kind: 'done',
      },
      {
        title: 'Documento contabilizado',
        who: 'SAP · Asiento 5100078842',
        when: '22/09/2026 · 16:05',
        kind: 'done',
      },
    ],
  },
  {
    number: 'E001-00000046',
    entryType: 'Sin OC',
    documentType: 'Recibo por honorarios electrónico',
    providerName: 'Mendoza Ríos, Carla',
    providerRuc: '10456789012',
    providerEmail: 'cmendoza.asesoria@gmail.com',
    currency: 'PEN',
    items: [item('Asesoría tributaria – cierre tercer trimestre 2026', 1, 3500)],
    concept: 'Asesoría tributaria – cierre tercer trimestre 2026.',
    issuedAt: '2026-09-16',
    registeredAt: '2026-09-16',
    registeredBy: 'Carla Mendoza (proveedor)',
    companyCode: 'CAN',
    status: 'Observado',
    area: 'Finanzas',
    approver: 'Jorge Paredes',
    approvedAt: '18/09/2026 · 09:40',
    attachments: [
      { tag: 'XML', name: 'E001-00000046.xml' },
      { tag: 'PDF', name: 'E001-00000046.pdf' },
    ],
    extraHistory: [
      {
        title: 'Documento aprobado',
        who: 'Por Jorge Paredes · Finanzas · N° de viaje VJ-2026-0298',
        when: '18/09/2026 · 09:40',
        kind: 'done',
      },
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 18/09/2026',
        kind: 'done',
      },
      {
        title: 'Documento observado',
        who: 'Por Rocío Medina · Contabilidad',
        when: '20/09/2026 · 11:32',
        kind: 'warn',
        note: 'Falta adjuntar el informe de la asesoría firmado.',
      },
      {
        title: 'Observación enviada por correo',
        who: 'A cmendoza.asesoria@gmail.com',
        when: '20/09/2026 · 11:32',
        kind: 'done',
      },
    ],
  },
  {
    number: 'F003-00001290',
    entryType: 'Sin OC',
    documentType: 'Factura electrónica',
    providerName: 'Transportes Huallaga S.A.C.',
    providerRuc: '20545671234',
    providerEmail: 'facturas@thuallaga.pe',
    currency: 'PEN',
    items: [item('Traslado de personal a mina, 12 viajes', 12, 333.3334)],
    concept: 'Traslado de personal a mina, 12 viajes, agosto 2026.',
    issuedAt: '2026-08-28',
    registeredAt: '2026-08-29',
    registeredBy: 'Transportes Huallaga (proveedor)',
    companyCode: 'MSU',
    status: 'Rechazado',
    rejectedBy: 'contabilidad',
    area: 'Operaciones',
    approver: 'Carlos Vega',
    approvedAt: '01/09/2026 · 15:12',
    attachments: [
      { tag: 'XML', name: 'F003-00001290.xml' },
      { tag: 'PDF', name: 'F003-00001290.pdf' },
      { tag: 'CDR', name: 'R-F003-00001290.zip' },
    ],
    extraHistory: [
      {
        title: 'Documento aprobado',
        who: 'Por Carlos Vega · Operaciones · N° de viaje VJ-2026-0281',
        when: '01/09/2026 · 15:12',
        kind: 'done',
      },
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 01/09/2026',
        kind: 'done',
      },
      {
        title: 'Documento rechazado',
        who: 'Por Rocío Medina · Contabilidad',
        when: '03/09/2026 · 10:05',
        kind: 'bad',
        note: 'El servicio facturado no corresponde a la sociedad Minera del Sur.',
      },
      {
        title: 'Proveedor notificado por correo',
        who: 'A facturas@thuallaga.pe',
        when: '03/09/2026 · 10:05',
        kind: 'done',
      },
    ],
  },
  {
    number: 'S001-02358871',
    entryType: 'Documento especial',
    documentType: 'Recibo público',
    providerName: 'Empresa de Servicios Eléctricos del Sur S.A.',
    providerRuc: '20331898001',
    providerEmail: '',
    currency: 'PEN',
    items: [],
    total: 1284.7,
    concept: 'Consumo de energía eléctrica – almacén central, agosto 2026.',
    issuedAt: '2026-09-05',
    registeredAt: '2026-09-06',
    registeredBy: 'Rocío Medina (interno)',
    companyCode: 'SIP',
    status: 'Contabilizado',
    validation: 'Sin duplicidad en SAP (Servicio 02)',
    attachments: [{ tag: 'PDF', name: 'S001-02358871.pdf' }],
    extraHistory: [
      {
        title: 'Pendiente de contabilización',
        who: 'Cuentas por pagar · Contabilidad',
        when: 'Desde 06/09/2026',
        kind: 'done',
      },
      {
        title: 'Documento contabilizado',
        who: 'SAP · Asiento 4100023318',
        when: '09/09/2026 · 16:05',
        kind: 'done',
      },
    ],
  },
  {
    number: 'F002-00000861',
    entryType: 'Sin OC',
    documentType: 'Factura electrónica',
    ...PACIFICO,
    currency: 'USD',
    items: [
      item('Almacenaje temporal de mercadería en depósito aduanero, agosto 2026', 1, 3495.76),
    ],
    concept: 'Almacenaje temporal de mercadería en depósito aduanero, agosto 2026.',
    issuedAt: '2026-09-02',
    registeredAt: '2026-09-03',
    registeredBy: 'Logística Pacífico (proveedor)',
    companyCode: 'MSU',
    status: 'Aprobado',
    area: 'Logística',
    approver: 'Ana Ríos',
    approvedAt: '05/09/2026 · 11:05',
    attachments: [
      { tag: 'XML', name: 'F002-00000861.xml' },
      { tag: 'PDF', name: 'F002-00000861.pdf' },
      { tag: 'CDR', name: 'R-F002-00000861.zip' },
    ],
    extraHistory: [
      {
        title: 'Documento aprobado',
        who: 'Por Ana Ríos · Logística · N° de pedido PED-2026-01712',
        when: '05/09/2026 · 11:05',
        kind: 'done',
      },
    ],
  },
  {
    number: 'FC01-00000318',
    entryType: 'Sin OC',
    documentType: 'Nota de crédito electrónica',
    ...ANDES,
    currency: 'PEN',
    items: [],
    total: 1250,
    concept: 'Descuento por devolución parcial de repuestos de la factura F001-00004466.',
    issuedAt: '2026-08-20',
    registeredAt: '2026-08-21',
    registeredBy: 'Andes Suministros (proveedor)',
    companyCode: 'CAN',
    status: 'Rechazado',
    rejectedBy: 'aprobador',
    area: 'Finanzas',
    approver: 'María Torres',
    attachments: [
      { tag: 'XML', name: 'FC01-00000318.xml' },
      { tag: 'PDF', name: 'FC01-00000318.pdf' },
    ],
    extraHistory: [
      {
        title: 'Documento rechazado',
        who: 'Por María Torres · Finanzas',
        when: '24/08/2026 · 16:30',
        kind: 'bad',
        note: 'La nota de crédito no corresponde a la devolución registrada en almacén.',
      },
      {
        title: 'Proveedor notificado por correo',
        who: 'Sistema',
        when: '24/08/2026 · 16:30',
        kind: 'done',
      },
    ],
  },
];

export function seedDocuments(): PortalDocument[] {
  return SEEDS.map(({ total, extraHistory, ...seed }) => ({
    ...seed,
    ...totals({ ...seed, total }),
    approverEmail: seed.approver && seed.area ? approverEmail(seed.area, seed.approver) : undefined,
    history: history({ ...seed, extraHistory }),
  }));
}
