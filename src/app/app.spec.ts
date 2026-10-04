import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { normalizeRole } from './shared/models/models';
import { parseUblDocument } from './features/register-document/xml-reader';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('normalizeRole', () => {
  it('maps backend role names and codes to frontend roles', () => {
    expect(normalizeRole('Aprobador de área')).toBe('Área Usuaria');
    expect(normalizeRole('Gestor de cuentas por pagar')).toBe('CxP');
    expect(normalizeRole('ADMINISTRATOR')).toBe('Administrador');
    expect(normalizeRole('Proveedor')).toBe('Proveedor');
    expect(normalizeRole('desconocido')).toBeNull();
  });
});

describe('parseUblDocument', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>E001-00000123</cbc:ID>
  <cbc:IssueDate>2026-10-02</cbc:IssueDate>
  <cbc:DueDate>2026-11-01</cbc:DueDate>
  <cbc:InvoiceTypeCode>01</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty><cac:Party>
    <cac:PartyIdentification><cbc:ID>20512345678</cbc:ID></cac:PartyIdentification>
    <cac:PartyLegalEntity><cbc:RegistrationName>ANDES S.A.C.</cbc:RegistrationName></cac:PartyLegalEntity>
  </cac:Party></cac:AccountingSupplierParty>
  <cac:TaxTotal><cbc:TaxAmount>18.00</cbc:TaxAmount></cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount>100.00</cbc:LineExtensionAmount>
    <cbc:PayableAmount>118.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:InvoicedQuantity>2</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount>100.00</cbc:LineExtensionAmount>
    <cac:Item><cbc:Description>Servicio</cbc:Description></cac:Item>
    <cac:Price><cbc:PriceAmount>50.00</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>
</Invoice>`;

  it('reads the series, parties, items and totals', () => {
    const doc = parseUblDocument(xml)!;
    expect(doc.number).toBe('E001-00000123');
    expect(doc.series).toBe('E001');
    expect(doc.issuerRuc).toBe('20512345678');
    expect(doc.currency).toBe('USD');
    expect(doc.paymentTerms).toBe('Crédito a 30 días');
    expect(doc.items).toEqual([{ description: 'Servicio', quantity: 2, unitPrice: 50 }]);
    expect(doc.igv).toBe(18);
    expect(doc.total).toBe(118);
  });

  it('returns null for content that is not UBL', () => {
    expect(parseUblDocument('<html></html>')).toBeNull();
    expect(parseUblDocument('no es xml')).toBeNull();
  });
});
