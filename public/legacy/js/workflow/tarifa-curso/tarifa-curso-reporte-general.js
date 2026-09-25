$(document).ready(function () {
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    const periodoAcademicoService = new PeriodoAcademicoService();
    const tarifaCursoService = new TarifaCursoService();

    let _items = [];
    let _items_modal = [];
    const $modal_detalle = new bootstrap.Offcanvas($("#modal-detalle"));
    const $sel_organizacion = $('#sel-organizacion');
    const $sel_periodo = $('#sel-periodo');
    const $sel_estado = $('#sel-estado');
    const $checkFinal = $('#check-final');
    const $tbl_items = $('#tbl-items');
    const $btn_buscar = $('#btn-buscar');
    const btnExportar = $("#btnExportar");
    const $tbl_items_modal = $('#tbl-items-modal');
    const $input_organizacion_modal = $('#input-organizacion-modal');
    const $input_periodo_modal = $('#input-periodo-modal');
    //const $btn_exportar_modal = $('#btn-exportar-modal');
    $("#tabCursoReporte").tabs();
    $sel_organizacion.prepend(Constantes.Select.OpcionTodos).val('');
    $sel_periodo.prepend(Constantes.Select.OpcionTodos).val('');
    $sel_estado.prepend(Constantes.Select.OpcionTodos).val('');

    $sel_organizacion.on('change', function () {
        _items = [];
        _drawTable();
        const organizacionValue = $(this).val();
        $sel_periodo.find('option').not(':first').remove();
        if (organizacionValue == null || organizacionValue.trim() === '') return false;
        periodoAcademicoService.listarPorOrganizacion(organizacionValue, (response) => {
            for (let x of response) {
                $sel_periodo.append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    });

    $sel_periodo.on('change', function () {
        _items = [];
        _drawTable();
    });

    $btn_buscar.on("click", (e) => {
        const request = {
            organizacion: $sel_organizacion.val(),
            idPeriodoAcademico: $sel_periodo.val(),
            estadoSolicitud: $sel_estado.val(),
            soloFinales: $checkFinal.is(":checked")
        };

        tarifaCursoService.listarReporteGeneral(request, (response) => {
            _items = response.lista.map(item => ({
                idSolicitud: item.idSolicitud,
                organizacion: item.periodoAcademico.organizacion,
                periodo: `${item.periodoAcademico ? item.periodoAcademico?.academicYear + '-' + (item.organizacion == 'ESC' ? item.periodoAcademico?.academicSession : item.periodoAcademico?.academicTerm) : ''}`,
                estadoSolicitud: item.estadoSolicitud?.nombre,
                faseWorkflow: item.faseWorkflow?.nombre || '',
                comentarioSolicitud: item.comentarioSolicitud || '',
                motivoRechazo: item.motivoRechazoSolicitud?.nombre || '',
                comentarioAtencion: item.comentarioAtencion || '',
                totalTarifa: item.correoSolicitante,
            }));
            _drawTable();
        }, true, true);
    });

    $tbl_items.on("click", ".ver-detalle", (e) => {
        $input_organizacion_modal.val('');
        $input_periodo_modal.val('');
        _items_modal = [];
        let data = $tbl_items.DataTable().rows().data().toArray();
        const idSolicitud = e.currentTarget.getAttribute('data-id');
        const checkFinales = $checkFinal.is(":checked");
        tarifaCursoService.listarSolicitudesTarifaPorSolicitud(idSolicitud, checkFinales, (response) => {
            if (response.length > 0) {
                let item = data.find(x => x.idSolicitud == idSolicitud);
                $input_organizacion_modal.val(item.organizacion);
                $input_periodo_modal.val(item.periodo);
                _items_modal = response;
                //$btn_exportar_modal.attr("href", URL_BASE + "WkAprobacionSolicitud/DescargarExcelPendienteAprobarPorId?key=" + idSolicitud);
            }
            _drawTableDetalle();
            $modal_detalle.show();
        });
    });

    btnExportar.on("click", (e) => {
        if ($tbl_items.DataTable().rows().data().count() == 0) {
            e.preventDefault();
            return;
        }
        const request = {
            organizacion: $sel_organizacion.val(),
            idPeriodoAcademico: $sel_periodo.val(),
            estadoSolicitud: $sel_estado.val(),
            soloFinales: $checkFinal.is(":checked")
        };
        var anchor = document.createElement('a');
        anchor.href = URL_BASE + "WkTarifaCurso/DescargarExcelRepoGeneral?organizacion=" + request.organizacion + "&idPeriodoAcademico=" + request.idPeriodoAcademico + "&estadoSolicitud=" + request.estadoSolicitud + "&soloFinales=" + request.soloFinales;
        anchor.target = '_blank';
        anchor.click();
    });

    $checkFinal.on("change", () => {
        if ($checkFinal.is(":checked"))
            $sel_estado.prop("disabled", true);
        else
            $sel_estado.prop("disabled", false);
    });

    function _drawTable() {
        $tbl_items.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            data: _items,
            columns: [
                { data: "idSolicitud", title: "Solicitud" },
                { data: "organizacion", title: "Organizacion", className: "no-mobile" },
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
                { data: "totalTarifa", title: "Total Tarifa", render: (data, type, row) => `S/ ${Util.formatearMoneda(data)}` },
                { data: "estadoSolicitud", title: "Estado Solicitud" },
                { data: "faseWorkflow", title: "Fase" },
                { data: "comentarioSolicitud", title: "Comentario" },
                { data: "motivoRechazo", title: "Rechazo Solicitud" },
                { data: "comentarioAtencion", title: "Comentario Atención" },
                {
                    className: 'td-accion text-center',
                    title: '<span class="no-mobile">Acciones<span>',
                    orderable: false,
                    render: (data, type, row) => {
                        return '<i class="fas fa-eye ver-detalle me-2" data-id="' + row.idSolicitud + '"></i>';
                    }
                },
            ]
        });
    }

    function _drawTableDetalle() {
        $tbl_items_modal.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            data: _items_modal,
            columns: [
                { data: "nombreCurso", title: "Curso", render: (data, type, row) => `${row.idCurso} - ${row.curso}` },
                { data: "tarifa", title: "Tarifa", render: (data, type, row) => `S/ ${Util.formatearMoneda(data)}` },
            ]
        });
    }

    _drawTable();
});