$(document).ready(function () {
    let divContent = $("#divContent");
    let organizacion = $("#FiltroOrganizacion");
    let worklow = $("#FiltroWorkflow");
    let estado = $("#FiltroEstado");
    let fechas = $("#filtroFecha");
    let tabla = "#wkBandejaTable";
    let contentCardsMobile = $("#contentCards-bandeja");
    let justificacionAsistenciaModal = null;
    let tarifaDocenteModal = null;
    let tarifaDocenteConceptoExtraordinarioModal = null;
    let tarifaCursoModal = null;
    let limiteMarcacionModal = null;
    let excepcionTarifaModal = null;
    let atencionSolicitudModal = null;
    let reportePagoDocenteModal = null;
    let reprogramacionTarifaModal = null;
    fechas.daterangepicker({
        opens: 'left',
        startDate: moment().add(-7, 'day'),
        maxDate: moment(),
        locale: {
            format: 'DD/MM/YYYY'
        }
    });

    $("#btnBuscar").on("click", () => {
        buscar();
    });
    $(tabla).on("click", ".editar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data, true);
    });
    $(tabla).on("click", ".consultar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data);
    });
    contentCardsMobile.on("click", ".editar", (e) => {
        let data = $(tabla).DataTable().rows().data().toArray();
        let idSolicitud = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idSolicitud == idSolicitud);
        abrirModalRegistro(item, true);
    });
    contentCardsMobile.on("click", ".consultar", (e) => {
        let data = $(tabla).DataTable().rows().data().toArray();
        let idSolicitud = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idSolicitud == idSolicitud);
        abrirModalRegistro(item);
    });
    contentCardsMobile.on("click", ".atencion", (e) => {
        let data = $(tabla).DataTable().rows().data().toArray();
        let idSolicitud = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idSolicitud == idSolicitud);
        abrirModalAtencion(item);
    });
    $(tabla).on("click", ".atencion", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalAtencion(data);
    });
    function buscar() {

        new SolicitudService().listarParticipados({
            organizacion: organizacion.val(),
            idWorkflow: worklow.val(),
            idEstadoSolicitud: estado.val(),
            fechaDesde: fechas.data('daterangepicker').startDate.format('DD/MM/YYYY'),
            fechaHasta: fechas.data('daterangepicker').endDate.format('DD/MM/YYYY')
        }, (response) => {
            $("#bandejaContainer").removeClass('d-none');
            construirTabla(response);
            Mobile.generarCard(response.items, 1, (data) => {
                contentCardsMobile.html('');
                if (data.length === 0) {
                    // Mostrar un mensaje si no hay datos
                    contentCardsMobile.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                    return; // Salir de la función si no hay datos
                }
                data.forEach((item) => {
                    let card = `<div class="mobile-card">
                    <div>
                    ${(item.idEstadoSolicitud === Constantes.EstadoSolicitud.Solicitado || item.idEstadoSolicitud === Constantes.EstadoSolicitud.EnEvaluacion)
                            && item.usuarioCreacion.endsWith(response.usuario) ? `<button class="btn btn-action-card float-end editar" key="${item.idSolicitud}"><i class="fas fa-pencil-alt"></i></button>` : ``}
                        <button class="btn btn-action-card float-end atencion me-1" key="${item.idSolicitud}"><i class="fas fa-calendar-alt"></i></button>
                        <button class="btn btn-action-card float-end consultar me-1" key="${item.idSolicitud}"><i class="fas fa-eye"></i></button>
                        <h6 class="fw-bold">${item.workflow.nombre}</h6> 
                </div>
                <div>
                    <span>Organización:</span>
                    <span class="text-capitalize">${item.organizacion}</span>
                </div>
                <div>
                    <span>Solicitante:</span>
                    <span class="text-capitalize">${item.nombreSolicitante.toLowerCase()}</span>
                </div>
                <div>
                    <span>Estado:</span>
                    <span>${item.estadoSolicitud.nombre}</span>
                </div>
                <div>
                    <span>Fecha Solicitud:</span>
                    <span>${Util.formatearFechaHoraAsString(item.fechaCreacion)}</span>
                </div>
                 <div>
                    <span>Evaluador:</span>
                    <span>${item.nombreEvaluador}</span>
                </div>
                <div>
                    <span>Fecha Evaluación:</span>
                    <span>${item.usuarioEvaluador ? Util.formatearFechaHoraAsString(item.fechaModificacion) : ""}</span>
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
            data: response.items,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                { data: "idSolicitud", title: "ID" },
                { data: "organizacion", title: "Organización", visible: false },
                { data: "periodoAcademico.organizacion", title: "Organización" },
                { data: "workflow.nombre", title: "Nombre del flujo" },
                { data: "nombreSolicitante", title: "Solicitante", class: "text-capitalize", render: (data, type, row) => row.nombreSolicitante.toLowerCase() },
                { data: "estadoSolicitud.nombre", title: "Estado" },
                { title: "Fecha Solicitud", render: (data, type, row) => Util.formatearFechaHoraAsString(row.fechaCreacion) },
                { title: "Evaluador", render: (data, type, row) => `${row.nombreEvaluador}` },
                { title: "Fecha Evaluación", render: (data, type, row) => row.usuarioEvaluador ? Util.formatearFechaHoraAsString(row.fechaModificacion) : "" },
                {
                    className: 'td-accion text-center',
                    title: 'Acciones',
                    orderable: false,
                    render: (data, type, row) => {
                        let acciones = "";
                        if ((row.idEstadoSolicitud === Constantes.EstadoSolicitud.Solicitado || row.idEstadoSolicitud === Constantes.EstadoSolicitud.EnEvaluacion)
                            && row.usuarioCreacion.endsWith(response.usuario))
                            acciones = '<i class="fas fa-pencil-alt editar me-2"></i>';
                        acciones += '<i class="fas fa-calendar-alt atencion mt-1 me-2" title="Historial de atención"></i>';
                        acciones += '<i class="fas fa-eye consultar mt-1" title="Ver"></i>';
                        return acciones;
                    }
                },
            ],
            order: [],
            drawCallback: () => {

            }
        });
    }
    function abrirModalAtencion(solicitud) {
        if (atencionSolicitudModal) {
            atencionSolicitudModal.cargarData(solicitud);
        } else {
            new UtilService().obtenerHtml("WkBandejaSolicitud/_AtencionSolicitud", (html) => {
                divContent.after(html);
                atencionSolicitudModal = new AtencionSolicitud();
                atencionSolicitudModal.configurarVentana(solicitud, (data) => {
                    buscar();
                });
            }, true, true);
        }
    }
    function abrirModalRegistro(solicitud, esEdicion = false) {
        switch (solicitud.idWorkflow) {
            case Constantes.Workflow.JustificacionAsistencia:
                if (justificacionAsistenciaModal) {
                    justificacionAsistenciaModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_JustificacionAsistencia", (html) => {
                        divContent.after(html);
                        justificacionAsistenciaModal = new BandejaSolicitudJustificacionAsistencia();
                        justificacionAsistenciaModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.TarifaDocentes:
                if (tarifaDocenteModal) {
                    tarifaDocenteModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_TarifaDocente", (html) => {
                        divContent.after(html);
                        tarifaDocenteModal = new BandejaSolicitudTarifaDocente();
                        tarifaDocenteModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.TarifaDeDocenteConceptoExtraordinario:
                if (tarifaDocenteConceptoExtraordinarioModal) {
                    tarifaDocenteConceptoExtraordinarioModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_TarifaDocenteConceptoExtraordinario", (html) => {
                        divContent.after(html);
                        tarifaDocenteConceptoExtraordinarioModal = new BandejaSolicitudTarifaDocenteConceptoExtraordinario();
                        tarifaDocenteConceptoExtraordinarioModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.TarifaCursos:
                if (tarifaCursoModal) {
                    tarifaCursoModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_TarifaCurso", (html) => {
                        divContent.after(html);
                        tarifaCursoModal = new BandejaSolicitudTarifaCurso();
                        tarifaCursoModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.LimitesMarcacion:
                if (limiteMarcacionModal) {
                    limiteMarcacionModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_LimiteMarcacion", (html) => {
                        divContent.after(html);
                        limiteMarcacionModal = new BandejaSolicitudLimiteMarcacion();
                        limiteMarcacionModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.ExcepcionesTarifasDocente:
                if (excepcionTarifaModal) {
                    excepcionTarifaModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_ExcepcionTarifa", (html) => {
                        divContent.after(html);
                        excepcionTarifaModal = new BandejaSolicitudExcepcionTarifa();
                        excepcionTarifaModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.ReporteDePagoDeDocentes:
                if (reportePagoDocenteModal) {
                    reportePagoDocenteModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_ReportePagoDocente", (html) => {
                        divContent.after(html);
                        reportePagoDocenteModal = new BandejaSolicitudReportePagoDocente();
                        reportePagoDocenteModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.ReprogramacionClases:
                if (reprogramacionTarifaModal) {
                    reprogramacionTarifaModal.cargarData(solicitud, esEdicion);
                } else {
                    new UtilService().obtenerHtml("WkBandejaSolicitud/_ReprogramacionClases", (html) => {
                        divContent.after(html);
                        reprogramacionTarifaModal = new BandejaSolicitudReprogramacion();
                        reprogramacionTarifaModal.configurarVentana(solicitud, esEdicion, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;

        }
    }
    function cargaInicial() {
        new WorkflowService().listar({}, (response) => {
            worklow.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                worklow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
            });
        });
        new EstadoSolicitudService().listar({}, (response) => {
            estado.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                estado.append(`<option value="${x.idEstadoSolicitud}">${x.nombre}</option>`);
            });
        });
        new ParametroWorkflowService().listar({ dominio: Constantes.Parametros.Dominio.Organizacion }, (response) => {
            organizacion.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                organizacion.append(`<option value="${x.codigo}">${x.valor}</option>`);
            });
        });
        buscar();
    }
    cargaInicial();
});