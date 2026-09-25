$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

let _tarifas = [];
const $tbl_tarifas = $('#tbl-tarifas');

class AprobacionSolicitudTarifaCurso {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#tarifaCursoModal"));
        this.idWorkflow = $("#frmTarifaCurso #IdWorkflow");
        this.idFaseWorkflow = $("#frmTarifaCurso #IdFaseWorkflow");
        this.solicitante = $("#frmTarifaCurso #Solicitante");
        this.fechaCreacion = $("#frmTarifaCurso #FechaCreacion");
        this.idSolicitud = $("#frmTarifaCurso #IdSolicitud");
        this.motivoJustificacion = $("#frmTarifaCurso #MotivoJustificacion");
        this.frmAccion = $("#frmTarifaCurso");
        this.btnAdjunto = $("#frmTarifaCurso #btnAdjunto");
        this.btnExportar = $("#frmTarifaCurso #btnExportar");
        this.btnAprobar = $("#frmTarifaCurso #btnAprobar");
        this.btnRechazar = $("#frmTarifaCurso #btnRechazar");
        this.totalCambioTarifa = $("#frmTarifaCurso #TotalCambioTarifa");
        this.periodoAcademico = $("#frmTarifaCurso #PeriodoAcademico");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {
        let divAcciones = $("#frmTarifaCurso #divAcciones");
        if (esEvaluador) {
            divAcciones.removeClass("d-none");
        } else {
            divAcciones.addClass("d-none");
        }
        new SolicitudService().obtenerPendienteAprobarPorId(solicitud.idSolicitud, (response) => {
            console.log('response:', response);

            $('#txt-comentario').val(response.solicitud.comentarioSolicitud);
            _tarifas = response.tarifaCurso.map((item) => {
                return {
                    ...item,
                    idOrganizacion: item.organizacion,
                    idPeriodo: item.idPeriodoAcademico,
                    organizacion: item.nombreOrganizacion,
                    periodo: `${item.academicYear + '-' + (item.organizacion == 'ESC' ? item.academicSession : item.academicTerm)}`,
                    curso: `${item.idCurso} - ${item.nombreCurso}`,
                    tipoSesion: item.tipoSesion
                }
            });
            _drawTable();

            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.totalCambioTarifa.text(response.totalCambioTarifa);
            this.periodoAcademico.text(response.periodo);
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

function _drawTable() {
    $tbl_tarifas.DataTable({
        searching: false,
        paging: true,
        info: false,
        lengthChange: true,
        destroy: true,
        language: Util.obtenerLenguajeDataTable(),
        data: _tarifas,
        columns: [
            //{ data: "organizacion", title: "Organización" },
            //{ data: "periodo", title: "Periodo" },
            { data: "curso", title: "Curso" },
            { data: "tipoSesion", title: "Tipo de Sesión" },
            { data: "tarifa", title: "Tarifa", render: (data, type, row) => `S/ ${Util.formatearMoneda(data)} ${row.tarifaAnteriorDiferente ? '<span class="badge badge-tarifa rounded-pill bg-danger"> </span>' : ''}` },
            { data: "tarifaDiferencia", title: "Tarifa Diferencia", render: (data, type, row) => {
                if (data > 0) {
                    return `<span class="text-success fw-bold">+S/ ${Util.formatearMoneda(data)}</span>`;
                } else if (data < 0) {
                    return `<span class="text-danger fw-bold">S/ ${Util.formatearMoneda(data)}</span>`;
                } else {
                    return `S/ ${Util.formatearMoneda(data)}`;
                }
            }}
        ]
    });
}