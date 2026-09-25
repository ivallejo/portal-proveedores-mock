$(document).ready(function () {
    let divContent = $("#divContent");
    let worklow = $("#FiltroWorkflow");
    let fechas = $("#filtroFecha");
    let masivo = $("#FiltroMasivo");
    let tabla = "#wkAprobacionTable";
    let contentCardsMobile = $("#contentCards-aprobacion");
    let justificacionAsistenciaModal = null;
    let tarifaDocenteModal = null;
    let tarifaDocenteConceptoExtraordinarioModal = null;
    let tarifaCursoModal = null;
    let limiteMarcacionModal = null;
    let excepcionTarifaModal = null;
    let reportePagoDocenteModal = null;
    let tipoMasivo = null;
    let _responseItems = [];
    let reprogramacionTarifaModal = null;
    fechas.daterangepicker({
        opens: 'left',
        startDate: moment().add(-7, 'day'),
        maxDate: moment(),
        locale: {
            format: 'DD/MM/YYYY'
        }
    });
    const $aprobacionMasivaModal = $("#aprobacionMasivaModal");
    const modalAprobacionMasiva = new bootstrap.Offcanvas($aprobacionMasivaModal);
    let _esJustificacionDeAsistencia = worklow.val() == Constantes.Workflow.JustificacionAsistencia;

    new MotivoRechazoSolicitudService().listar({}, (response) => {
        let idMotivoRechazoSolicitud = $("#aprobacionMasivaModal #IdMotivoAprobacionMasiva");
        idMotivoRechazoSolicitud.append(Constantes.Select.OpcionSeleccione);
        response.forEach(x => {
            idMotivoRechazoSolicitud.append(`<option value="${x.idMotivoRechazoSolicitud}">${x.nombre}</option>`);
        });
    }, false);

    $("#btnBuscar").on("click", () => {
        buscar();
    });
    $("#btn-aprobar-masivo").on("click", () => {
        aprobarMasivoOnClick();
    });
    $("#btn-rechazar-masivo").on("click", () => {
        rechazarMasivoOnClick();
    });
    $("#btn-procesar-aprobacion-masiva").on("click", () => {
        procesarAprobacionMasivaOnClick();
    });
    $(tabla).on("click", ".aprobar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data, true);
    });
    $(tabla).on("click", ".consultar", (e) => {
        var data = $(tabla).DataTable().row(e.currentTarget.closest("td")).data();
        abrirModalRegistro(data);
    });
    contentCardsMobile.on("click", ".aprobar", (e) => {
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
    function buscar() {
        new SolicitudService().listarPendienteAprobar({
            idWorkflow: worklow.val(),
            fechaDesde: fechas.data('daterangepicker').startDate.format('DD/MM/YYYY'),
            fechaHasta: fechas.data('daterangepicker').endDate.format('DD/MM/YYYY')
        }, (response) => {
            $("#aprobacionContainer").removeClass('d-none');
            if (masivo.val() != '') response.items = masivo.val() == 'SI'
                ? response.items.filter(x => x.comentarioAtencion.includes('[MASIVO]'))
                : response.items.filter(x => !x.comentarioAtencion.includes('[MASIVO]'));
            construirTabla(response);
            if (keyEvaluar) {
                let data = response.items.find(x => x.idSolicitud === parseInt(keyEvaluar));
                if (data) {
                    abrirModalRegistro(data, !data.usuarioEvaluador || data.usuarioEvaluador === response.usuario);
                }
            }
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
                    ${!item.usuarioEvaluador || item.usuarioEvaluador.toLowerCase() === response.usuario.toLowerCase() ? `<button class="btn btn-action-card float-end aprobar" key="${item.idSolicitud}"><i class="fas fa-check"></i></button>` : `<button class="btn btn-action-card float-end consultar me-1" key="${item.idSolicitud}"><i class="fas fa-eye"></i></button>`}
                    <h6 class="fw-bold">${item.workflow.nombre}</h6> 
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
                    <span>Aprobador:</span>
                    <span>${item.nombreEvaluador}</span>
                </div>
                    </div>`;
                    contentCardsMobile.append(card);
                });
            });
        });
    }
    function construirTabla(response) {
        _responseItems = response.items;
        $(tabla).DataTable({
            searching: false,
            paging: true,
            lengthChange: true,
            destroy: true,
            data: response.items,
            language: Util.obtenerLenguajeDataTable(),
            columns: [
                {
                    className: 'td-accion text-center',
                    title: '<input type="checkbox" id="chk-all" class="ctrl-masivo d-none" />',
                    orderable: false,
                    render: (data, type, row) => {
                        if (!row.usuarioEvaluador || row.usuarioEvaluador.toLowerCase() === response.usuario.toLowerCase()) {
                            return '<input type="checkbox" data-id="' + row.idSolicitud + '" class="chk-masivo ctrl-masivo d-none" name="chk-masivo" />';
                        } else {
                            return '';
                        }
                    }
                },
                { data: "idSolicitud", title: "ID" },
                { data: "workflow.nombre", title: "Nombre del flujo" },
                { data: "nombreSolicitante", title: "Solicitante", class: "text-capitalize", render: (data, type, row) => row.nombreSolicitante.toLowerCase() },
                { data: "estadoSolicitud.nombre", title: "Estado" },
                { title: "Fecha Solicitud", render: (data, type, row) => Util.formatearFechaHoraAsString(row.fechaCreacion) },
                {
                    data: "nombreEvaluador", title: "Aprobador", render: (data, type, row) => `${row.nombreEvaluador}`
                },
                {
                    data: "comentarioAtencion", title: "Masivo", render: (data, type, row) => data.includes('[MASIVO]') ? 'SI' : 'NO'
                },
                {
                    data: "comentarioAtencion", title: "Comentario atención", render: (data, type, row) => data.replace('[MASIVO]', '')
                },
                {
                    className: 'td-accion text-center',
                    title: 'Acciones',
                    orderable: false,
                    render: (data, type, row) => {
                        if (!row.usuarioEvaluador || row.usuarioEvaluador.toLowerCase() === response.usuario.toLowerCase())
                            return '<button type="button" class="btn btn-primary aprobar me-2 btn-action-table">Aprobar</button>';
                        else
                            return '<i class="fas fa-eye consultar mt-1" title="Ver"></i>';
                    }
                },
            ],
            order: [],
            drawCallback: () => {
            },
            rowCallback: function (row, data, index) {
                if (_esJustificacionDeAsistencia) {
                    const $chk = $('td:eq(0)', row).find('.chk-masivo');
                    if ($chk.length) {
                        $chk.removeClass("d-none");
                        const idsChecked = getIdsCheckedMasivo();
                        $chk.prop('checked', idsChecked.includes(parseInt($chk.attr('data-id'))));
                    }
                }
            }
        });
        _esJustificacionDeAsistencia = $('#FiltroWorkflow').val() == Constantes.Workflow.JustificacionAsistencia;
        habilitarAprobacionMasiva(_esJustificacionDeAsistencia);
    }
    function abrirModalRegistro(solicitud, esEvaluador = false) {

        switch (solicitud.idWorkflow) {
            case Constantes.Workflow.JustificacionAsistencia:
                if (justificacionAsistenciaModal) {
                    justificacionAsistenciaModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_JustificacionAsistencia", (html) => {
                        divContent.after(html);
                        justificacionAsistenciaModal = new AprobacionSolicitudJustificacionAsistencia();
                        justificacionAsistenciaModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.TarifaDocentes:
                if (tarifaDocenteModal) {
                    tarifaDocenteModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_TarifaDocente", (html) => {
                        divContent.after(html);
                        tarifaDocenteModal = new AprobacionSolicitudTarifaDocente();
                        tarifaDocenteModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.TarifaDeDocenteConceptoExtraordinario:
                if (tarifaDocenteConceptoExtraordinarioModal) {
                    tarifaDocenteConceptoExtraordinarioModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_TarifaDocenteConceptoExtraordinario", (html) => {
                        divContent.after(html);
                        tarifaDocenteConceptoExtraordinarioModal = new AprobacionSolicitudTarifaDocenteConceptoExtraordinario();
                        tarifaDocenteConceptoExtraordinarioModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.TarifaCursos:
                if (tarifaCursoModal) {
                    tarifaCursoModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_TarifaCurso", (html) => {
                        divContent.after(html);
                        tarifaCursoModal = new AprobacionSolicitudTarifaCurso();
                        tarifaCursoModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.LimitesMarcacion:
                if (limiteMarcacionModal) {
                    limiteMarcacionModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_LimiteMarcacion", (html) => {
                        divContent.after(html);
                        limiteMarcacionModal = new AprobacionSolicitudLimiteMarcacion();
                        limiteMarcacionModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.ExcepcionesTarifasDocente:
                if (excepcionTarifaModal) {
                    excepcionTarifaModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_ExcepcionTarifa", (html) => {
                        divContent.after(html);
                        excepcionTarifaModal = new AprobacionSolicitudExcepcionTarifa();
                        excepcionTarifaModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.ReporteDePagoDeDocentes:
                if (reportePagoDocenteModal) {
                    reportePagoDocenteModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_ReportePagoDocente", (html) => {
                        divContent.after(html);
                        reportePagoDocenteModal = new AprobacionSolicitudReportePagoDocente();
                        reportePagoDocenteModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            case Constantes.Workflow.ReprogramacionClases:

                if (reprogramacionTarifaModal) {
                    reprogramacionTarifaModal.cargarData(solicitud, esEvaluador);
                } else {
                    new UtilService().obtenerHtml("WkAprobacionSolicitud/_ReprogramacionClases", (html) => {
                        divContent.after(html);
                        reprogramacionTarifaModal = new AprobacionSolicitudReprogramacionClases();
                        reprogramacionTarifaModal.configurarVentana(solicitud, esEvaluador, (data) => {
                            buscar();
                        });
                    }, true, true);
                }
                break;
            default:
                console.log("Pendiente de implementación", solicitud.idWorkflow);
        }
    }
    function cargaInicial() {
        new WorkflowService().listar({}, (response) => {
            worklow.append(Constantes.Select.OpcionTodos);
            response.forEach(x => {
                worklow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
            });
        });
        masivo.append(Constantes.Select.OpcionTodos);
        masivo.append(`<option value="SI">SI</option>`);
        masivo.append(`<option value="NO">NO</option>`);
        buscar();
    }

    function aprobarMasivoOnClick() {
        const idsChecked = getIdsCheckedMasivo();
        if (!idsChecked || idsChecked.length == 0) {
            MessageBox.error('Seleccione una o más solicitudes');
            return;
        }
        this.tipoMasivo = 'APROBACION';
        $('.container-sel-motivo-rechazo').removeClass('d-none').addClass('d-none');
        $aprobacionMasivaModal.find('.modal-title').text('Aprobación masiva');

        var todosSonMasivos = true;
        var todosTienenElMismoMotivo = true;
        var motivoTest = '';
        var existenSolicitudesAprobadasMasivo = false;

        for (var i = 0; i < idsChecked.length; i++) {
            var solicitud = _responseItems.filter(x => x.idSolicitud == idsChecked[i])[0];
            var comentarioAtencion = solicitud.comentarioAtencion;
            if (comentarioAtencion.includes('[MASIVO]')) {
                existenSolicitudesAprobadasMasivo = true;
            } else {
                todosSonMasivos = false;
                break;
            }
            if (i == 0) {
                motivoTest = comentarioAtencion;
            } else {
                if (comentarioAtencion != motivoTest) {
                    todosTienenElMismoMotivo = false;
                    break;
                }
            }
        }

        if (todosSonMasivos && todosTienenElMismoMotivo) {
            $aprobacionMasivaModal.find('[name="ComentarioAtencion"]').val(motivoTest.replace('[MASIVO]', ''));
            $aprobacionMasivaModal.find('[name="ComentarioAtencion"]').prop('disabled', true);
        } else {
            if (existenSolicitudesAprobadasMasivo) {
                MessageBox.error('Para continuar, todas las solicitudes seleccionadas deben haber sido aprobadas como masivas en la fase anterior.');
                return;
            }
            $aprobacionMasivaModal.find('[name="ComentarioAtencion"]').prop('disabled', false);
        }

        modalAprobacionMasiva.show();
    }
    function rechazarMasivoOnClick() {
        const idsChecked = getIdsCheckedMasivo();
        if (!idsChecked || idsChecked.length == 0) {
            MessageBox.error('Seleccione una o más solicitudes');
            return;
        }
        this.tipoMasivo = 'RECHAZO';
        $aprobacionMasivaModal.find('[name="ComentarioAtencion"]').prop('disabled', false);
        $aprobacionMasivaModal.find('[name="ComentarioAtencion"]').val('');
        $('.container-sel-motivo-rechazo').removeClass('d-none');
        $aprobacionMasivaModal.find('.modal-title').text('Rechazo masivo');
        modalAprobacionMasiva.show();
    }
    function procesarAprobacionMasivaOnClick() {
        const esRechazo = this.tipoMasivo == 'RECHAZO';
        const $selMotivoRechazo = $('#IdMotivoAprobacionMasiva');
        if (esRechazo && !$selMotivoRechazo.val()) {
            MessageBox.error('Seleccione un motivo de rechazo');
            return;
        }
        const comentario = $aprobacionMasivaModal.find('[name="ComentarioAtencion"]').val();
        if (!comentario) {
            MessageBox.error('Ingrese un motivo');
            return;
        }
        const idMotivoRechazo = esRechazo ? parseInt($selMotivoRechazo.val()) : 0;

        const ids = getIdsCheckedMasivo();

        const request = {
            ids: ids,
            tipo: this.tipoMasivo,
            comentario: `[MASIVO] ${comentario}`,
            idMotivoRechazoSolicitud: idMotivoRechazo
        };

        new SolicitudService().registrarEvaluacionMasivo(request, (response) => {
            $('#div-masivo-result-content').html(response.map((item) => {
                return '<p><strong>Solicitud ' + item.item1 + '</strong>: ' + (item.item2 ? 'Se procesó correctamente' : item.item3) + '</p>';
            }));
            $('#div-masivo-result').removeClass('d-none');
            modalAprobacionMasiva.hide();
            MessageBox.info('Se procesó correctamente');
            buscar();
        });
    }
    function habilitarAprobacionMasiva(habilitar) {
        if (habilitar) {
            $('.ctrl-masivo').removeClass('d-none');
        } else {
            $('.ctrl-masivo').removeClass('d-none').addClass('d-none');
        }
    }
    function getIdsCheckedMasivo() {
        return $(tabla).DataTable()
            .rows(function (idx, data, node) {
                return $(node).find('input[type="checkbox"][name="chk-masivo"]').prop('checked');
            })
            .data()
            .toArray()
            .map((item) => {
                return item.idSolicitud
            });
    }

    cargaInicial();
});

$(document).on('change', '#chk-all', function () {
    var checked = $(this).prop('checked');
    $('#wkAprobacionTable').DataTable().cells(null,).every(function () {
        var cell = this.node();
        $(cell).find('input[type="checkbox"][name="chk-masivo"]').prop('checked', checked);
    });
});

