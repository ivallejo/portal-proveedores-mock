$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    const $form = $('#frmAccion');
    const $btnRegresar = $form.find('a[name="btn-regresar"]').first();
    const $hdfIdSesion = $form.find('input[name="idsesion"]').first();
    const _idSesion = $hdfIdSesion.val();
    if (isNaN(parseInt(_idSesion)) || parseInt(_idSesion) < 1) {
        MessageBox.alert('Sesión no válida', 'La sesion enviada es inválida', 'error', true, false, function () {
            $btnRegresar[0].click();
        });
        return false;
    }

    const $btnSubir = $form.find('button[name="btn-subir"]').first();
    const $btnEnviar = $form.find('button[name="btn-enviar"]').first();
    const $hdfFechaSesion = $form.find('input[name="fechasesion"]').first();
    const $txtTema = $form.find('input[name="tema"]').first();
    const $txtMotivoJustificacion = $form.find('textarea[name="motivo-justificacion"]').first();
    const $selIdentificador = $form.find('select[name="identificador"]').first();
    const $txtHoraInicio = $form.find('input[name="hora-inicio"]').first();
    const $txtHoraFin = $form.find('input[name="hora-fin"]').first();
    const $txtHoraEntrada = $form.find('input[name="hora-entrada"]').first();
    const $txtHoraSalida = $form.find('input[name="hora-salida"]').first();
    const $fileDocumentos = $form.find('input[name="documentos"]').first();
    
    const _fechaSesion = $hdfFechaSesion.val();
    const _dateFormat = 'DD/MM/YYYY HH:mm:ss';

    let _horaEntradaMarcacionValue = $txtHoraEntrada.val();
    let _horaSalidaMarcacionValue = $txtHoraSalida.val();

    $selIdentificador.prepend(Constantes.Select.OpcionSeleccione).val('');

    $selIdentificador.on('change', () => {
        $txtHoraEntrada.removeAttr('required');
        $txtHoraSalida.removeAttr('required');
        $txtHoraEntrada.val(_horaEntradaMarcacionValue);
        $txtHoraSalida.val(_horaSalidaMarcacionValue);
        const identificador = $selIdentificador.val();
        if (identificador == Constantes.JustificacionAsistenciaSolicitudIdentificador.Entrada) {
            $txtHoraEntrada.attr('required', true);
            $txtHoraEntrada.val($txtHoraInicio.val());
        } else if (identificador == Constantes.JustificacionAsistenciaSolicitudIdentificador.Salida) {
            $txtHoraSalida.attr('required', true);
            $txtHoraSalida.val($txtHoraFin.val());
        } else if (identificador == Constantes.JustificacionAsistenciaSolicitudIdentificador.EntradaYSalida) {
            $txtHoraEntrada.attr('required', true);
            $txtHoraSalida.attr('required', true);
            $txtHoraEntrada.val($txtHoraInicio.val());
            $txtHoraSalida.val($txtHoraFin.val());
        }
    });

    $fileDocumentos.on('change', () => {
        var uploadFile = $fileDocumentos[0].files[0];
        var label = 'Agrega documentos';
        if (uploadFile !== undefined) {
            label = uploadFile.name;
        }
        $form.find('[name="documentos-label"]').text(label);
    });

    $btnSubir.on('click', () => {
        $fileDocumentos.click();
    });

    $btnEnviar.on('click', (e) => {
        e.preventDefault();
        if ($form.valid()) {
            const txtHoraEntradaValue = $txtHoraEntrada.val();
            const txtHoraSalidaValue = $txtHoraSalida.val();
            const fechaHoraEntrada = `${_fechaSesion} ${txtHoraEntradaValue}`;
            const fechaHoraSalida = `${_fechaSesion} ${txtHoraSalidaValue}`;
            if (txtHoraEntradaValue && !moment(fechaHoraEntrada, _dateFormat, true).isValid()) {
                MessageBox.error('La hora de entrada no es válida');
                return false;
            }
            if (txtHoraSalidaValue && !moment(fechaHoraSalida, _dateFormat, true).isValid()) {
                MessageBox.error('La hora de salida no es válida');
                return false;
            }
            if (txtHoraEntradaValue && txtHoraSalidaValue
                && (moment(fechaHoraEntrada, _dateFormat).isAfter(moment(fechaHoraSalida, _dateFormat)))) {
                MessageBox.error('La hora de entrada no puede ser mayor a la hora de salida');
                return false;
            }

            var uploadFile = $fileDocumentos[0].files[0];
            if (uploadFile === undefined) {
                MessageBox.error('Por favor adjunte un documento para la justificación');
                return false;
            }

            let request = new Object();
            request.idSesion = _idSesion;
            request.tema = $txtTema.val();
            request.motivoJustificacion = $txtMotivoJustificacion.val();
            request.identificador = $selIdentificador.val();
            request.horaEntrada = txtHoraEntradaValue;
            request.horaSalida = txtHoraSalidaValue;
            request.fileInput = uploadFile;
            console.log('request:', request);
            new SolicitudService().agregar(request, (response) => {
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

