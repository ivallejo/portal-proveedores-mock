$(document).ready(function () {
    const periodoAcademicoService = new PeriodoAcademicoService();
    let tarifaDocenteModal = null;
    let divContent = $("#divContent");
    let selectorOrganizacion = "#organizacion";
    let selectorPeriodo = "#periodo";
    let selectorEstado = "#estado";
    let checkFinal = "#check-final";
    let tblDocentes = "#tarifaDocenteTable";
    let btnBuscar = $("#btnBuscar");
    let btnExportar = $("#btnExportar");
    let contentCardsMobile = $("#contentCards-tarifaDocente");
    $(selectorOrganizacion).prepend(Constantes.Select.OpcionTodos).val('');
    $(selectorPeriodo).prepend(Constantes.Select.OpcionTodos).val('');
    $(selectorEstado).prepend(Constantes.Select.OpcionTodos).val('');

    let dataTable = $(tblDocentes).DataTable({
        searching: false,
        paging: true,
        info: false,
        lengthChange: true,
        destroy: true,
        language: Util.obtenerLenguajeDataTable(),
        columns: [
            { data: "idSolicitud", title: "Solicitud" },
            { data: "organizacion", title: "Organizacion", className: "no-mobile" },
            /*{ data: "periodo", title: "Periodo" },*/
            {
                data: "periodo", title: "Año",
                render: (data) => {
                    return data.split('-')[0]
                }
            },
            {
                data: "periodo", title: "Periodo",
                render: (data) => {
                    return data.split('-')[1]
                }
            },
            {
                data: "totalTarifa", title: "Total Tarifa",
                render: (data) => {
                    return "S/. " + data
                }
            },
            { data: "estadoSolicitud", title: "Estado Solicitud" },
            { data: "faseWorkflow", title: "Fase" },
            { data: "comentarioSolicitud", title: "Comentario" },
            { data: "motivoRechazo", title: "Rechazo Solicitud" },
            { data: "comentarioAtencion" , title: "Comentario Atención" },
            {
                className: 'td-accion text-center',
                title: '<span class="no-mobile">Acciones<span>',
                orderable: false,
                render: (data, type) => {
                    let acciones = "";
                    acciones += '<i class="fas fa-eye visualizar me-2"></i>';
                    return acciones;
                }
            },
        ]
    });
    cargarMobile([]);

    btnExportar.on("click", (e) => {
        if ($(tblDocentes).DataTable().rows().data().count() == 0) {
            e.preventDefault();
            return;
        }
        var anchor = document.createElement('a');
        anchor.href = URL_BASE + "WkExcepcionTarifa/DescargarExcelRepoGeneral?organizacion=" + $(selectorOrganizacion).val() + "&idPeriodoAcademico=" + $(selectorPeriodo).val() + "&estadoSolicitud=" + $(selectorEstado).val() + "&soloFinales=" + $(checkFinal).is(":checked");
        anchor.target = '_blank';
        anchor.click();
    });

    btnBuscar.on("click", (e) => {
        const request = {
            organizacion: $(selectorOrganizacion).val(),
            idPeriodoAcademico: $(selectorPeriodo).val(),
            estadoSolicitud: $(selectorEstado).val(),
            soloFinales: $(checkFinal).is(":checked")
        };

        new ExcepcionTarifaService().listarReporteGeneral(request, (response) => {
            wkTarifaDocenteDataTable();
            if (response.lista.length > 0) {
                response.lista.forEach(item => {
                    let row = new Object();
                    row.idSolicitud = item.idSolicitud;
                    row.organizacion = item.periodoAcademico.organizacion;
                    row.periodo = `${item.periodoAcademico ? item.periodoAcademico?.academicYear + '-' + (item.organizacion == 'ESC' ? item.periodoAcademico?.academicSession : item.periodoAcademico?.academicTerm) : ''}`;
                    row.estadoSolicitud = item.estadoSolicitud?.nombre;
                    row.faseWorkflow = item.faseWorkflow?.nombre || '';
                    row.comentarioSolicitud = item.comentarioSolicitud || '';
                    row.motivoRechazo = item.motivoRechazoSolicitud?.nombre || '';
                    row.comentarioAtencion = item.comentarioAtencion || '';
                    row.totalTarifa = item.correoSolicitante;
                    $(tblDocentes).DataTable().row.add(row).draw();
                });
                cargarMobile();
            }
        }, true, true);
    });

    $(tblDocentes).on("click", ".visualizar", (e) => {
        const key = e.currentTarget.closest("td");
        var data = $(tblDocentes).DataTable().row(key).data();
        abrirModalRegistro(data);
    });
    contentCardsMobile.on("click", ".visualizar", (e) => {
        let data = $(tblDocentes).DataTable().rows().data().toArray();
        let idSolicitud = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idSolicitud == idSolicitud);
        abrirModalRegistro(item);
    });
    function abrirModalRegistro(item) {
        item['soloFinales'] = $(checkFinal).is(":checked");
        if (tarifaDocenteModal)
            tarifaDocenteModal.cargarData(item);
        else {
            new UtilService().obtenerHtml("WkExcepcionTarifa/_GetView", (html) => {
                divContent.after(html);
                tarifaDocenteModal = new ExcepcionTarifaDetalleRepo();
                tarifaDocenteModal.configurarVentana(item, (data) => {
                    cargarMobile();
                });
            });
        }
    }

    $(selectorOrganizacion).on("change", () => {
        if ($(selectorOrganizacion).val().trim() != '') {
            $(selectorPeriodo).find('option').not(':first').remove();
            const organizacion = $(selectorOrganizacion).val();
            if (organizacion == null || organizacion.trim() === '') return false;
            listarPeriodosPorOrganizacion();
        }
        else {
            $(selectorPeriodo).empty().append(Constantes.Select.OpcionTodos).val('');
        }
    });

    $(checkFinal).on("change", () => {
        if ($(checkFinal).is(":checked"))
            $(selectorEstado).prop("disabled", true);
        else
            $(selectorEstado).prop("disabled", false);
    });

    function wkTarifaDocenteDataTable() {
        dataTable.clear().draw();
    }
    function listarPeriodosPorOrganizacion() {
        let filtroOrganizacion = $(selectorOrganizacion).val();
        periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
            for (let x of response) {
                $(selectorPeriodo).append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    }

    function cargarMobile(response) {
        if (!response)
            response = $(tblDocentes).DataTable().rows().data().toArray();
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
                    <button class="btn btn-action-card float-end visualizar" key="${item.idSolicitud}"><i class="fas fa-eye" key="${item.idSolicitud}"></i></button>
                </div>
                <div>
                    <span>Organización:</span>
                    <span>${item.organizacion}</span>
                </div>
                <div>
                    <span>Periodo:</span>
                    <span>${item.periodo}</span>
                </div>
                <div>
                    <span>Total Tarifa:</span>
                    <span>S/. ${item.totalTarifa}</span>
                </div>
                <div>
                    <span>Estado:</span>
                    <span>${item.estadoSolicitud}</span>
                </div>
                <div>
                    <span>Comentario Atención:</span>
                    <span>${item.comentarioAtencion}</span>
                </div>
                    </div>`;
                contentCardsMobile.append(card);
            });
        });
    }

    wkTarifaDocenteDataTable();
});