$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class BandejaSolicitudJustificacionAsistencia {
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
        this.titulo = $("#frmJustificacionAsistencia #justificacionAsistenciaModalTitulo");

        this.evaluador = $("#frmJustificacionAsistencia #Evaluador");
        this.estadoSolicitud = $("#frmJustificacionAsistencia #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmJustificacionAsistencia #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmJustificacionAsistencia #ComentarioAtencion");
        this.inputAdjunto = $("#frmJustificacionAsistencia #inputAdjunto");
        this.labelAdjunto = $("#frmJustificacionAsistencia #LabelAdjunto");

        this.frmAccion = $("#frmJustificacionAsistencia");
        this.btnCargarAdjunto = $("#frmJustificacionAsistencia #btnCargarAdjunto");
        this.btnExportar = $("#frmJustificacionAsistencia #btnExportar");
        this.btnGuardar = $("#frmJustificacionAsistencia #btnGuardar");;
        this.model = null;
    }

    cargarData(solicitud, esEdicion, esInicio = false) {
        this.labelAdjunto.text("Evidencia");
        let divAcciones = $("#frmJustificacionAsistencia .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmJustificacionAsistencia #divMotivoRechazoSolicitud");
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
            this.adjunto.attr("href", `${response.urlEvidencia}${response.justificacion.adjunto}`);
            this.motivoJustificacion.val(response.justificacion.motivo);
            this.evaluador.val(response.solicitud.nombreEvaluador?.toLowerCase() || ' ');
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
            this.modal.show();
        });
        //this.modal.show();
    }

    configurarVentana(data, esEdicion, callback) {
        //this.btnDescargarAdjunto.on("click", () => {
        //    let link = document.createElement('a');
        //    link.href = `${this.model.urlEvidencia}${this.model.justificacion.adjunto}`;
        //    link.download = this.model.justificacion.adjunto;
        //    document.body.appendChild(link);
        //    link.click();
        //    link.remove();
        //});
        this.inputAdjunto.on("change", () => {
            if (this.inputAdjunto[0].files.length > 0) {
                let ext = this.inputAdjunto[0].files[0].name.split('.').pop().trim();
                if (ext !== "docx" && ext !== "doc" && ext !== "pdf") {
                    this.inputAdjunto.val(null);
                    MessageBox.showMessenger("Documento adjunto inválido", 'error', 'Error')
                }
                this.labelAdjunto.text(this.inputAdjunto[0].files[0].name);
            } else {
                this.labelAdjunto.text("Evidencia");
            }
        });
        this.btnCargarAdjunto.on("click", () => {
            this.inputAdjunto.click();
        });
        this.btnGuardar.on("click", () => {
            //let request = Object.assign(this.model.solicitud, {});
            let justificacion = Object.assign(this.model.justificacion, {});
            justificacion.temaClase = this.temaClase.val();
            justificacion.motivo = this.motivoJustificacion.val();
            if (this.inputAdjunto[0].files.length > 0)
                justificacion.fileAdjunto = this.inputAdjunto[0].files[0];
            new SolicitudService().actualizarJustificacion(justificacion, (response) => {
                callback(true);
                MessageBox.info('Solicitud actualizada correctamente');
                this.modal.hide();
            });
        });
        this.cargarData(data, esEdicion, true);
    }
}