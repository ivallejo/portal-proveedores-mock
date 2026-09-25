$(document).ready(function () {
    let _temp_response = null;
    //$(window).keydown(function (event) {
    //    if (event.keyCode == 13) {
    //        event.preventDefault();
    //        return false;
    //    }
    //});

    //const periodoAcademicoService = new PeriodoAcademicoService();
    const tarifaCursoService = new TarifaCursoService();

    const $sel_organizacion = $('#sel-organizacion');
    const $sel_periodo = $('#sel-periodo');
    const $sel_estado = $('#sel-estado');
    const checkFinal = $('#check-final');
    const $btn_buscar = $('#btn-buscar');

    //$sel_organizacion.prepend(Constantes.Select.OpcionSeleccione).val('');
    //$sel_periodo.prepend(Constantes.Select.OpcionSeleccione).val('');

    //$sel_organizacion.on('change', function () {
    //    const organizacionValue = $(this).val();
    //    $sel_periodo.find('option').not(':first').remove();
    //    if (organizacionValue == null || organizacionValue.trim() === '') return false;
    //    periodoAcademicoService.listarPorOrganizacion(organizacionValue, (response) => {
    //        for (let x of response) {
    //            $sel_periodo.append($("<option></option>").attr("value", x.key).text(x.value));
    //        }
    //    });
    //});

    $btn_buscar.on("click", (e) => {
        const request = {
            organizacion: $sel_organizacion.val(),
            idPeriodoAcademico: $sel_periodo.val(),
            estadoSolicitud: $sel_estado.val(),
            soloFinales: checkFinal.is(":checked")
        };
        tarifaCursoService.listarReporteEstadistico(request, (response) => {
            _temp_response = response;
            if ($('#tabReporteEstadistico').closest('li').first().hasClass('ui-state-active')) {
                loadChartBar(_temp_response.listaBarra);
                loadChartPie(_temp_response.listaPie);
            }
            //loadChartBar(response.listaBarra);
            //loadChartPie(response.listaPie);
        }, true, true);
    });

    $('#tabReporteEstadistico').on('click', function () {
        if (_temp_response) {
            loadChartBar(_temp_response.listaBarra);
            loadChartPie(_temp_response.listaPie);
        }
    });

    function loadChartBar(data) {
        var settings = {
            //title: "Diagrama de Tarifas por Cursos",
            title: " ",
            description: "",
            enableAnimations: true,
            showLegend: true,
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 90, top: 0, right: 0, bottom: 10 },
            source: data,
            xAxis:
            {
                dataField: 'tarifa',
                displayText: 'Monto Tarifa', toolTipFormatSettings: { prefix: 'S/. ' },
                labels: {
                    angle: 0,
                    formatFunction: function (value) {
                        return value.toString();
                    }
                },
                tickMarks: {
                    visible: true,
                    interval: 1
                },
                gridLines: {
                    visible: true,
                    interval: 3
                },
                //formatSettings: { prefix: 'S/. ' },
                title: { text: 'Monto Tarifa (S/.)<br>' },
                //unitInterval: 5,
                valuesOnTicks: false,
                //unitInterval: 100,
                labels: { horizontalAlignment: 'right' }
            },
            colorScheme: 'scheme01', columnSeriesOverlap: false,
            seriesGroups:
                [
                    {
                        type: 'column',
                        //columnsGapPercent: 50,
                        //seriesGapPercent: 0,
                        valueAxis:
                        {
                            //unitInterval: 10,
                            minValue: 0,
                            //maxValue: 100,
                            displayValueAxis: true,
                            description: 'Cantidad de Cursos',
                            //axisSize: 'auto',
                            //tickMarksColor: '#888888'
                        },
                        series: [
                            { dataField: 'total', displayText: 'N° Cursos' }
                        ]
                    }
                ]
        };

        $('#jqxChart').jqxChart(settings);
    }

    function loadChartPie(data) {
        console.log(data);
        var source =
        {
            datatype: "array",
            datafields: [
                { name: 'tarifa' },
                { name: 'total' }
            ],
            localdata: data
        };
        var dataAdapter = new $.jqx.dataAdapter(source, { async: false, autoBind: true, loadError: function (xhr, status, error) { alert('Error loading "' + source.url + '" : ' + error); } });
        var toolTipFormat = function (datasource) {
            return function (value, itemIndex, serieGroup, group, categoryValue, categoryAxis) {
                return '<div style="text-align:left"><b>Monto Tarifa:</b> S/. ' + datasource.localdata[itemIndex].tarifa + '<br /><b>Porc.:</b> ' + parseFloat(value).toFixed(2) + '%</div>';
            }
        };
        var settings = {
            //title: "Porcentaje por tarifas por montos",
            title: "",
            description: "",
            enableAnimations: true,
            showLegend: true,
            showBorderLine: true,
            legendPosition: { left: 520, top: 140, width: 100, height: 100 },
            padding: { left: 5, top: 5, right: 5, bottom: 5 },
            titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
            source: dataAdapter,
            colorScheme: 'scheme02',
            seriesGroups:
                [
                    {
                        type: 'pie',
                        //showLabels: true,
                        series:
                            [
                                {
                                    dataField: 'total',
                                    displayText: 'tarifa',
                                    labelRadius: 100,
                                    initialAngle: 15,
                                    radius: 100,
                                    centerOffset: 0,
                                    formatSettings: { sufix: '%', decimalPlaces: 1 },
                                    legendFormatFunction: function (value, index) {
                                        return "S/. " + value;
                                    }
                                }
                            ],
                        toolTipFormatFunction: toolTipFormat(source)
                    }
                ]
        };
        $('#chartContainer').jqxChart(settings);
    }
});