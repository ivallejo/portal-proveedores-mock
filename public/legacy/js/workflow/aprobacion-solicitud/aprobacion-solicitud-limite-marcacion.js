$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const $sel_organizacion = $('#sel-organizacion');
const $sel_periodo = $('#sel-periodo');
const $btn_registrar = $('#btn-registrar');
const $input_minantesentrada = $('#input-minantesentrada');
const $input_mindespuesentrada = $('#input-mindespuesentrada');
const $input_minantessalida = $('#input-minantessalida');
const $input_mindespuessalida = $('#input-mindespuessalida');
const $input_factorturnomanana = $('#input-factorturnomanana');
const $input_factorturnotarde = $('#input-factorturnotarde');
const $input_factorturnonoche = $('#input-factorturnonoche');
const $input_nombreorganizacion = $('#input-nombreorganizacion');
const $input_nombreperiodo = $('#input-nombreperiodo');

class AprobacionSolicitudLimiteMarcacion {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#limiteMarcacionModal"));
        this.idWorkflow = $("#frmLimiteMarcacion #IdWorkflow");
        this.idFaseWorkflow = $("#frmLimiteMarcacion #IdFaseWorkflow");
        this.solicitante = $("#frmLimiteMarcacion #Solicitante");
        this.fechaCreacion = $("#frmLimiteMarcacion #FechaCreacion");
        this.idSolicitud = $("#frmLimiteMarcacion #IdSolicitud");
        this.motivoJustificacion = $("#frmLimiteMarcacion #MotivoJustificacion");

        this.frmAccion = $("#frmLimiteMarcacion");
        this.btnExportar = $("#frmLimiteMarcacion #btnExportar");
        this.btnAprobar = $("#frmLimiteMarcacion #btnAprobar");
        this.btnRechazar = $("#frmLimiteMarcacion #btnRechazar");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {
        let divAcciones = $("#frmLimiteMarcacion #divAcciones");
        if (esEvaluador) {
            divAcciones.removeClass("d-none");
        } else {
            divAcciones.addClass("d-none");
        }
        new SolicitudService().obtenerPendienteAprobarPorId(solicitud.idSolicitud, (response) => {
            console.log('response:', response);

            $input_nombreorganizacion.val(response.limiteMarcacion.nombreOrganizacion);
            $input_nombreperiodo.val(`${response.limiteMarcacion.academicYear}-${response.limiteMarcacion.academicTerm}`
                + (response.limiteMarcacion.academicSession?.trim() != '' ? `-${response.limiteMarcacion.academicSession}` : ''));
            $input_minantesentrada.val(response.limiteMarcacion.minAntesEntrada);
            $input_mindespuesentrada.val(response.limiteMarcacion.minDespuesEntrada);
            $input_minantessalida.val(response.limiteMarcacion.minAntesSalida);
            $input_mindespuessalida.val(response.limiteMarcacion.minDespuesSalida);
            $input_factorturnomanana.val(response.limiteMarcacion.factorTurnoManana);
            $input_factorturnotarde.val(response.limiteMarcacion.factorTurnoTarde);
            $input_factorturnonoche.val(response.limiteMarcacion.factorTurnoNoche);
            this.gestionarFactores(response.limiteMarcacion.organizacion);
            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.idSolicitud.text(response.solicitud.idSolicitud);
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

    gestionarFactores(organizacionVal) {
    if (organizacionVal == 'ESC') {
        $("#divRowFactorNocheModal, #divFactorTardeModal").addClass("d-none");
        $input_factorturnomanana.closest("div").parent().removeClass("col-md-6").addClass("col-md-12");
        $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor");
    }
    else {
        $("#divRowFactorNocheModal, #divFactorTardeModal").removeClass("d-none");
        $input_factorturnomanana.closest("div").parent().removeClass("col-md-12").addClass("col-md-6");
        $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor de turno mañana");
    }
}
}
