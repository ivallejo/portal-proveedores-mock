$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const reportePagoDocenteService = new ReportePagoDocenteService();

let _idSolicitud = 0;

const $sel_organizacion = $('#sel-organizacion');
const $input_rangofechas = $('#input-rangofechas');
const $sel_tipotarifa = $('#sel-tipotarifa');
const $input_costoPromedioHora = $('#input-costoPromedioHora');
const $input_montoDiferencia = $('#input-montoDiferencia');
const $input_usuariosesion = $('#input-usuariosesion');

$sel_organizacion.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_tipotarifa.prepend(Constantes.Select.OpcionSeleccione).val('');

$input_rangofechas.daterangepicker({
    opens: 'left',
    startDate: moment().add(-7, 'day'),
    maxDate: moment(),
    locale: {
        format: 'DD/MM/YYYY'
    }
});

class BandejaSolicitudReportePagoDocente {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#reportePagoDocenteModal"));
        this.idWorkflow = $("#frmReportePagoDocente #IdWorkflow");
        this.idFaseWorkflow = $("#frmReportePagoDocente #IdFaseWorkflow");
        this.solicitante = $("#frmReportePagoDocente #Solicitante");
        this.fechaCreacion = $("#frmReportePagoDocente #FechaCreacion");

        this.idSolicitud = $("#frmReportePagoDocente #IdSolicitud");
        this.titulo = $("#frmReportePagoDocente #reportePagoDocenteModalTitulo");
        this.evaluador = $("#frmReportePagoDocente #Evaluador");
        this.estadoSolicitud = $("#frmReportePagoDocente #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmReportePagoDocente #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmReportePagoDocente #ComentarioAtencion");

        this.frmAccion = $("#frmReportePagoDocente");
        this.btnExportar = $("#frmReportePagoDocente #btnExportar");
        this.btnGuardar = $("#frmReportePagoDocente #btnGuardar");
        this.btnFormatoCsv = $("#frmReportePagoDocente #btnFormatoCsv");
        this.model = null;
    }

    cargarData(solicitud, esEdicion, esInicio = false) {
        console.log('solicitud:', solicitud);
        //No deberían de poder descargar los reportes hasta que este aprobado al 100% la solicitud (obs 2025-08-29)
        if (solicitud.usuarioCreacion == $input_usuariosesion.val() && solicitud.idEstadoSolicitud != Constantes.EstadoSolicitud.Aprobado) {
            this.btnFormatoCsv.removeClass('d-none').addClass('d-none');
        }
        //--/--
        _idSolicitud = solicitud.idSolicitud;
        let divAcciones = $("#frmReportePagoDocente .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmReportePagoDocente #divMotivoRechazoSolicitud");
        if (esEdicion) {
            this.titulo.text("Edición de Solicitud");
            divAcciones.removeClass("d-none");
            $(".edit-control").prop("disabled", false);
        } else {
            this.titulo.text("Consulta de Solicitud");
            divAcciones.addClass("d-none");
            $(".edit-control").prop("disabled", true);
        }
        new SolicitudService().obtenerParticipadosPorId(solicitud.idSolicitud, (response) => {
            console.log(response);
            const organizacionValue = response.reportePagoDocente.idOrganizacion;
            $sel_organizacion.val(organizacionValue);
            const rangoFechasValue = response.reportePagoDocente.rangoFechas.split(' - ');
            $input_rangofechas.data('daterangepicker').setStartDate(rangoFechasValue[0]);
            $input_rangofechas.data('daterangepicker').setEndDate(rangoFechasValue[1]);
            $sel_tipotarifa.val(response.reportePagoDocente.tipoTarifa);
            $input_costoPromedioHora.val(response.montoTarifa);
            $input_montoDiferencia.val(response.montoDiferencia);
            //--</>--
            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.evaluador.val(response.solicitud.nombreEvaluador?.toLowerCase() || ' ');
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.estadoSolicitud.val(response.solicitud.estadoSolicitud.nombre);
            if (response.solicitud.idEstadoSolicitud === Constantes.EstadoSolicitud.Rechazado) {
                divMotivoRechazoSolicitud.removeClass("d-none");
                this.motivoRechazoSolicitud.val(response.solicitud.motivoRechazoSolicitud?.nombre || ' ');
            } else {
                divMotivoRechazoSolicitud.addClass("d-none");
                this.motivoRechazoSolicitud.val("");
            }
            this.comentarioAtencion.val(response.solicitud.comentarioAtencion || ' ');
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
                this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
                this.idWorkflow.val(solicitud.idWorkflow);
            }
        });
        this.modal.show();
    }

    configurarVentana(data, esEdicion, callback) {
        this.btnGuardar.on("click", () => {
            const organizacionValue = $sel_organizacion.val();
            const rangoFechasValue = $input_rangofechas.val();
            const tipoTarifaValue = $sel_tipotarifa.val();

            if (organizacionValue == null || organizacionValue === '') {
                MessageBox.error('Debe seleccionar una Organización');
                return false;
            }
            if (rangoFechasValue == null || rangoFechasValue === '') {
                MessageBox.error('Debe seleccionar un Rango de Fechas');
                return false;
            }
            if (tipoTarifaValue == null || tipoTarifaValue === '') {
                MessageBox.error('Debe seleccionar un Tipo de Tarifa');
                return false;
            }

            let request = {
                idSolicitud: _idSolicitud,
                nombreOrganizacion: $("#sel-organizacion option:selected").text(),
                idOrganizacion: organizacionValue,
                rangoFechas: rangoFechasValue,
                tipoTarifa: tipoTarifaValue
            };
            new SolicitudService().actualizarReportePagoDocente(request, (response) => {
                callback(true);
                MessageBox.info('Solicitud actualizada correctamente');
                this.modal.hide();
            });
        });

        this.cargarData(data, esEdicion, true);
    }
}