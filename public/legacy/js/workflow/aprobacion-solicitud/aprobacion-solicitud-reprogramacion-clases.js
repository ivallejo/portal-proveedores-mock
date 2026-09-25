$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class AprobacionSolicitudReprogramacionClases {

    constructor() {
        this.modal = new bootstrap.Offcanvas($("#reprogramacionClasesModal"));
        this.idWorkflow = $("#frmReprogramacionClases #IdWorkflow");
        this.idFaseWorkflow = $("#frmReprogramacionClases #IdFaseWorkflow");
        this.solicitante = $("#frmReprogramacionClases #Solicitante");
        this.fechaCreacion = $("#frmReprogramacionClases #FechaCreacion");
        this.sesion = $("#frmReprogramacionClases #Sesion");
        this.idSolicitud = $("#frmReprogramacionClases #IdSolicitud");
        this.identificador = $("#frmReprogramacionClases #Identificador");
        this.JefeDirecto = $("#frmReprogramacionClases #JefeDirecto");
        this.ProgramaAcademico = $("#frmReprogramacionClases #ProgramaAcademico");
        this.Tema = $("#frmReprogramacionClases #Tema");
        this.FechaRecuperacion = $("#frmReprogramacionClases #FechaRecuperacion");
        this.HoraInicio = $("#frmReprogramacionClases #HoraInicio");
        this.HoraFin = $("#frmReprogramacionClases #HoraFin");
        this.CantidadEstudiantes = $("#frmReprogramacionClases #CantidadEstudiantes");
        this.MotivoReprogramacion = $("#frmReprogramacionClases #MotivoReprogramacion");
  
        this.frmAccion = $("#frmReprogramacionClases");
        this.btnAdjunto = $("#frmReprogramacionClases #btnAdjunto");
        this.btnExportar = $("#frmReprogramacionClases #btnExportar");
        this.btnAprobar = $("#frmReprogramacionClases #btnAprobar");
        this.btnRechazar = $("#frmReprogramacionClases #btnRechazar");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {

        let divAcciones = $("#frmReprogramacionClases #divAcciones");
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
            this.sesion.val(`${response.reprogramacion.idSesion} - ${response.reprogramacion.descCurso} - ${response.reprogramacion.seccion} - ${Util.formatearFechaAsString(response.reprogramacion.fechaSesion)}`);
            this.identificador.val(response.reprogramacion.identificador);
            this.JefeDirecto.val(response.reprogramacion.nombreJefeDirecto);
            this.ProgramaAcademico.val(response.reprogramacion.descPrograma);
            this.Tema.val(response.reprogramacion.temaClase);
            this.FechaRecuperacion.val(response.reprogramacion.temaClase);
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.HoraInicio.val(response.reprogramacion.horaInicioRecuperacion);
            this.HoraFin.val(response.reprogramacion.horaFinRecuperacion);
            this.CantidadEstudiantes.val(response.reprogramacion.cantidadEstudiantes);
            this.MotivoReprogramacion.val(response.reprogramacion.motivo);
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