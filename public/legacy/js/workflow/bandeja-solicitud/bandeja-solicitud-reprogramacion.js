$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class BandejaSolicitudReprogramacion {

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

        this.titulo = $("#frmReprogramacionClases #reprogramacionModalTitulo");
        this.evaluador = $("#frmReprogramacionClases #Evaluador");
        this.estadoSolicitud = $("#frmReprogramacionClases #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmReprogramacionClases #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmReprogramacionClases #ComentarioAtencion");

        this.frmAccion = $("#frmReprogramacionClases");

        this.btnExportar = $("#frmReprogramacionClases #btnExportar");
        this.btnGuardar = $("#frmReprogramacionClases #btnGuardar");

        this.model = null;

    }

    cargarData(solicitud, esEdicion, esInicio = false) {

        let divAcciones = $("#frmReprogramacionClases .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmReprogramacionClases #divMotivoRechazoSolicitud");
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

            let inputFechaRecuperacion = document.querySelector('input[name="FechaRecuperacion"]');

            solicitud = response.solicitud;
            this.model = response;

            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.sesion.val(`${response.reprogramacion.idSesion} - ${response.reprogramacion.descCurso} - ${response.reprogramacion.seccion} - ${Util.formatearFechaAsString(response.reprogramacion.fechaSesion)}`);
            this.identificador.val(response.reprogramacion.identificador);
            this.JefeDirecto.val(response.reprogramacion.nombreJefeDirecto);
            this.ProgramaAcademico.val(response.reprogramacion.descPrograma);
            this.Tema.val(response.reprogramacion.temaClase);
            this.FechaRecuperacion.val(response.reprogramacion.fechaRecuperacion.split("T")[0]);
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.HoraInicio.val(response.reprogramacion.horaInicioRecuperacion);
            this.HoraFin.val(response.reprogramacion.horaFinRecuperacion);
            this.CantidadEstudiantes.val(response.reprogramacion.cantidadEstudiantes);
            this.MotivoReprogramacion.val(response.reprogramacion.motivo);

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


            //console.log(Util.formatearFechaAsString(response.reprogramacion.fechaSesion));

            // Establecer el mínimo y máximo
            inputFechaRecuperacion.min = convertirADateInputFormat(Util.formatearFechaAsString(response.reprogramacion.fechaSesion));
            inputFechaRecuperacion.max = sumarDiasAFecha(Util.formatearFechaAsString(response.reprogramacion.fechaSesion), 7);

        });
        this.modal.show();
    }

    configurarVentana(data, esEdicion, callback) {

        this.btnGuardar.on("click", () => {
            //let request = Object.assign(this.model.solicitud, {});
            let reprogramacion = Object.assign(this.model.reprogramacion, {});

            reprogramacion.identificador = this.identificador.val();
            reprogramacion.horaInicioRecuperacion = this.HoraInicio.val();
            reprogramacion.horaFinRecuperacion = this.HoraFin.val();
            reprogramacion.fechaRecuperacion = this.FechaRecuperacion.val();
            reprogramacion.temaClase = this.Tema.val();
            reprogramacion.motivo = this.MotivoReprogramacion.val();

            new SolicitudService().actualizarReprogramacion(reprogramacion, (response) => {
                callback(true);
                MessageBox.info('Solicitud actualizada correctamente');
                this.modal.hide();
            });
        });
        this.cargarData(data, esEdicion, true);
    }
}

function convertirADateInputFormat(fechaDDMMYYYY) {
    const [dia, mes, anio] = fechaDDMMYYYY.split('/');
    return `${anio}-${mes}-${dia}`; // formato que acepta el input
}

function sumarDiasAFecha(fechaDDMMYYYY, diasASumar) {
    const [dia, mes, anio] = fechaDDMMYYYY.split('/');
    const fecha = new Date(`${anio}-${mes}-${dia}`);
    fecha.setDate(fecha.getDate() + diasASumar);
    const diaF = String(fecha.getDate()).padStart(2, '0');
    const mesF = String(fecha.getMonth() + 1).padStart(2, '0');
    const anioF = fecha.getFullYear();
    return `${anioF}-${mesF}-${diaF}`;
}