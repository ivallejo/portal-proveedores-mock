$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class AprobacionSolicitudJustificacionAsistencia {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#justificacionAsistenciaModal"));
        this.idWorkflow = $("#frmJustificacionAsistencia #IdWorkflow");
        this.idFaseWorkflow = $("#frmJustificacionAsistencia #IdFaseWorkflow");
        this.solicitante = $("#frmJustificacionAsistencia #Solicitante");
        this.fechaCreacion = $("#frmJustificacionAsistencia #FechaCreacion");
        this.sesion = $("#frmJustificacionAsistencia #Sesion");
        this.idSolicitud = $("#frmJustificacionAsistencia #IdSolicitud");
        this.identificador = $("#frmJustificacionAsistencia #Identificador");
        this.horaEntrada = $("#frmJustificacionAsistencia #HoraEntrada");
        this.horaSalida = $("#frmJustificacionAsistencia #HoraSalida");
        this.temaClase = $("#frmJustificacionAsistencia #TemaClase");
        this.adjunto = $("#frmJustificacionAsistencia #Adjunto");
        this.motivoJustificacion = $("#frmJustificacionAsistencia #MotivoJustificacion");

        this.frmAccion = $("#frmJustificacionAsistencia");
        this.btnAdjunto = $("#frmJustificacionAsistencia #btnAdjunto");
        this.btnExportar = $("#frmJustificacionAsistencia #btnExportar");
        this.btnAprobar = $("#frmJustificacionAsistencia #btnAprobar");
        this.btnRechazar = $("#frmJustificacionAsistencia #btnRechazar");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {

        let divAcciones = $("#frmJustificacionAsistencia #divAcciones");
        if (esEvaluador) {
            divAcciones.removeClass("d-none");
        } else {
            divAcciones.addClass("d-none");
        }
        new SolicitudService().obtenerPendienteAprobarPorId(solicitud.idSolicitud, (response) => {
            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.sesion.val(`${response.justificacion.idSesion} - ${response.sesionClase.sesionsDesCurso} - ${response.sesionClase.sesionsSeccion} - ${Util.formatearFechaAsString(response.sesionClase.sesiondFechaSesion)}`);
            this.identificador.val(response.justificacion.identificador);
            this.horaEntrada.val(response.justificacion.horaEntrada);
            this.horaSalida.val(response.justificacion.horaSalida);
            this.temaClase.val(response.justificacion.temaClase);
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.adjunto.text(response.justificacion.adjunto);
            this.motivoJustificacion.val(response.justificacion.motivo);
            this.btnExportar.attr("href", URL_BASE + "WkAprobacionSolicitud/DescargarExcelPendienteAprobarPorId?key=" + response.solicitud.idSolicitud);
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
        this.btnAdjunto.on("click", () => {
            let link = document.createElement('a');
            link.href = `${this.model.urlEvidencia}${this.model.justificacion.adjunto}`;
            link.download = this.model.justificacion.adjunto;
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
        this.btnAprobar.on("click", () => {
            let request = Object.assign(this.model.solicitud, {});
            //request.idEstadoSolicitud = Constantes.EstadoSolicitud.Aprobado;
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