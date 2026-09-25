$(document).ready(function () {

    let divContent = $("#divContent");
    let tabla = "#wkGrupoUsuarioTable";
    let contentCardsMobile = $("#contentCards-grupoUsuario");
    let grupoUsuarioService = new GrupoUsuarioService();
    let nuevoGrupoModal = null;

    wkGrupoUsuarioBuscar();

    $("#btnBuscar").on("click", () => {
        wkGrupoUsuarioBuscar();
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
        let idGrupo = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idGrupo == idGrupo);
        abrirModalRegistro(item);
    });
    function abrirModalRegistro(grupo) {
        if (nuevoGrupoModal) {
            nuevoGrupoModal.cargarData(grupo);
        } else {
            new UtilService().obtenerHtml("WkGrupoUsuario/_Create", (html) => {
                divContent.after(html);
                nuevoGrupoModal = new GrupoUsuarioCreate();
                nuevoGrupoModal.configurarVentana(grupo, (data) => {
                    wkGrupoUsuarioBuscar();
                });
            });
        }
    }
    function wkGrupoUsuarioBuscar() {
        let grupo = $("#FiltroGrupo").val();
        let estado = $("#FiltroEstado").val();
        grupoUsuarioService.listar({ grupo: grupo, estado: estado }, (response) => {
            $("#wkGrupoUsuarioContainer").removeClass('d-none');
            wkGrupoUsuarioConstruirTabla(response);
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
                    <button class="btn btn-action-card float-end editar" key="${item.idGrupo}"><i class="fas fa-pencil-alt" key="${item.idGrupo}"></i></button>
                    <h6 class="fw-bold">${item.nombre}</h6> 
                </div>
                <div>
                    <span>Cantidad de usuarios:</span>
                    <span>${item.cantidadUsuarios}</span>
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
    function wkGrupoUsuarioConstruirTabla(response) {
        $(tabla).DataTable({
            searching: false,
            paging: true,
            lengthChange: true,
            destroy: true,
            data: response,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "idGrupo", title: "ID grupo" },
                { data: "nombre", title: "Nombre del grupo" },
                { data: "cantidadUsuarios", title: "Cantidad de usuarios" },
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
});
