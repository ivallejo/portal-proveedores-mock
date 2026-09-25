$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    const fechaActual = new Date();
    const $form = $('#frmAccion');
    const $btnRegresar = $form.find('a[name="btn-regresar"]').first();
    const $hdfIdSesion = $form.find('input[name="idsesion"]').first();
    const $hdfFechaSesion = $form.find('input[name="fechasesion"]').first();
    const $selIdentificador = $('select[name="identificador"]');
    const _idSesion = $hdfIdSesion.val();
    if (isNaN(parseInt(_idSesion)) || parseInt(_idSesion) < 1) {
        MessageBox.alert('Sesión no válida', 'La sesion enviada es inválida', 'error', true, false, function () {
            $btnRegresar[0].click();
        });
        return false;
    }

    const $btnEnviar = $form.find('button[name="btn-enviar"]').first();


    $selIdentificador.prepend(Constantes.Select.OpcionSeleccione).val('');

    $selIdentificador.on('change', () => {
       
        const identificador = $selIdentificador.val();

        const inputFechaRecuperacion = document.querySelector('input[name="fecha-recuperacion"]');

        inputFechaRecuperacion.min = convertirADateInputFormat($hdfFechaSesion.val());

        inputFechaRecuperacion.removeAttribute('max');

        if (identificador == Constantes.ReprogramacionSolicitudIdentificador.RecuperacionClases) {

            // Establecer el mínimo y máximo
            inputFechaRecuperacion.min = convertirADateInputFormat($hdfFechaSesion.val());
            inputFechaRecuperacion.max = sumarDiasAFecha($hdfFechaSesion.val(), 7);

        }
    });


    $btnEnviar.on('click', (e) => {
        e.preventDefault();
        if ($form.valid()) {


            let txtIdSesionValue = $('input[name="idsesion"]').val();
            let txtFechaSesionValue = $('input[name="fechasesion"]').val();
            let txtCodProgramaEstudioValue = $('input[name="cod-programa-estudio"]').val();
            let txtIdentificadorValue = $('select[name="identificador"]').val();
            let txtJefeAcademicoValue = $('input[name="jefe-academico"]').val();
            let txtTemaValue = $('input[name="tema"]').val();
            let txtFechaRecuperacionValue = $('input[name="fecha-recuperacion"]').val();
            let txtHoraInicioValue = $('input[name="hora-inicio"]').val();
            let txtHoraFinValue = $('input[name="hora-fin"]').val();
            let txtMotivoValue = $('textarea[name="motivo-reprogramacion"]').val();
            let txtCantidadEstudiantesValue = $('input[name="cantidad-estudiantes"]').val();


            let request = new Object();
            request.idSesion = txtIdSesionValue;
            request.fechaSesion = txtFechaSesionValue;
            request.codPrograma = txtCodProgramaEstudioValue
            request.identificador = txtIdentificadorValue
            request.jefeAcademico = txtJefeAcademicoValue
            request.tema = txtTemaValue
            request.fechaRecuperacion = txtFechaRecuperacionValue
            request.horaInicio = txtHoraInicioValue
            request.horaFin = txtHoraFinValue
            request.motivo = txtMotivoValue
            request.cantidadEstudiantes = txtCantidadEstudiantesValue


            new SolicitudService().agregarReprogramacion(request, (response) => {
                MessageBox.alert('Operación correcta', 'Solicitud generada correctamente', 'success', true, false, function () {
                    let href = $btnRegresar.attr('href') + '?s=' + window.btoa(_idSesion);
                    $btnRegresar.attr('href', href);
                    $btnRegresar[0].click();
                });
            }, true, true);

        } else {
            $form.addClass("was-validated");
        }
    });
});


function convertirADateInputFormat(fechaDDMMYYYY) {
    const [dia, mes, anio] = fechaDDMMYYYY.split('/');
    return `${anio}-${mes}-${dia}`; // formato que acepta el input
}

function sumarDiasAFecha(fechaDDMMYYYY, diasASumar) {
    const [dia, mes, anio] = fechaDDMMYYYY.split('/');
    const fecha = new Date(`${anio}-${mes}-${dia}`);
    fecha.setDate(fecha.getDate() + diasASumar);
    const diaF = String(fecha.getDate()).padStart(2, '0');
    const mesF = String(fecha.getMonth() + 1).padStart(2, '0');
    const anioF = fecha.getFullYear();
    return `${anioF}-${mesF}-${diaF}`;
}