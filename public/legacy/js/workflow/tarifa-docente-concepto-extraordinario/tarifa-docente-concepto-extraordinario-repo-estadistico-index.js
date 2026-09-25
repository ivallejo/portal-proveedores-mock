$(document).ready(function () {
    //const periodoAcademicoService = new PeriodoAcademicoService();
    let selectorOrganizacion = "#organizacion";
    let selectorPeriodo = "#periodo";
    let selectorEstado = "#estado";
    let checkFinal = "#check-final";
    let btnBuscar = $("#btnBuscar");
    //let btnExportar = $("#btnExportar");
    // $(selectorOrganizacion).prepend(Constantes.Select.OpcionTodos).val('');
    //$(selectorPeriodo).prepend(Constantes.Select.OpcionTodos).val('');

    btnBuscar.on("click", (e) => {
        const request = {
            organizacion: $(selectorOrganizacion).val(),
            idPeriodoAcademico: $(selectorPeriodo).val(),
            estadoSolicitud: $(selectorEstado).val(),
            soloFinales: $(checkFinal).is(":checked")
        };
        new TarifaDocenteConceptoExtraordinarioService().listarReporteEstadistico(request, (response) => {
            loadChartBar(response.listaBarra);
            loadChartPie(response.listaPie);
                //MessageBox.alert('Operación correcta', 'Registros procesados correctamente', 'success', true, false, function () {
                //});
        }, true, true);
    });

    //$(selectorOrganizacion).on("change", () => {
    //    if ($(selectorOrganizacion).val().trim() != '') {
    //        $(selectorPeriodo).find('option').not(':first').remove();
    //        const organizacion = $(selectorOrganizacion).val();
    //        if (organizacion == null || organizacion.trim() === '') return false;
    //        listarPeriodosPorOrganizacion();
    //    }
    //    else {
    //        $(selectorPeriodo).empty().append(Constantes.Select.OpcionTodos).val('');
    //    }
    //});
    //function listarPeriodosPorOrganizacion() {
    //    let filtroOrganizacion = $(selectorOrganizacion).val();
    //    periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
    //        for (let x of response) {
    //            $(selectorPeriodo).append($("<option></option>").attr("value", x.key).text(x.value));
    //        }
    //    });
    //}

    function loadChartBar(data) {
        var settings = {
            //title: "Diagrama de Tarifas por Docente",
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
                //minValue: 0,
                //maxValue: 200,
                //gridLines: { visible: true },
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
                        //columnsGapPercent: 10,
                        //seriesGapPercent: 0,
                        valueAxis:
                        {
                            //unitInterval: 50,
                            minValue: 0,
                            //maxValue: 100,
                            displayValueAxis: true,
                            visible: true,
                            description: 'Cantidad de Docentes',
                            //axisSize: 'auto',
                            //tickMarksColor: '#888888'
                        },
                        series: [
                            { dataField: 'total', displayText: 'N° Docentes' },
                            //{ dataField: 'tarifa', displayText: 'Monto Tarifa' }
                        ]
                    }
                ]
        };

        $('#jqxChart').jqxChart(settings);
    }

    function loadChartPie(data) {
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
                return '<div style="text-align:left"><b>Monto Tarifa:</b> S/. ' + datasource.localdata[itemIndex].tarifa + '<br /><b>Porc.:</b> ' + parseFloat(value).toFixed(2)  + '%</div>';
            }
        };
        var settings = {
            //title: "Porcentaje por tarifas por montos",
            title: "",
            description: "",
            enableAnimations: true,
            showLegend: true,
            showBorderLine: true,
            //legendLayout: { flow: 'horizontal' },
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
                                    formatSettings: { sufix: '%', decimalPlaces: 2 },
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