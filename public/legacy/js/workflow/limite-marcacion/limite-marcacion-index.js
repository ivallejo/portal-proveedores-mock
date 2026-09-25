$(document).ready(function () {
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    const periodoAcademicoService = new PeriodoAcademicoService();
    const limiteMarcacionService = new LimiteMarcacionService();

    const $sel_organizacion = $('#sel-organizacion');
    const $sel_periodo = $('#sel-periodo');
    const $btn_copiar = $('#btn-copiar');
    const $btn_registrar = $('#btn-registrar');
    const $input_minantesentrada = $('#input-minantesentrada');
    const $input_mindespuesentrada = $('#input-mindespuesentrada');
    const $input_minantessalida = $('#input-minantessalida');
    const $input_mindespuessalida = $('#input-mindespuessalida');
    const $input_factorturnomanana = $('#input-factorturnomanana');
    const $input_factorturnotarde = $('#input-factorturnotarde');
    const $input_factorturnonoche = $('#input-factorturnonoche');

    $sel_organizacion.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_periodo.prepend(Constantes.Select.OpcionSeleccione).val('');

    $sel_organizacion.on('change', function () {
        const organizacionValue = $(this).val();
        $sel_periodo.find('option').not(':first').remove();
        gestionarFactores(organizacionValue);
        if (organizacionValue == null || organizacionValue.trim() === '') return false;
        periodoAcademicoService.listarPorOrganizacion(organizacionValue, (response) => {
            for (let x of response) {
                $sel_periodo.append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    });

    $sel_periodo.on('change', function () {

    });

    $btn_copiar.on('click', function (e) {
        e.preventDefault();
        const idPeriodoAcademico = $sel_periodo.val();
        if (isNaN(parseInt(idPeriodoAcademico))) {
            MessageBox.error('Seleccione un periodo');
            return false;
        }
        limiteMarcacionService.obtenerPeriodoAnterior(idPeriodoAcademico, (response) => {
            console.log('response:', response);
            if (!response) {
                MessageBox.error('No se encontró información del periodo anterior');
                return false;
            }
            $input_minantesentrada.val(response.minAntesEntrada);
            $input_mindespuesentrada.val(response.minDespuesEntrada);
            $input_minantessalida.val(response.minAntesSalida);
            $input_mindespuessalida.val(response.minDespuesSalida);
            $input_factorturnomanana.val(response.factorTurnoManana);
            $input_factorturnotarde.val(response.factorTurnoTarde);
            $input_factorturnonoche.val(response.factorTurnoNoche);
        });
    });

    $btn_registrar.on('click', function (e) {
        e.preventDefault();
        const request = {
            organizacion: $sel_organizacion.val(),
            idPeriodoAcademico: $sel_periodo.val(),
            minAntesEntrada: $input_minantesentrada.val(),
            minDespuesEntrada: $input_mindespuesentrada.val(),
            minAntesSalida: $input_minantessalida.val(),
            minDespuesSalida: $input_mindespuessalida.val(),
            factorTurnoManana: $input_factorturnomanana.val(),
            factorTurnoTarde: $input_factorturnotarde.val(),
            factorTurnoNoche: $input_factorturnonoche.val()
        };

        let validaciones = [];
        if (!request.organizacion || request.organizacion == '') validaciones.push('Seleccione una organización');
        if (!request.idPeriodoAcademico || request.idPeriodoAcademico == '') validaciones.push('Seleccione un periodo');
        if (isNaN(parseInt(request.minAntesEntrada))) validaciones.push('Ingrese los minutos antes de la entrada');
        if (isNaN(parseInt(request.minDespuesEntrada))) validaciones.push('Ingrese los minutos después de la entrada');
        if (isNaN(parseInt(request.minAntesSalida))) validaciones.push('Ingrese los minutos antes de la salida');
        if (isNaN(parseInt(request.minDespuesSalida))) validaciones.push('Ingrese los minutos después de la salida');
        if (isNaN(parseInt(request.factorTurnoManana))) validaciones.push('Ingrese el factor');

        var attr_required_factor_turno_tarde = $input_factorturnotarde.attr('required');
        if (typeof attr_required_factor_turno_tarde !== 'undefined' && attr_required_factor_turno_tarde !== false) {
            if (isNaN(parseInt(request.factorTurnoTarde))) validaciones.push('Ingrese el factor turno tarde');
        }

        var attr_required_factor_turno_noche = $input_factorturnonoche.attr('required');
        if (typeof attr_required_factor_turno_noche !== 'undefined' && attr_required_factor_turno_noche !== false) {
            if (isNaN(parseInt(request.factorTurnoNoche))) validaciones.push('Ingrese el factor turno noche');
        }

        if (validaciones.length > 0) {
            MessageBox.error(validaciones[0]);
            return false;
        }

        limiteMarcacionService.agregar(request, (response) => {
            MessageBox.alert('Operación correcta', 'Solicitud generada correctamente', 'success', true, false, function () {
                window.location.reload();
            });
        }, true, true);
    });

    function gestionarFactores(organizacionVal) {
        if (organizacionVal == 'ESC') {
            $("#divRowFactorNoche, #divFactorTarde").addClass("d-none");
            $("#input-factorturnotarde, #input-factorturnonoche").prop('required', false);
            $input_factorturnotarde.val("");
            $input_factorturnonoche.val("");
            $input_factorturnomanana.closest("div").parent().removeClass("col-md-6").addClass("col-md-12");
            $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor");
        }
        else {
            $("#divRowFactorNoche, #divFactorTarde").removeClass("d-none");
            $("#input-factorturnotarde, #input-factorturnonoche").prop('required', true);
            $input_factorturnomanana.closest("div").parent().removeClass("col-md-12").addClass("col-md-6");
            $('label[for="' + $input_factorturnomanana.attr('id') + '"]').text("Factor de turno mañana");
        }
    }
});