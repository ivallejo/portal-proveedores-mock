$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const periodoAcademicoServiceLM = new PeriodoAcademicoService();
const limiteMarcacionService = new LimiteMarcacionService();

let _idSolicitudLM = 0;

const $sel_organizacion = $('#sel-organizacion');
const $sel_periodo = $('#sel-periodo');
const $btn_copiar = $('#btn-copiar');
const $btn_registrar = $('#btn-registrar');
const $input_minantesentrada = $('#input-minantesentrada');
const $input_mindespuesentrada = $('#input-mindespuesentrada');
const $input_minantessalida = $('#input-minantessalida');
const $input_mindespuessalida = $('#input-mindespuessalida');
const $input_factorturnomanana = $('#input-factorturnomanana');
const $input_factorturnotarde = $('#input-factorturnotarde');
const $input_factorturnonoche = $('#input-factorturnonoche');

$sel_organizacion.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_periodo.prepend(Constantes.Select.OpcionSeleccione).val('');

$sel_organizacion.on('change', function () {
    const organizacionValue = $(this).val();
    $sel_periodo.find('option').not(':first').remove();
    gestionarFactores(organizacionValue);
    if (organizacionValue == null || organizacionValue.trim() === '') return false;
    periodoAcademicoServiceLM.listarPorOrganizacion(organizacionValue, (response) => {
        for (let x of response) {
            $sel_periodo.append($("<option></option>").attr("value", x.key).text(x.value));
        }
    });
});

$btn_copiar.on('click', function (e) {
    e.preventDefault();
    const idPeriodoAcademico = $sel_periodo.val();
    if (isNaN(parseInt(idPeriodoAcademico))) {
        MessageBox.error('Seleccione un periodo');
        return false;
    }
    limiteMarcacionService.obtenerPeriodoAnterior(idPeriodoAcademico, (response) => {
        if (!response) {
            MessageBox.error('No se encontró información del periodo anterior');
            return false;
        }
        $input_minantesentrada.val(response.minAntesEntrada);
        $input_mindespuesentrada.val(response.minDespuesEntrada);
        $input_minantessalida.val(response.minAntesSalida);
        $input_mindespuessalida.val(response.minDespuesSalida);
        $input_factorturnomanana.val(response.factorTurnoManana);
        $input_factorturnotarde.val(response.factorTurnoTarde);
        $input_factorturnonoche.val(response.factorTurnoNoche);
    });
});

function gestionarFactores(organizacionVal) {
    if (organizacionVal == 'ESC') {
        $("#divRowFactorNocheModal, #divFactorTardeModal").addClass("d-none");
        $input_factorturnotarde.val("");
        $input_factorturnonoche.val("");
        $input_factorturnomanana.closest("div").parent().removeClass("col-md-6").addClass("col-md-12");
        $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor");
    }
    else {
        $("#divRowFactorNocheModal, #divFactorTardeModal").removeClass("d-none");
        $input_factorturnomanana.closest("div").parent().removeClass("col-md-12").addClass("col-md-6");
        $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor de turno mañana");
    }
}

class BandejaSolicitudLimiteMarcacion {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#limiteMarcacionModal"));
        this.idWorkflow = $("#frmLimiteMarcacion #IdWorkflow");
        this.idFaseWorkflow = $("#frmLimiteMarcacion #IdFaseWorkflow");
        this.solicitante = $("#frmLimiteMarcacion #Solicitante");
        this.fechaCreacion = $("#frmLimiteMarcacion #FechaCreacion");

        this.idSolicitud = $("#frmLimiteMarcacion #IdSolicitud");
        this.titulo = $("#frmLimiteMarcacion #limiteMarcacionModalTitulo");
        this.evaluador = $("#frmLimiteMarcacion #Evaluador");
        this.estadoSolicitud = $("#frmLimiteMarcacion #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmLimiteMarcacion #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmLimiteMarcacion #ComentarioAtencion");

        this.frmAccion = $("#frmLimiteMarcacion");
        this.btnExportar = $("#frmLimiteMarcacion #btnExportar");
        this.btnGuardar = $("#frmLimiteMarcacion #btnGuardar");;
        this.model = null;
    }

    cargarData(solicitud, esEdicion, esInicio = false) {
        _idSolicitudLM = solicitud.idSolicitud;
        let divAcciones = $("#frmLimiteMarcacion .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmLimiteMarcacion #divMotivoRechazoSolicitud");
        if (esEdicion) {
            this.titulo.text("Edición de Solicitud");
            divAcciones.removeClass("d-none");
            $btn_copiar.removeClass("d-none");
            $(".edit-control").prop("disabled", false);
        } else {
            this.titulo.text("Consulta de Solicitud");
            divAcciones.addClass("d-none");
            $btn_copiar.addClass("d-none");
            $(".edit-control").prop("disabled", true);
        }
        new SolicitudService().obtenerParticipadosPorId(solicitud.idSolicitud, (response) => {
            const organizacionValue = response.limiteMarcacion.organizacion;
            $sel_organizacion.val(organizacionValue);
            gestionarFactores(organizacionValue);
            periodoAcademicoServiceLM.listarPorOrganizacion(organizacionValue, (response_periodo) => {
                for (let x of response_periodo) {
                    $sel_periodo.append($("<option></option>").attr("value", x.key).text(x.value));
                }
                $sel_periodo.val(response.limiteMarcacion.idPeriodoAcademico);
            });
            $input_minantesentrada.val(response.limiteMarcacion.minAntesEntrada);
            $input_mindespuesentrada.val(response.limiteMarcacion.minDespuesEntrada);
            $input_minantessalida.val(response.limiteMarcacion.minAntesSalida);
            $input_mindespuessalida.val(response.limiteMarcacion.minDespuesSalida);
            $input_factorturnomanana.val(response.limiteMarcacion.factorTurnoManana);
            $input_factorturnotarde.val(response.limiteMarcacion.factorTurnoTarde);
            $input_factorturnonoche.val(response.limiteMarcacion.factorTurnoNoche);
            //--</>--
            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.estadoSolicitud.val(response.solicitud.estadoSolicitud.nombre);
            this.evaluador.val(response.solicitud.nombreEvaluador?.toLowerCase() || ' ');
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
        });
        this.modal.show();
    }

    configurarVentana(data, esEdicion, callback) {
        this.btnGuardar.on("click", () => {
            let request = {
                idSolicitud: _idSolicitudLM,
                minAntesEntrada: $input_minantesentrada.val(),
                minDespuesEntrada: $input_mindespuesentrada.val(),
                minAntesSalida: $input_minantessalida.val(),
                minDespuesSalida: $input_mindespuessalida.val(),
                factorTurnoManana: $input_factorturnomanana.val(),
                factorTurnoTarde: $input_factorturnotarde.val(),
                factorTurnoNoche: $input_factorturnonoche.val()
            };
            new SolicitudService().actualizarLimiteMarcacion(request, (response) => {
                callback(true);
                MessageBox.info('Solicitud actualizada correctamente');
                this.modal.hide();
            });
        });

        this.cargarData(data, esEdicion, true);
    }
}
