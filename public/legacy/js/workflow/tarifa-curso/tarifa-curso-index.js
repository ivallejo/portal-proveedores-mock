const _cursosRemote = [];
const _cursosSplitChar = ' - ';

const _cursosTypeahead = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: 'ListarCursosPorPeriodoAcademicoPorQuery?',
        replace: function (url, query) {
            const periodoValue = $("#sel-periodo-individual option:selected").val().trim();
            return url + 'query=' + query.toUpperCase() + '&idPeriodoAcademico=' + periodoValue
        },
        wildcard: '%QUERY',
        filter: _cursosTypeahead => $.map(_cursosTypeahead, option => ({
            value: option.key + _cursosSplitChar + option.value
            //value: option.usuarioAD
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_cursosTypeahead.initialize();

$(document).ready(function () {
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    const periodoAcademicoService = new PeriodoAcademicoService();
    const tarifaCursoService = new TarifaCursoService();

    let _tarifas = [];
    let _idOrganizacion = '';
    let _idPeriodo = '';
    const $div_modal_tarifa = new bootstrap.Offcanvas($("#div-modal-tarifa"));
    const $tbl_tarifas = $('#tbl-tarifas');
    const $div_content_cards = $('#div-content-cards');

    //Individual
    const $sel_organizacion_individual = $('#sel-organizacion-individual');
    const $sel_periodo_individual = $('#sel-periodo-individual');
    const $sel_tipo_sesion_individual = $('#sel-tipo-sesion-individual');
    const $sel_curso_individual = $('#sel-curso-individual');
    const $input_curso_individual = $('#input-curso-individual');
    const $input_tarifa_individual = $('#input-tarifa-individual');
    const $btn_agregar_individual = $('#btn-agregar-individual');

    //Editar
    const $input_idcurso_editar = $('#input-idcurso-editar');
    const $sel_organizacion_editar = $('#sel-organizacion-editar');
    const $sel_periodo_editar = $('#sel-periodo-editar');
    const $sel_tipo_sesion_editar = $('#sel-tipo-sesion-editar');
    const $sel_curso_editar = $('#sel-curso-editar');
    const $input_curso_editar = $('#input-curso-editar');
    const $input_tarifa_editar = $('#input-tarifa-editar');
    const $btn_guardar_editar = $('#btn-guardar-editar');

    //Masivo
    const $file_masivo = $('#file-masivo');
    const $file_masivo_filename = $('#file-masivo-filename');
    const $btn_subir_masivo = $('#btn-subir-masivo');
    const $btn_descarga_formato = $('#btn-descarga-formato');
    const $form = $('#frmUpload');

    //Copiado
    const $sel_organizacion_copiado = $('#sel-organizacion-copiado');
    const $sel_periodo_copiado = $('#sel-periodo-copiado');
    const $btn_copiar_copiado = $('#btn-copiar-copiado');

    const $txt_comentario = $('#txt-comentario');
    const $btn_registrar = $('#btn-registrar');

    //Periodo Anterior
    let contentCardsMobileAnt = $("#contentCards-tarifaCursoAnterior");
    let containerDocenteAnt = $("#cursoPeriodoAnterior");
    let tblDocentesAnt = $("#cursoAnteriorTable");
    //--/--

    $sel_organizacion_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_periodo_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_tipo_sesion_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_curso_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_curso_individual.select2();

    $sel_organizacion_editar.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_periodo_editar.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_curso_editar.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_curso_editar.select2({
        dropdownParent: $('#div-modal-tarifa')
    });

    $sel_organizacion_copiado.prepend(Constantes.Select.OpcionSeleccione).val('');
    $sel_periodo_copiado.prepend(Constantes.Select.OpcionSeleccione).val('');

    //--<Individual>--
    $input_curso_individual.typeahead({
        hint: true,
        highlight: true,
        minLength: 3,
        limit: 20,
        cache: false,
    }, {
        displayKey: 'value',
        source: _cursosTypeahead.ttAdapter(),
        highlighter: function (item) {
            return item.split(_cursosSplitChar)[0];
        }
    }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
        const cursoValueSplitted = $input_curso_individual.val().split(_cursosSplitChar);
        if (!cursoValueSplitted || cursoValueSplitted.length < 2) return;
        const curso = cursoValueSplitted[0];
        if (!_cursosRemote.some(x => x.curso == curso)) _cursosRemote.push({
            curso: curso,
            nombre: cursoValueSplitted[1]
        });
    });

    $sel_organizacion_individual.on('change', function () {
        const organizacionValue = $(this).val();
        $sel_periodo_individual.find('option').not(':first').remove();
        $sel_curso_individual.find('option').not(':first').remove();
        if (organizacionValue == null || organizacionValue.trim() === '') return false;
        periodoAcademicoService.listarPorOrganizacion(organizacionValue, (response) => {
            for (let x of response) {
                $sel_periodo_individual.append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });

        // Mostrar/ocultar tipo de sesión basado en organización
        if (organizacionValue === 'ESC') {
            $('#div-tipo-sesion-individual').removeClass('d-none');
            $sel_tipo_sesion_individual.prop('required', true);
        } else {
            $('#div-tipo-sesion-individual').addClass('d-none');
            $sel_tipo_sesion_individual.prop('required', false).val('Síncrono');
        }
    });

    //$sel_periodo_individual.on('change', function () {
    //    const periodoValue = $(this).val();
    //    $sel_curso_individual.find('option').not(':first').remove();
    //    if (periodoValue == null || periodoValue.trim() === '') return false;
    //    tarifaCursoService.listarCursosPorPeriodoAcademico(periodoValue, (response) => {
    //        for (let x of response) {
    //            $sel_curso_individual.append($("<option></option>").attr("value", x.key).text(`${x.key} - ${x.value}`));
    //        }
    //    });
    //});

    $btn_agregar_individual.on("click", function (e) {
        e.preventDefault();

        const item = {
            organizacion: $sel_organizacion_individual.find('option:selected').text(),
            idOrganizacion: $sel_organizacion_individual.val(),
            periodo: $sel_periodo_individual.find('option:selected').text(),
            idPeriodo: $sel_periodo_individual.val(),
            tipoSesion: $sel_organizacion_individual.val() === 'ESC' ? $sel_tipo_sesion_individual.val() : 'Síncrono',
            //curso: $sel_curso_individual.find('option:selected').text(),
            idCurso: $sel_curso_individual.val(),
            tarifa: $input_tarifa_individual.val()
        };

        let validaciones = [];
        if (!item.idOrganizacion || item.idOrganizacion == '') validaciones.push('Seleccione una organización');
        if (!item.idPeriodo || item.idPeriodo == '') validaciones.push('Seleccione un periodo');
        if (item.idOrganizacion === 'ESC' && (!item.tipoSesion || item.tipoSesion == '')) validaciones.push('Seleccione un tipo de sesión');
        //if (!item.idCurso || item.idCurso == '') validaciones.push('Seleccione un curso');
        if (!item.tarifa || item.tarifa == '' || isNaN(item.tarifa)) validaciones.push('Ingrese una tarifa');
        if (validaciones.length > 0) {
            MessageBox.error(validaciones[0]);
            return false;
        }

        //--<>--
        let cursoValue = $input_curso_individual.val()
        if (cursoValue == null || cursoValue.trim() === '') return false;

        const cursoValueSplitted = cursoValue.split(_cursosSplitChar);
        if (cursoValueSplitted?.length < 2) {
            MessageBox.error('curso no válido');
            return false;
        }

        const curso = cursoValueSplitted[0];
        const cursoRemote = _cursosRemote.filter(x => x.curso == curso)?.[0];
        if (!cursoRemote) {
            MessageBox.error('curso no válido');
            return false;
        }

        item.idCurso = cursoRemote.curso;
        item.curso = cursoRemote.nombre;
        //--</>--

        if (_tarifas.length > 0
            && (_idOrganizacion != item.idOrganizacion || _idPeriodo != item.idPeriodo)) {
            MessageBox.error('La organizacion y/o periodo no coinciden con los ingresados');
            return false;
        }

        if (_tarifas.some(x => x.idCurso == item.idCurso
            && (!item.tipoSesion
                || (x.tipoSesion == 'Ambos')
                || (item.tipoSesion == 'Ambos')
                || (x.tipoSesion == item.tipoSesion)))) {
            MessageBox.error('Ya existe el curso');
            return false;
        }

        _tarifas.push(item);
        _drawTable();
        if (_tarifas.length > 0) {
            _idOrganizacion = item.idOrganizacion;
            _idPeriodo = item.idPeriodo;
            $sel_organizacion_individual.removeAttr('disabled').attr('disabled', true);
            $sel_periodo_individual.removeAttr('disabled').attr('disabled', true);
        }
    });

    $("#input-tarifa-editar, #input-tarifa-individual").keydown(function (e) {
        //Get the occurence of decimal operator
        var match = $(this).val().match(/\./g);
        if (match != null) {
            // Allow: backspace, delete, tab, escape and enter 
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }  // Ensure that it is a number and stop the keypress
            else if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && (e.keyCode == 190)) {
                e.preventDefault();
            }
        }
        else {
            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        }
    });
    //Allow Upto Two decimal places value only
    $("#input-tarifa-editar, #input-tarifa-individual").keyup(function () {
        if ($(this).val().indexOf('.') != -1) {
            if ($(this).val().split(".")[1].length > 2) {
                if (isNaN(parseFloat(this.value))) return;
                this.value = parseFloat(this.value).toFixed(2);
            }
        }
    });
    //--</Individual>--


    //--<Editar>--
    $sel_organizacion_editar.on('change', function () {
        const organizacionValue = $(this).val();
        $sel_periodo_editar.find('option').not(':first').remove();
        $sel_curso_editar.find('option').not(':first').remove();
        if (organizacionValue == null || organizacionValue.trim() === '') return false;
        periodoAcademicoService.listarPorOrganizacion(organizacionValue, (response) => {
            for (let x of response) {
                $sel_periodo_editar.append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    });

    $btn_guardar_editar.on('click', function (e) {
        e.preventDefault();
        const item = {
            organizacion: $sel_organizacion_editar.find('option:selected').text(),
            idOrganizacion: $sel_organizacion_editar.val(),
            periodo: $sel_periodo_editar.find('option:selected').text(),
            idPeriodo: $sel_periodo_editar.val(),
            tipoSesion: $sel_tipo_sesion_editar.val(),
            idCurso: $input_curso_editar.val().split(' - ')[0].trim(),
            curso: $input_curso_editar.val().split(' - ')[1].trim(),
            //curso: $sel_curso_editar.find('option:selected').text(),
            //idCurso: $sel_curso_editar.val(),
            tarifa: parseFloat($input_tarifa_editar.val())
        };

        let validaciones = [];
        if (!item.idOrganizacion || item.idOrganizacion == '') validaciones.push('Seleccione una organización');
        if (!item.idPeriodo || item.idPeriodo == '') validaciones.push('Seleccione un periodo');
        if (!item.tipoSesion || item.tipoSesion == '') validaciones.push('Seleccione un tipo de sesión');
        if (!item.idCurso || item.idCurso == '') validaciones.push('Seleccione un curso');
        if (!item.tarifa || item.tarifa == '' || isNaN(item.tarifa)) validaciones.push('Ingrese una tarifa');
        if (validaciones.length > 0) {
            MessageBox.error(validaciones[0]);
            return false;
        }

        const idCurso = $input_idcurso_editar.val();
        _tarifas = _tarifas.map(el => el.idCurso == idCurso ? item : el);
        _drawTable();
        $div_modal_tarifa.hide();
    });
    //--</Editar>--


    //--<Masivo>--
    $btn_subir_masivo.on('click', () => {
        $file_masivo.click();
    });
    $btn_descarga_formato.attr("href", URL_BASE + "WkSolicitud/DescargaFormato?key=" + Constantes.Workflow.TarifaCursos);
    $file_masivo.on('change', () => {
        const uploadFile = $file_masivo[0].files[0];
        const labelSave = 'Subir un excel';
        let label = labelSave;
        if (uploadFile === undefined) {
            MessageBox.error('Por favor adjunte un documento para la justificación');
            return false;
        }
        label = uploadFile.name;
        $file_masivo_filename.text(label);
        let request = new Object();
        request.formFile = uploadFile;
        tarifaCursoService.subirRegistroMasivo(request, (response) => {
            if (_tarifas.length > 0
                && (_idOrganizacion != response[0].idOrganizacion || _idPeriodo != response[0].idPeriodo)) {
                MessageBox.error('La organizacion y/o periodo del archivo no coinciden con los ingresados');
                return false;
            }
            for (let item of response) {
                if (!_tarifas.some(x => x.idCurso == item.idCurso)) {
                    let _item = item;
                    _item.idCurso = item.idCurso;
                    _item.curso = item.curso;
                    _tarifas.push(_item);
                }
            }
            _idOrganizacion = _tarifas[0].idOrganizacion;
            _idPeriodo = _tarifas[0].idPeriodo;
            _drawTable();
            //$file_masivo.val('');
            $form.get(0).reset();
            $file_masivo_filename.text(labelSave);
        }, true, true);
        $form.get(0).reset();
    });
    //--</Masivo>--


    //--<Copiado>--
    $sel_organizacion_copiado.on('change', function () {
        const organizacionValue = $(this).val();
        $sel_periodo_copiado.find('option').not(':first').remove();
        if (organizacionValue == null || organizacionValue.trim() === '') return false;
        periodoAcademicoService.listarPorOrganizacion(organizacionValue, (response) => {
            for (let x of response) {
                $sel_periodo_copiado.append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    });
    $("#btn-ndividual").on("click", (e) => {
        e.preventDefault();
        $('.div-copiar').addClass('d-none');
    });
    $("#btn-asivo").on("click", (e) => {
        e.preventDefault();
        $('.div-copiar').addClass('d-none');
    });
    $("#btn-copiar").on("click", (e) => {
        e.preventDefault();
        $('.div-copiar').removeClass('d-none');
    });
    $("#btnPeriodoAnt").on("click", (e) => {
        if ($(e.currentTarget).is(':checked'))
            containerDocenteAnt.removeClass("d-none");
        else
            containerDocenteAnt.addClass("d-none");
    });
    $btn_copiar_copiado.on('click', function () {
        const idOrganizacion = $sel_organizacion_copiado.val();
        const idPeriodo = $sel_periodo_copiado.val();
        let validaciones = [];
        if (!idPeriodo || idPeriodo == '') validaciones.push('Seleccione un periodo');
        if (_tarifas.length > 0
            && (_idOrganizacion != idOrganizacion || _idPeriodo != idPeriodo)) {
            validaciones.push('La organizacion y/o periodo no coinciden con los ingresados');
        }
        if (validaciones.length > 0) {
            MessageBox.error(validaciones[0]);
            return false;
        }

        tarifaCursoService.listarTarifasDePeriodoAnterior(idPeriodo, (response) => {
            if (!response || response.length === 0) {
                MessageBox.error('No se encontraron tarifas del periodo anterior');
                return false;
            }

            if (_tarifas.length === 0) {
                _idOrganizacion = idOrganizacion;
                _idPeriodo = idPeriodo;
            }

            wkTarifaDocenteAnt();
            for (let item of response) {
                if (item.tienePeriodoActual && !_tarifas.some(x => x.idCurso == item.idCurso)) {
                    let _item = item;
                    _item.curso = `${item.idCurso} - ${item.curso}`;
                    _tarifas.push({
                        organizacion: $sel_organizacion_copiado.find('option:selected').text(),
                        idOrganizacion: _idOrganizacion,
                        periodo: $sel_periodo_copiado.find('option:selected').text(),
                        idPeriodo: _idPeriodo,
                        tipoSesion: item.tipoSesion,
                        curso: item.nombreCurso,
                        idCurso: item.idCurso,
                        tarifa: parseFloat(item.tarifa)
                    });
                }
                if (!item.tienePeriodoActual)
                {
                    row = { ...item };
                    row.periodo = `${item.academicYearAnterior}-${item.academicTermAnterior}`;
                    row.curso = `${item.idCurso}-${item.nombreCurso}`;
                    $(tblDocentesAnt).DataTable().row.add(row).draw(false);
                }
            }
            cargarMobileAnt();
            if (!$("#btnPeriodoAnt").is(':checked')) $("#btnPeriodoAnt").click();
            _drawTable();
        });
    });
    //--</Copiado>--

    $tbl_tarifas.on("click", ".editar-tarifa", (e) => {
        const idCurso = e.currentTarget.getAttribute('data-id');
        setEditarTarifa(idCurso);
    });

    $div_content_cards.on("click", ".btn-action-card.editar-tarifa", function editarTarifaMobile(e) {
        const idCurso = $(this).attr('data-id');
        setEditarTarifa(idCurso);
    });

    function setEditarTarifa(idCurso) {
        const item = _tarifas.filter(x => x.idCurso == idCurso)?.[0];
        $input_idcurso_editar.val(idCurso);
        $sel_periodo_editar.find('option').not(':first').remove();
        $input_curso_editar.val(`${item.idCurso} - ${item.curso}`);
        $sel_curso_editar.find('option').not(':first').remove();
        $sel_organizacion_editar.val(item.idOrganizacion);

        periodoAcademicoService.listarPorOrganizacion(item.idOrganizacion, (response_periodos) => {
            for (let x of response_periodos) {
                $sel_periodo_editar.append($("<option></option>").attr("value", x.key).text(x.value));
            }
            $sel_periodo_editar.val(item.idPeriodo);

            //tarifaCursoService.listarCursosPorPeriodoAcademico(item.idPeriodo, (response_cursos) => {
            //    for (let x of response_cursos) {
            //        $sel_curso_editar.append($("<option></option>").attr("value", x.key).text(`${x.key} - ${x.value}`));
            //    }
            //    $sel_curso_editar.val(item.idCurso);
            //});
        });

        $input_tarifa_editar.val(item.tarifa);
        $sel_tipo_sesion_editar.val(item.tipoSesion);

        $div_modal_tarifa.show();
    }

    $tbl_tarifas.on("click", ".eliminar-tarifa", (e) => {
        const idCurso = e.currentTarget.getAttribute('data-id');
        const indexToRemove = _tarifas.findIndex(x => x.idCurso == idCurso);
        _tarifas.splice(indexToRemove, 1);
        _drawTable();
        if (_tarifas.length == 0) {
            $sel_organizacion_individual.removeAttr('disabled');
            $sel_periodo_individual.removeAttr('disabled');
            wkTarifaDocenteAnt();
            cargarMobileAnt();
        }
    });

    $('.btn-show').on('click', function (e) {
        e.preventDefault();
        const containerId = $(this).attr('data-show');
        $('.tarifa-container').removeClass('d-none').addClass('d-none');
        $('#' + containerId).removeClass('d-none');
        $('.btn-show').removeClass('active');
        $(this).addClass('active');
    });

    $btn_registrar.on('click', function (e) {
        e.preventDefault();
        let validaciones = [];
        if (!_tarifas || _tarifas.length === 0) validaciones.push('Ingrese una o más tarifas');
        if (!$txt_comentario.val() || $txt_comentario.val().trim() == '') validaciones.push('Ingrese un comentario');
        if (validaciones.length > 0) {
            MessageBox.error(validaciones[0]);
            return false;
        }

        let request = new Object();
        request.organizacion = _idOrganizacion;
        request.idPeriodoAcademico = _idPeriodo;
        request.comentarioSolicitud = $txt_comentario.val();
        request.tarifas = _tarifas.map((item) => {
            return {
                IdCurso: item.idCurso,
                NombreCurso: item.curso,
                Tarifa: item.tarifa,
                TipoSesion: item.tipoSesion
            };
        });
        tarifaCursoService.agregar(request, (response) => {
            MessageBox.alert('Operación correcta', 'Solicitud generada correctamente', 'success', true, false, function () {
                window.location.reload();
            });
        }, true, true);
    });

    function _drawTable() {
        $tbl_tarifas.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            data: _tarifas,
            columns: [
                { data: "organizacion", title: "Organización" },
                { data: "periodo", title: "Año", render: (data, type, row) => `${row.periodo.split('-')[0]}` },
                { data: "periodo", title: "Periodo", render: (data, type, row) => `${row.periodo.split('-')[1]}` },
                { data: "curso", title: "Curso", render: (data, type, row) => `${row.idCurso} - ${row.curso}` },
                { data: "tipoSesion", title: "Tipo de Sesión" },
                { data: "tarifa", title: "Tarifa", render: (data, type, row) => `S/ ${Util.formatearMoneda(data)}` },
                {
                    className: 'td-accion text-center',
                    title: '<span class="no-mobile">Acciones<span>',
                    orderable: false,
                    render: (data, type, row) => {
                        return '<i class="fas fa-pencil-alt editar-tarifa" data-id="' + row.idCurso + '"></i>&nbsp;&nbsp;'
                            + '<i class="fas fa-trash eliminar-tarifa" data-id="' + row.idCurso + '"></i>';
                    }
                },
            ]
        });

        Mobile.generarCard(_tarifas, 1, (data) => {
            $div_content_cards.html('');
            if (data.length === 0) {
                // Mostrar un mensaje si no hay datos
                $div_content_cards.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                return; // Salir de la función si no hay datos
            }
            data.forEach((item) => {
                let card = `<div class="mobile-card">
                                    <div>
                                    <button class="btn btn-action-card float-end editar editar-tarifa" data-id="${item.idCurso}" key="${item.idCurso}"><i class="fas fa-pencil-alt" key="${item.idCurso}"></i></button>
                                    <h6 class="fw-bold">${item.curso}</h6>
                                </div>
                                <div>
                                    <span>Periodo:</span>
                                    <span>${item.periodo}</span>
                                </div>
                                <div>
                                    <span>Curso:</span>
                                    <span>${item.curso}</span>
                                </div>
                                <div>
                                    <span>Tipo de Sesión:</span>
                                    <span>${item.tipoSesion}</span>
                                </div>
                                <div>
                                    <span>Tarifa:</span>
                                    <span>${item.tarifa}</span>
                                </div>
                                    </div>`;
                $div_content_cards.append(card);
            });
        });
    }

    _drawTable();

    let dataTableAnt = $(tblDocentesAnt).DataTable({
        searching: false,
        paging: true,
        info: false,
        lengthChange: true,
        destroy: true,
        language: Util.obtenerLenguajeDataTable(),
        columns: [
            { data: "nombreOrganizacion", title: "Organización" },
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
            { data: "curso", title: "Curso" },
            {
                data: "tarifa", title: "Tarifa",
                render: (data) => {
                    return "S/. " + data
                }
            }
        ]
    });

    function cargarMobileAnt(response) {
        if (!response)
            response = $(tblDocentesAnt).DataTable().rows().data().toArray();
        Mobile.generarCard(response, 1, (data) => {
            contentCardsMobileAnt.html('');
            if (data.length === 0) {
                // Mostrar un mensaje si no hay datos
                contentCardsMobileAnt.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                return; // Salir de la función si no hay datos
            }
            data.forEach((item) => {
                let card = `<div class="mobile-card">
                <div>
                    <span>Organización:</span>
                    <span>${item.nombreOrganizacion}</span>
                </div>
                <div>
                    <span>Periodo:</span>
                    <span>${item.periodo}</span>
                </div>
                <div>
                    <span>Tarifa:</span>
                    <span>S/. ${item.tarifa}</span>
                </div>
                <div>
                    <span>Curso:</span>
                    <span>${item.curso}</span>
                </div>
                    </div>`;
                contentCardsMobileAnt.append(card);
            });
        });
    }
    cargarMobileAnt([]);

    function wkTarifaDocenteAnt() {
        dataTableAnt.clear().draw();
    }
});
