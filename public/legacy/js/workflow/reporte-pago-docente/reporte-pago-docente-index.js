$(document).ready(function () {
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    const $sel_organizacion = $('#sel-organizacion');
    const $sel_tipotarifa = $('#sel-tipotarifa');
    const $input_rangofechas = $('#input-rangofechas');
    const $btn_registrar = $('#btn-registrar');

    $sel_organizacion.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_tipotarifa.prepend(Constantes.Select.OpcionSeleccione).val('');

    $input_rangofechas.daterangepicker({
        opens: 'left',
        startDate: moment().add(-7, 'day'),
        maxDate: moment(),
        locale: {
            format: 'DD/MM/YYYY'
        }
    });

    $sel_organizacion.on('change', (e) => {
        const organizacionValue = $sel_organizacion.val();
        if (organizacionValue == Constantes.Organizacion.Instituto || organizacionValue == Constantes.Organizacion.Escuela) {
            $sel_tipotarifa.val(Constantes.TipoTarifa.PorDocente);
        } else if (organizacionValue == Constantes.Organizacion.GlobalLearning) {
            $sel_tipotarifa.val(Constantes.TipoTarifa.PorCurso);
        } else {
            $sel_tipotarifa.val('');
        }
    });

    $btn_registrar.on("click", (e) => {
        const organizacionValue = $sel_organizacion.val();
        const rangoFechasValue = $input_rangofechas.val();
        const tipoTarifaValue = $sel_tipotarifa.val();

        if (organizacionValue == null || organizacionValue === '') {
            MessageBox.error('Debe seleccionar una Organización');
            return false;
        }
        if (rangoFechasValue == null || rangoFechasValue === '') {
            MessageBox.error('Debe seleccionar un Rango de Fechas');
            return false;
        }
        if (tipoTarifaValue == null || tipoTarifaValue === '') {
            MessageBox.error('Debe seleccionar un Tipo de Tarifa');
            return false;
        }

        let row = new Object();
        row.idOrganizacion = organizacionValue;
        row.nombreOrganizacion = $("#sel-organizacion option:selected").text();
        row.rangoFechas = rangoFechasValue;
        row.tipoTarifa = tipoTarifaValue;
        row.fechaInicio = $input_rangofechas.data('daterangepicker').startDate._d.toISOString();
        row.fechaFin = $input_rangofechas.data('daterangepicker').endDate._d.toISOString();
        new ReportePagoDocenteService().agregar(row, (response) => {
            MessageBox.info('Registros guardado correctamente');
        }, true, false);
    });
});