export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5080/api',
  /** Funcionalidades visibles para el usuario; las apagadas muestran «en construcción». */
  features: {
    ordenPago: true,
    estadoFactura: true,
    documentos: true,
    registrarDocumento: true,
    contabilizacion: true,
    usuarios: true,
    workflows: true,
    perfil: true,
  },
};
