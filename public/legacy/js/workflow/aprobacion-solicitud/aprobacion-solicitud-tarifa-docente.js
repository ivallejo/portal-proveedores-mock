$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
class AprobacionSolicitudTarifaDocente {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#tarifaDocenteModal"));
        this.idWorkflow = $("#frmTarifaDocente #IdWorkflow");
        this.idFaseWorkflow = $("#frmTarifaDocente #IdFaseWorkflow");
        this.solicitante = $("#frmTarifaDocente #Solicitante");
        this.fechaCreacion = $("#frmTarifaDocente #FechaCreacion");
        this.sesion = $("#frmTarifaDocente #Sesion");
        this.idSolicitud = $("#frmTarifaDocente #IdSolicitud");

        this.comentarioSolicitud = $("#frmTarifaDocente #ComentarioSolicitud");
        this.totalCambioTarifa = $("#frmTarifaDocente #TotalCambioTarifa");
        this.periodoAcademico = $("#frmTarifaDocente #PeriodoAcademico");
        this.dataTable = $("#frmTarifaDocente #tblTarifas").DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            order: [],
            columns: [
                { data: "idTarifaDocenteSolicitud", title: "Id Tarifa", className: "no-mobile" },
                { data: "nombreDocente", title: "Docente", class: "text-capitalize", render: (data) => data.toLowerCase() },
                { data: "tarifa", title: "Tarifa", render: (data, type, row) => `S/ ${Util.formatearMoneda(data)} ${row.tarifaAnteriorDiferente ? '<span class="badge badge-tarifa rounded-pill bg-danger"> </span>' : ''}`},
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
        this.frmAccion = $("#frmTarifaDocente");
        this.btnExportar = $("#frmTarifaDocente #btnExportar");
        this.btnAprobar = $("#frmTarifaDocente #btnAprobar");
        this.btnRechazar = $("#frmTarifaDocente #btnRechazar");
        this.rechazoSolicitudModal = new RechazoSolicitudModal();
        this.model = null;
    }

    cargarData(solicitud, esEvaluador, esInicio = false) {
        let divAcciones = $("#frmTarifaDocente #divAcciones");
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