$(document).ready(function () {
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    const periodoAcademicoService = new PeriodoAcademicoService();
    const limiteMarcacionService = new LimiteMarcacionService();

    let _items = [];
    let _items_modal = [];
    const $modal_detalle = new bootstrap.Offcanvas($("#modal-detalle"));
    const $sel_organizacion = $('#sel-organizacion');
    const $sel_periodo = $('#sel-periodo');
    const $sel_estado = $('#sel-estado');
    const $checkFinal = $("#check-final");
    const $tbl_items = $('#tbl-items');
    const $btn_buscar = $('#btn-buscar');
    const $btn_exportar = $('#btn-exportar');

    const $input_minantesentrada = $('#input-minantesentrada');
    const $input_mindespuesentrada = $('#input-mindespuesentrada');
    const $input_minantessalida = $('#input-minantessalida');
    const $input_mindespuessalida = $('#input-mindespuessalida');
    const $input_factorturnomanana = $('#input-factorturnomanana');
    const $input_factorturnotarde = $('#input-factorturnotarde');
    const $input_factorturnonoche = $('#input-factorturnonoche');
    const $input_nombreorganizacion = $('#input-nombreorganizacion');
    const $input_nombreperiodo = $('#input-nombreperiodo');

    const $tbl_items_modal = $('#tbl-items-modal');
    const $input_organizacion_modal = $('#input-organizacion-modal');
    const $input_periodo_modal = $('#input-periodo-modal');
    const $btn_exportar_modal = $('#btn-exportar-modal');

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

        $btn_exportar.attr("href", URL_BASE + "WkLimiteMarcacion/DescargarExcelReporte?organizacion=" + request.organizacion
            + '&idPeriodoAcademico=' + request.idPeriodoAcademico + '&estadoSolicitud=' + request.estadoSolicitud + "&soloFinales=" + request.soloFinales);

        limiteMarcacionService.listarReporteGeneral(request, (response) => {
            _items = response.lista.map(item => ({
                idSolicitud: item.idSolicitud,
                organizacion: item.periodoAcademico.organizacion,
                periodo: `${item.periodoAcademico ? item.periodoAcademico?.academicYear + '-' + (item.organizacion == 'ESC' ? item.periodoAcademico?.academicSession : item.periodoAcademico?.academicTerm) : ''}`,
                estadoSolicitud: item.estadoSolicitud?.nombre,
                faseWorkflow: item.faseWorkflow?.nombre || '',
                comentarioSolicitud: item.comentarioSolicitud || '',
                motivoRechazo: item.motivoRechazoSolicitud?.nombre || '',
                comentarioAtencion: item.comentarioAtencion || ''
            }));
            _drawTable();
        }, true, true);
    });

    $tbl_items.on("click", ".ver-detalle", (e) => {
        $input_organizacion_modal.val('');
        $input_periodo_modal.val('');
        _items_modal = [];
        const idSolicitud = e.currentTarget.getAttribute('data-id');
        const checkFinales = $checkFinal.is(":checked");
        new SolicitudService().obtenerPendienteAprobarPorIdOnlyView(idSolicitud, (response) => {
            if (response.limiteMarcacion.organizacion == 'ESC') {
                $("#divRowFactorNoche, #divFactorTarde").addClass("d-none");
                $input_factorturnomanana.closest("div").parent().removeClass("col-md-6").addClass("col-md-12");
                $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor");
            }
            else {
                $("#divRowFactorNoche, #divFactorTarde").removeClass("d-none");
                $input_factorturnomanana.closest("div").parent().removeClass("col-md-12").addClass("col-md-6");
                $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor de turno mañana");
            }
            $input_nombreorganizacion.val(response.limiteMarcacion.nombreOrganizacion);
            $input_nombreperiodo.val(`${response.limiteMarcacion.academicYear}-${(response.limiteMarcacion.organizacion == 'ESC' ? response.limiteMarcacion.academicSession : response.limiteMarcacion.academicTerm)}`);
            $input_minantesentrada.val(response.limiteMarcacion.minAntesEntrada);
            $input_mindespuesentrada.val(response.limiteMarcacion.minDespuesEntrada);
            $input_minantessalida.val(response.limiteMarcacion.minAntesSalida);
            $input_mindespuessalida.val(response.limiteMarcacion.minDespuesSalida);
            $input_factorturnomanana.val(response.limiteMarcacion.factorTurnoManana);
            $input_factorturnotarde.val(response.limiteMarcacion.factorTurnoTarde);
            $input_factorturnonoche.val(response.limiteMarcacion.factorTurnoNoche);
            $modal_detalle.show();
        });
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

    _drawTable();
});