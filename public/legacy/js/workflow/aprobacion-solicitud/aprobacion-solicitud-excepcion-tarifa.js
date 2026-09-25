$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class AprobacionSolicitudExcepcionTarifa {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#excepcionTarifaModal"));
        this.idWorkflow = $("#frmExcepcionTarifa #IdWorkflow");
        this.idFaseWorkflow = $("#frmExcepcionTarifa #IdFaseWorkflow");
        this.solicitante = $("#frmExcepcionTarifa #Solicitante");
        this.fechaCreacion = $("#frmExcepcionTarifa #FechaCreacion");
        this.sesion = $("#frmExcepcionTarifa #Sesion");
        this.idSolicitud = $("#frmExcepcionTarifa #IdSolicitud");

        this.comentarioSolicitud = $("#frmExcepcionTarifa #ComentarioSolicitud");
        this.totalCambioTarifa = $("#frmExcepcionTarifa #TotalCambioTarifa");
        this.periodoAcademico = $("#frmExcepcionTarifa #PeriodoAcademico");
        this.dataTable = $("#frmExcepcionTarifa #tblTarifas").DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            order: [],
            columns: [
                { data: "idExcepcionTarifaSolicitud", title: "Id Tarifa", className: "no-mobile" },
                { data: "nombreDocente", title: "Docente", class: "text-capitalize", render: (data) => data.toLowerCase() },
                { data: "nombreCurso", title: "Curso", class: "text-capitalize", render: (data, type, row) => { return `${row.codigoCurso} - ${data.toLowerCase() }`; } },
                { data: "tarifa", title: "Tarifa", render: (data, type, row) => `S/ ${Util.formatearMoneda(data)} ${row.tarifaAnteriorDiferente ? '<span class="badge badge-tarifa rounded-pill bg-danger"> </span>' : ''}` }
            ]
        });
        this.frmAccion = $("#frmExcepcionTarifa");
        this.btnExportar = $("#frmExcepcionTarifa #btnExportar");
        this.btnAprobar = $("#frmExcepcionTarifa #btnAprobar");
        this.btnRechazar = $("#frmExcepcionTarifa #btnRechazar");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {
        let divAcciones = $("#frmExcepcionTarifa #divAcciones");
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
            this.idSolicitud.text(response.solicitud.idSolicitud);
            this.comentarioSolicitud.val(response.solicitud.comentarioSolicitud);
            this.dataTable.clear().rows.add(response.tarifas).draw();
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