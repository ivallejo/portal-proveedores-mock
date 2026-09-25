$(document).ready(function () {
    let divContent = $("#divContent");
    let tabla = "#wkCorreoTable";
    let contentCardsMobile = $("#contentCards-correo");
    let worklow = $("#FiltroWorkflow");
    let estado = $("#FiltroEstado");
    let fase = $("#FiltroFase");
    let plantillaCorreoWorkflowService = new PlantillaCorreoWorkflowService();
    let nuevaPlantillaModal = null;
    $("#btnBuscar").on("click", () => {
        buscar();
    });
    $("#btnNuevo").on("click", () => {
        abrirModalRegistro(null);
    });
    $(tabla).on("click", ".editar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data);
    });
    $(tabla).on("click", ".copiar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data, true);
    });
    contentCardsMobile.on("click", ".editar", (e) => {
        let data = $(tabla).DataTable().rows().data().toArray();
        let idPlantillaCorreoWorkflow = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idPlantillaCorreoWorkflow == idPlantillaCorreoWorkflow);
        abrirModalRegistro(item);
    });
    contentCardsMobile.on("click", ".copiar", (e) => {
        let data = $(tabla).DataTable().rows().data().toArray();
        let idPlantillaCorreoWorkflow = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idPlantillaCorreoWorkflow == idPlantillaCorreoWorkflow);
        abrirModalRegistro(item, true);
    });
    function abrirModalRegistro(plantilla, copiar = false) {
        if (nuevaPlantillaModal) {
            nuevaPlantillaModal.cargarData(plantilla, copiar);
        } else {
            new UtilService().obtenerHtml("WkPlantillaCorreoWorkflow/_Create", (html) => {
                divContent.after(html);
                nuevaPlantillaModal = new PlantillaCorreoWorkflowCreate();
                nuevaPlantillaModal.configurarVentana(plantilla, copiar, (data) => {
                    buscar();
                });
            }, true, true);
        }
    }
    function buscar() {
        plantillaCorreoWorkflowService.listar({ worklow: worklow.val(), estado: estado.val(), fase: fase.val() }, (response) => {
           $("#plantillaCorreoContainer").removeClass('d-none');
           construirTabla(response);
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
                    <button class="btn btn-action-card float-end editar" key="${item.idPlantillaCorreoWorkflow}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="btn btn-action-card float-end copiar me-1" key="${item.idPlantillaCorreoWorkflow}"><i class="fas fa-copy"></i></button>
                    <h6 class="fw-bold">${item.workflow.nombre}</h6> 
                </div>
                <div>
                    <span>Estado:</span>
                    <span>${item.estadoSolicitud.nombre}</span>
                </div>
                <div>
                    <span>Fase:</span>
                    <span>${item.faseWorkflow ? item.faseWorkflow.nombre : ""}</span>
                </div>
                 <div>
                    <span>Activo:</span>
                    <span>${item.activo ? "SI" : "NO"}</span>
                </div>
                    </div>`;
                    contentCardsMobile.append(card);
                });
            });
        });
    }
    function construirTabla(response) {
        $(tabla).DataTable({
            searching: false,
            paging: true,
            lengthChange: true,
            destroy: true,
            data: response,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "idPlantillaCorreoWorkflow", title: "ID" },
                { data: "workflow.nombre", title: "Nombre del flujo" },
                { data: "estadoSolicitud.nombre", title: "Estado" },
                { title: "Fase", render: (data, type, row) => row.faseWorkflow ? row.faseWorkflow.nombre : "" },
                /*{ data: "nombreDestinatario", title: "Destinatario" },*/
                {
                    data: "activo", title: "Activo", orderable: false, render: (data, type, row) => {
                        return `<label class="switch"> <input type="checkbox" ${row.activo ? 'checked' : ''} disabled /><span class="slider round"><span class="on">SI</span><span class="off">NO</span></span> </label>`;
                    }
                },
                {
                    className: 'td-accion text-center',
                    title: 'Acciones',
                    orderable: false,
                    render: (data, type) => {
                        return '<i class="fas fa-pencil-alt editar me-2" title="Editar"></i> <i class="fas fa-copy copiar" title="Copiar"></i>';
                    }
                },
            ],
            order: [],
            drawCallback: () => {
            }
        });
    }

    function cargaInicial() {
        //new ParametroWorkflowService().listar({ dominio: 1 }, (response) => {
        //    worklow.append(`<option value="">--Todos--</option>`);
        //    response.forEach(x => {
        //        worklow.append(`<option value="${x.codigo}">${x.valor}</option>`);
        //    });
        //});
        new WorkflowService().listar({}, (response) => {
            worklow.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                worklow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
            });
        });
        new FaseWorkflowService().listar({}, (response) => {
            fase.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                fase.append(`<option value="${x.idFaseWorkflow}">${x.nombre}</option>`);
            });
        });
        new EstadoSolicitudService().listar({}, (response) => {
            estado.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                estado.append(`<option value="${x.idEstadoSolicitud}">${x.nombre}</option>`);
            });
        });
        buscar();
    }
    cargaInicial();
});