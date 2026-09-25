$(document).ready(function () {
    const aprobadorWorkflowService = new AprobadorWorkflowService();
    const periodoAcademicoService = new PeriodoAcademicoService();
    let nuevoAprobadorWorkflowModal = null;
    let divContent = $("#divContent");
    let tabla = "#wkAprobadorWorkflowTable";
    let contentCardsMobile = $("#contentCards-grupoUsuario");
    let selectorFiltroFlujo = "#FiltroFlujo";
    let selectorFiltroOrganizacion = "#FiltroOrganizacion";
    let selectorFiltroPeriodo = "#FiltroPeriodo";
    let selectorFiltroGrupoAprobadores = "#FiltroGrupoAprobadores";
    $(selectorFiltroFlujo).prepend(Constantes.Select.OpcionTodos).val('');
    $(selectorFiltroOrganizacion).prepend(Constantes.Select.OpcionTodos).val('');
    $(selectorFiltroPeriodo).prepend(Constantes.Select.OpcionTodos).val('');
    $(selectorFiltroGrupoAprobadores).prepend(Constantes.Select.OpcionTodos).val('');

    wkAprobadorWorkflowBuscar();

    $("#btnBuscar").on("click", () => {
        wkAprobadorWorkflowBuscar();
    });

    $("#btnNuevo").on("click", () => {
        abrirModalRegistro(null);
    });

    $(tabla).on("click", ".editar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data);
    });
    contentCardsMobile.on("click", ".editar", (e) => {
        let data = $(tabla).DataTable().rows().data().toArray();
        let idAprobadorWorkflow = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idAprobadorWorkflow == idAprobadorWorkflow);
        abrirModalRegistro(item);
    });

    $(selectorFiltroOrganizacion).on("change", () => {
        $(selectorFiltroPeriodo).find('option').not(':first').remove();
        const filtroOrganizacion = $(selectorFiltroOrganizacion).val();
        if (filtroOrganizacion == null || filtroOrganizacion.trim() === '') return false;
        wkAprobadorWorkflowListarPeriodosPorOrganizacion();
    });

    function abrirModalRegistro(grupo) {
        if (nuevoAprobadorWorkflowModal) {
            nuevoAprobadorWorkflowModal.cargarData(grupo);
        } else {
            new UtilService().obtenerHtml("WkAprobadorWorkflow/_Create", (html) => {
                divContent.after(html);
                nuevoAprobadorWorkflowModal = new AprobadorWorkflowCreate();
                nuevoAprobadorWorkflowModal.configurarVentana(grupo, (data) => {
                    wkAprobadorWorkflowBuscar();
                });
            });
        }
    }

    function wkAprobadorWorkflowBuscar() {
        let flujo = $("#FiltroFlujo").val();
        let organizacion = $("#FiltroOrganizacion").val();
        let periodo = $("#FiltroPeriodo").val();
        let grupoAprobadores = $("#FiltroGrupoAprobadores").val();
        aprobadorWorkflowService.listar({
            idWorkflow: flujo, organizacion: organizacion, idPeriodoAcademico: periodo
            , idGrupo: grupoAprobadores
        }, (response) => {
            $("#wkAprobadorWorkflowContainer").removeClass('d-none');
            wkAprobadorWorkflowConstruirTabla(response);
            Mobile.generarCard(response, 1, (data) => {
                contentCardsMobile.html('');
                if (data.length === 0) {
                    // Mostrar un mensaje si no hay datos
                    contentCardsMobile.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                    return; // Salir de la función si no hay datos
                }
                data.forEach((item) => {
                    let card = `<div class="mobile-card">
                                    <div>
                                    <button class="btn btn-action-card float-end editar" key="${item.idAprobadorWorkflow}"><i class="fas fa-pencil-alt" key="${item.idAprobadorWorkflow}"></i></button>
                                    <h6 class="fw-bold">${item.workflowNombre}</h6> 
                                </div>
                                <div>
                                    <span>Organización:</span>
                                    <span>${item.organizacionNombre}</span>
                                </div>
                                <div>
                                    <span>Periodo:</span>
                                    <span>${item.periodoAcademico}</span>
                                </div>
                                    </div>`;
                    contentCardsMobile.append(card);
                });
            });
        });
    }

    function wkAprobadorWorkflowConstruirTabla(response) {
        $(tabla).DataTable({
            searching: false,
            paging: true,
            lengthChange: true,
            destroy: true,
            data: response,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "idAprobadorWorkflow", title: "ID aprobador" },
                { data: "workflowNombre", title: "Nombre del flujo" },
                { data: "organizacionNombre", title: "Organización" },
                { data: "periodoAcademico", title: "Periodo" },
                {
                    className: 'td-accion text-center',
                    title: 'Acciones',
                    orderable: false,
                    render: (data, type) => {
                        return '<i class="fas fa-pencil-alt editar"></i>';
                    }
                },
            ],
            order: [],
            //order: [[1, "desc"]],
            drawCallback: () => {
                //$('#tabla thead').addClass("thead-dark");
            }
        });
    }

    function wkAprobadorWorkflowListarPeriodosPorOrganizacion() {
        let filtroOrganizacion = $(selectorFiltroOrganizacion).val();
        periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
            for (let x of response) {
                $(selectorFiltroPeriodo).append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    }
});
