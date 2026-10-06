export const environment = {
  production: true,
  apiBaseUrl: '/api',
  /** Funcionalidades visibles para el usuario; las apagadas muestran «en construcción». */
  features: {
    ordenPago: false,
    estadoFactura: false,
    documentos: false,
    registrarDocumento: false,
    contabilizacion: false,
    sociedades: false,
    areas: false,
    usuarios: false,
    workflows: false,
    perfil: false,
  },
};
