$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
    const periodoAcademicoService = new PeriodoAcademicoService();
    let selectorFiltroFlujo = "#frmAccion #idWorkflow";
    let selectorFiltroOrganizacion = "#frmAccion #organizacion";
    let selectorFiltroPeriodo = "#frmAccion #idPeriodoAcademico";
    let selectorFiltroFase = "#frmAccion #idFaseWorkflow";
    let selectorFiltroGrupo = "#frmAccion #idGrupo";
    $(selectorFiltroFlujo).prepend(Constantes.Select.OpcionSeleccione);
    $(selectorFiltroOrganizacion).prepend(Constantes.Select.OpcionSeleccione);
    $(selectorFiltroPeriodo).prepend(Constantes.Select.OpcionSeleccione);
    $(selectorFiltroFase).prepend(Constantes.Select.OpcionSeleccione);
    $(selectorFiltroGrupo).prepend(Constantes.Select.OpcionSeleccione);

    $(selectorFiltroOrganizacion).on("change", () => {
        $(selectorFiltroPeriodo).find('option').not(':first').remove();
        const filtroOrganizacion = $(selectorFiltroOrganizacion).val();
        if (filtroOrganizacion == null || filtroOrganizacion.trim() === '') return false;
        periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
            for (let x of response) {
                $(selectorFiltroPeriodo).append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    });
});

class AprobadorWorkflowCreate {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#nuevoAprobadorWorkflowModal"));
        this.tituloModal = $("#frmAccion #tituloNuevoAprobadorWorkflowModal");
        this.idAprobadorWorkflow = 0;
        this.frmAccion = $("#frmAccion");
        this.idWorkflow = $("#frmAccion #idWorkflow");
        this.organizacion = $("#frmAccion #organizacion");
        this.idPeriodoAcademico = $("#frmAccion #idPeriodoAcademico");
        this.idFaseWorkflow = $("#frmAccion #idFaseWorkflow");
        this.idGrupo = $("#frmAccion #idGrupo");
        this.btnGuardar = $("#frmAccion #btnGuardar");
        this.btnAgregarGrupo = $("#frmAccion #btnAgregarGrupo");
        this.tblGrupos = $("#frmAccion #tblGrupos");
        this.dataTable = this.tblGrupos.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "idAprobadorGrupoWorkflow", title: "ID grupo", className: "no-mobile" },
                { data: "faseWorkflowNombre", title: "Fase" },
                { data: "grupoNombre", title: "Nombre del grupo" },
                {
                    className: 'td-accion text-center',
                    title: '<span class="no-mobile">Acciones<span>',
                    orderable: false,
                    render: (data, type) => {
                        return '<i class="fas fa-trash eliminar-grupo"></i>';
                    }
                },
            ]
        });
        this.model = null;
    }
    cargarData(aprobadorWorkflow) {
        //this.model = aprobadorWorkflow;
        this.frmAccion.find(".was-validated").removeClass("was-validated");
        this.idWorkflow.val("");
        this.organizacion.val("");
        this.idPeriodoAcademico.val("");
        this.idFaseWorkflow.val("");
        this.idGrupo.val("");
        //listamos la data de la tabla
        if (aprobadorWorkflow) {
            this.tituloModal.text("Edición de Aprobador");
            this.idAprobadorWorkflow = aprobadorWorkflow.idAprobadorWorkflow;
            this.idWorkflow.val(aprobadorWorkflow.idWorkflow);
            this.organizacion.val(aprobadorWorkflow.organizacion);

            const periodoContainer = this.idPeriodoAcademico.closest('div.row').first();
            periodoContainer.removeClass('d-none');
            if (aprobadorWorkflow.idWorkflow == Constantes.Workflow.ReporteDePagoDeDocentes) {
                periodoContainer.addClass('d-none');
            } else {
                const periodoAcademicoService = new PeriodoAcademicoService();
                let selectorFiltroOrganizacion = "#frmAccion #organizacion";
                let selectorFiltroPeriodo = "#frmAccion #idPeriodoAcademico";
                $(selectorFiltroPeriodo).find('option').not(':first').remove();
                const filtroOrganizacion = $(selectorFiltroOrganizacion).val();
                periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
                    for (let x of response) {
                        $(selectorFiltroPeriodo).append($("<option></option>").attr("value", x.key).text(x.value));
                    }
                    this.idPeriodoAcademico.val(aprobadorWorkflow.idPeriodoAcademico);
                });
            }

            new AprobadorWorkflowService().listarGruposPorAprobador(aprobadorWorkflow.idAprobadorWorkflow, (grupos) => {
                this.dataTable.clear().rows.add(grupos).draw();
            });
        } else {
            this.idAprobadorWorkflow = 0;
            this.tituloModal.text("Nuevo Aprobador");
            this.dataTable.clear().draw();
            this.idWorkflow.val("");
            this.organizacion.val("");
            this.idPeriodoAcademico.val("");
            this.idFaseWorkflow.val("");
            this.idGrupo.val("");
            //this.vigente.first().prop("checked", true);
        }
        this.modal.show();
    }
    configurarVentana(grupo, callback) {
        this.idWorkflow.on("change", () => {
            const periodoContainer = this.idPeriodoAcademico.closest('div.row').first();
            periodoContainer.removeClass('d-none');
            if (this.idWorkflow.val() == Constantes.Workflow.ReporteDePagoDeDocentes) {
                this.idPeriodoAcademico.removeAttr('required');
                this.idPeriodoAcademico.val('');
                periodoContainer.addClass('d-none');
                //this.idPeriodoAcademico.parent().addClass("was-validated");
            } else {
                this.idPeriodoAcademico.attr('required', true);
                //this.idPeriodoAcademico.parent().removeClass("was-validated");
            }
        });
        this.btnGuardar.on("click", () => {
            if (this.frmAccion.valid()) {
                let grupos = this.tblGrupos.DataTable().rows().data().toArray();
                let request = new Object();
                if (this.model)
                    request = Object.assign(this.model, {});
                request.idAprobadorWorkflow = this.idAprobadorWorkflow;
                request.idWorkflow = this.idWorkflow.val();
                request.organizacion = this.organizacion.val();
                request.idPeriodoAcademico = this.idPeriodoAcademico.val();
                //request.activo = this.vigente.first().is(":checked");
                request.grupos = grupos;
                let actualizar = !isNaN(request.idAprobadorWorkflow) && parseInt(request.idAprobadorWorkflow) > 0;
                if (actualizar) {
                    new AprobadorWorkflowService().actualizar(request, (response) => {
                        callback(true);
                        MessageBox.info('Aprobador actualizado correctamente');
                        this.modal.hide();
                    }, true, true);
                } else {
                    new AprobadorWorkflowService().agregar(request, (response) => {
                        callback(true);
                        MessageBox.info('Aprobador guardado correctamente');
                        this.modal.hide();
                    }, true, true);
                }
                return false;
            } else {
                this.idWorkflow.parent().addClass("was-validated");
                this.organizacion.parent().addClass("was-validated");
                this.idPeriodoAcademico.parent().addClass("was-validated");
            }
        });
        this.tblGrupos.on("click", ".eliminar-grupo", (e) => {
            var data = this.tblGrupos.DataTable().row(e.currentTarget.closest("td")).data();
            this.dataTable.row(e.currentTarget.closest("tr")).remove().draw();
        });
        this.btnAgregarGrupo.on("click", () => {
            let idFaseWorkflow = this.idFaseWorkflow.val();
            let idGrupo = this.idGrupo.val();
            if (idFaseWorkflow == null || idFaseWorkflow.trim() === '' || idGrupo == null || idGrupo.trim() === '') return false;
            let grupos = this.tblGrupos.DataTable().rows().data().toArray();
            if (grupos.findIndex(x => x.idFaseWorkflow === idFaseWorkflow && x.idGrupo === idGrupo) >= 0) {
                MessageBox.showMessenger('El grupo ya está asignado', 'warning', 'Grupo Duplicado');
            } else {
                let row = new Object();
                row.idAprobadorGrupoWorkflow = null;
                row.idFaseWorkflow = idFaseWorkflow;
                row.idGrupo = idGrupo;
                row.faseWorkflowNombre = this.idFaseWorkflow.find('option:selected').text();;
                row.grupoNombre = this.idGrupo.find('option:selected').text();
                this.tblGrupos.DataTable().row.add(row).draw();
            }
        });
        this.cargarData(grupo);
    }
}