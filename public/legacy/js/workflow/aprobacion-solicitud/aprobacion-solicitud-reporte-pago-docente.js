$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const $btn_registrar = $('#btn-registrar');
const $input_nombreorganizacion = $('#input-nombreorganizacion');
const $input_rangoFechas = $('#input-rangoFechas');
const $input_tipoTarifa = $('#input-tipoTarifa');
const $input_costoPromedioHora = $('#input-costoPromedioHora');
const $input_montoDiferencia = $('#input-montoDiferencia');

class AprobacionSolicitudReportePagoDocente {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#reportePagoDocenteModal"));
        this.idWorkflow = $("#frmReportePagoDocente #IdWorkflow");
        this.idFaseWorkflow = $("#frmReportePagoDocente #IdFaseWorkflow");
        this.solicitante = $("#frmReportePagoDocente #Solicitante");
        this.fechaCreacion = $("#frmReportePagoDocente #FechaCreacion");
        this.idSolicitud = $("#frmReportePagoDocente #IdSolicitud");
        this.motivoJustificacion = $("#frmReportePagoDocente #MotivoJustificacion");

        this.frmAccion = $("#frmReportePagoDocente");
        this.btnExportar = $("#frmReportePagoDocente #btnExportar");
        this.btnAprobar = $("#frmReportePagoDocente #btnAprobar");
        this.btnRechazar = $("#frmReportePagoDocente #btnRechazar");
        this.btnFormatoCsv = $("#frmReportePagoDocente #btnFormatoCsv");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {
        let divAcciones = $("#frmReportePagoDocente #divAcciones");
        if (esEvaluador) {
            divAcciones.removeClass("d-none");
        } else {
            divAcciones.addClass("d-none");
        }
        new SolicitudService().obtenerPendienteAprobarPorId(solicitud.idSolicitud, (response) => {
            $input_nombreorganizacion.val(response.reportePagoDocente.nombreOrganizacion);
            $input_rangoFechas.val(response.reportePagoDocente.rangoFechas);
            $input_tipoTarifa.val(response.reportePagoDocente.nombreTipoTarifa);
            $input_costoPromedioHora.val(response.montoTarifa);
            $input_montoDiferencia.val(response.montoDiferencia);
            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.btnExportar.attr("href", URL_BASE + "WkAprobacionSolicitud/DescargarExcelPendienteAprobarPorId?key=" + response.solicitud.idSolicitud);
            this.btnFormatoCsv.attr("href", URL_BASE + "WkBandejaSolicitud/DescargarFormatoCsvPorId?key=" + response.solicitud.idSolicitud);
            if (esInicio) {
                new WorkflowService().listar({}, (response) => {
                    this.idWorkflow.append(Constantes.Select.OpcionSeleccione);
                    response.forEach(x => {
                        this.idWorkflow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
                    });
                    if (solicitud) {
                        this.idWorkflow.val(solicitud.idWorkflow);
                    }
                });
                new FaseWorkflowService().listar({}, (response) => {
                    this.idFaseWorkflow.append(Constantes.Select.OpcionNinguno);
                    response.forEach(x => {
                        this.idFaseWorkflow.append(`<option value="${x.idFaseWorkflow}">${x.nombre}</option>`);
                    });
                    if (solicitud) {
                        this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
                    }
                });
            } else {
                this.idWorkflow.val(solicitud.idWorkflow);
                this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
            }
        });
        this.modal.show();
    }

    configurarVentana(data, esEvaluador, callback) {
        this.btnAprobar.on("click", () => {
            let request = Object.assign(this.model.solicitud, {});
            new SolicitudService().registrarEvaluacion(request, (response) => {
                callback(true);
                MessageBox.info('Solicitud aprobada correctamente');
                this.modal.hide();
            });
        });
        this.btnRechazar.on("click", () => {
            this.rechazoSolicitudModal.show(this.model.solicitud, () => {
                callback(true);
                MessageBox.info('Solicitud rechazada correctamente');
                this.modal.hide();
            });
        });
        this.cargarData(data, esEvaluador, true);
    }
}