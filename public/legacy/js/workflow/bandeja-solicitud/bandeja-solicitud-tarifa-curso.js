$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});
const periodoAcademicoServiceC = new PeriodoAcademicoService();
const tarifaCursoService = new TarifaCursoService();

let _idSolicitudC = 0;
let _tarifas = [];
let _idOrganizacion = '';
let _idPeriodo = '';
const $div_modal_tarifa = new bootstrap.Offcanvas($("#div-modal-tarifa"));
const $tbl_tarifas = $('#tbl-tarifas');

//Individual
const $sel_organizacion_individual = $('#sel-organizacion-individual');
const $sel_periodo_individual = $('#sel-periodo-individual');
const $sel_tipo_sesion_individual = $('#sel-tipo-sesion-individual');
const $sel_curso_individual = $('#sel-curso-individual');
const $input_tarifa_individual = $('#input-tarifa-individual');
const $btn_agregar_individual = $('#btn-agregar-individual');

//Editar
const $input_idcurso_editar = $('#input-idcurso-editar');
const $sel_organizacion_editar = $('#sel-organizacion-editar');
const $sel_periodo_editar = $('#sel-periodo-editar');
const $sel_tipo_sesion_editar = $('#sel-tipo-sesion-editar');
const $sel_curso_editar = $('#sel-curso-editar');
const $input_tarifa_editar = $('#input-tarifa-editar');
const $btn_guardar_editar = $('#btn-guardar-editar');

//Masivo
const $file_masivo = $('#file-masivo');
const $file_masivo_filename = $('#file-masivo-filename');
const $btn_subir_masivo = $('#btn-subir-masivo');
const $btn_descarga_formato = $('#btn-descarga-formato');
const $txt_comentario = $('#txt-comentario');

$sel_organizacion_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_periodo_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_curso_individual.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_curso_individual.select2({ dropdownParent: $('#tarifaCursoModal') });

$sel_organizacion_editar.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_periodo_editar.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_curso_editar.prepend(Constantes.Select.OpcionSeleccione).val('');
$sel_curso_editar.select2({
    dropdownParent: $('#div-modal-tarifa')
});

//--<Individual>--
$sel_organizacion_individual.on('change', function () {
    const organizacionValue = $(this).val();
    $sel_periodo_individual.find('option').not(':first').remove();
    $sel_curso_individual.find('option').not(':first').remove();
    if (organizacionValue == null || organizacionValue.trim() === '') return false;
    periodoAcademicoServiceC.listarPorOrganizacion(organizacionValue, (response) => {
        for (let x of response) {
            $sel_periodo_individual.append($("<option></option>").attr("value", x.key).text(x.value));
        }
    });
});

$sel_periodo_individual.on('change', function () {
    const periodoValue = $(this).val();
    $sel_curso_individual.find('option').not(':first').remove();
    if (periodoValue == null || periodoValue.trim() === '') return false;
    tarifaCursoService.listarCursosPorPeriodoAcademico(periodoValue, (response) => {
        for (let x of response) {
            $sel_curso_individual.append($("<option></option>").attr("value", x.key).text(`${x.key} - ${x.value}`));
        }
    });
});

$btn_agregar_individual.on("click", function (e) {
    e.preventDefault();

    const item = {
        organizacion: $sel_organizacion_individual.find('option:selected').text(),
        idOrganizacion: $sel_organizacion_individual.val(),
        periodo: $sel_periodo_individual.find('option:selected').text(),
        idPeriodo: $sel_periodo_individual.val(),
        tipoSesion: $sel_tipo_sesion_individual.val(),
        curso: $sel_curso_individual.find('option:selected').text(),
        idCurso: $sel_curso_individual.val(),
        tarifa: parseFloat($input_tarifa_individual.val())
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

    if (_tarifas.length > 0
        && (_idOrganizacion != item.idOrganizacion || _idPeriodo != item.idPeriodo)) {
        MessageBox.error('La organizacion y/o periodo del archivo no coinciden con los ingresados');
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
//--</Individual>--


//--<Editar>--
$sel_organizacion_editar.on('change', function () {
    const organizacionValue = $(this).val();
    $sel_periodo_editar.find('option').not(':first').remove();
    $sel_curso_editar.find('option').not(':first').remove();
    if (organizacionValue == null || organizacionValue.trim() === '') return false;
    periodoAcademicoServiceC.listarPorOrganizacion(organizacionValue, (response) => {
        for (let x of response) {
            $sel_periodo_editar.append($("<option></option>").attr("value", x.key).text(x.value));
        }
    });
});

$sel_periodo_editar.on('change', function () {
    const periodoValue = $(this).val();
    $sel_curso_editar.find('option').not(':first').remove();
    if (periodoValue == null || periodoValue.trim() === '') return false;
    tarifaCursoService.listarCursosPorPeriodoAcademico(periodoValue, (response) => {
        for (let x of response) {
            $sel_curso_editar.append($("<option></option>").attr("value", x.key).text(`${x.key} - ${x.value}`));
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
        curso: $sel_curso_editar.find('option:selected').text(),
        idCurso: $sel_curso_editar.val(),
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
    var label = 'Agrega documentos';
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
                _item.curso = `${item.idCurso} - ${item.curso}`;
                _tarifas.push(_item);
            }
        }
        _idOrganizacion = _tarifas[0].idOrganizacion;
        _idPeriodo = _tarifas[0].idPeriodo;
        _drawTable();
    }, true, true);
});
//--</Masivo>--

$tbl_tarifas.on("click", ".editar-tarifa", (e) => {
    const idCurso = e.currentTarget.getAttribute('data-id');
    const item = _tarifas.filter(x => x.idCurso == idCurso)?.[0];
    $input_idcurso_editar.val(idCurso);
    $sel_periodo_editar.find('option').not(':first').remove();
    $sel_curso_editar.find('option').not(':first').remove();
    $sel_organizacion_editar.val(item.idOrganizacion);

    periodoAcademicoServiceC.listarPorOrganizacion(item.idOrganizacion, (response_periodos) => {
        for (let x of response_periodos) {
            $sel_periodo_editar.append($("<option></option>").attr("value", x.key).text(x.value));
        }
        $sel_periodo_editar.val(item.idPeriodo);

        tarifaCursoService.listarCursosPorPeriodoAcademico(item.idPeriodo, (response_cursos) => {
            for (let x of response_cursos) {
                $sel_curso_editar.append($("<option></option>").attr("value", x.key).text(`${x.key} - ${x.value}`));
            }
            $sel_curso_editar.val(item.idCurso);
        });
    });

    $sel_tipo_sesion_editar.val(item.tipoSesion);
    $input_tarifa_editar.val(item.tarifa);

    $div_modal_tarifa.show();
});

$tbl_tarifas.on("click", ".editar-tarifa", (e) => {
    const idCurso = e.currentTarget.getAttribute('data-id');
    const item = _tarifas.filter(x => x.idCurso == idCurso)?.[0];
    $input_idcurso_editar.val(idCurso);
    $sel_periodo_editar.find('option').not(':first').remove();
    $sel_curso_editar.find('option').not(':first').remove();
    $sel_organizacion_editar.val(item.idOrganizacion);

    periodoAcademicoServiceC.listarPorOrganizacion(item.idOrganizacion, (response_periodos) => {
        for (let x of response_periodos) {
            $sel_periodo_editar.append($("<option></option>").attr("value", x.key).text(x.value));
        }
        $sel_periodo_editar.val(item.idPeriodo);

        tarifaCursoService.listarCursosPorPeriodoAcademico(item.idPeriodo, (response_cursos) => {
            for (let x of response_cursos) {
                $sel_curso_editar.append($("<option></option>").attr("value", x.key).text(`${x.key} - ${x.value}`));
            }
            $sel_curso_editar.val(item.idCurso);
        });
    });

    $input_tarifa_editar.val(item.tarifa);

    $div_modal_tarifa.show();
});

$tbl_tarifas.on("click", ".eliminar-tarifa", (e) => {
    const idCurso = e.currentTarget.getAttribute('data-id');
    const indexToRemove = _tarifas.findIndex(x => x.idCurso == idCurso);
    _tarifas.splice(indexToRemove, 1);
    _drawTable();
    if (_tarifas.length == 0) {
        $sel_organizacion_individual.removeAttr('disabled');
        $sel_periodo_individual.removeAttr('disabled');
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

class BandejaSolicitudTarifaCurso {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#tarifaCursoModal"));
        this.idWorkflow = $("#frmTarifaCurso #IdWorkflow");
        this.idFaseWorkflow = $("#frmTarifaCurso #IdFaseWorkflow");
        this.solicitante = $("#frmTarifaCurso #Solicitante");
        this.fechaCreacion = $("#frmTarifaCurso #FechaCreacion");

        this.idSolicitud = $("#frmTarifaCurso #IdSolicitud");
        this.titulo = $("#frmTarifaCurso #tarifaCursoModalTitulo");
        this.evaluador = $("#frmTarifaCurso #Evaluador");
        this.estadoSolicitud = $("#frmTarifaCurso #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmTarifaCurso #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmTarifaCurso #ComentarioAtencion");
        this.inputAdjunto = $("#frmTarifaCurso #inputAdjunto");
        this.labelAdjunto = $("#frmTarifaCurso #LabelAdjunto");

        this.frmAccion = $("#frmTarifaCurso");
        this.btnCargarAdjunto = $("#frmTarifaCurso #btnCargarAdjunto");
        this.btnExportar = $("#frmTarifaCurso #btnExportar");
        this.btnGuardar = $("#frmTarifaCurso #btnGuardar");;
        this.model = null;
    }

    cargarData(solicitud, esEdicion, esInicio = false) {
        _idSolicitudC = solicitud.idSolicitud;
        /*this.labelAdjunto.text("Evidencia");*/

        let divAcciones = $("#frmTarifaCurso .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmTarifaCurso #divMotivoRechazoSolicitud");
        if (esEdicion) {
            this.titulo.text("Edición de Solicitud");
            divAcciones.removeClass("d-none");
            $(".edit-control").prop("disabled", false);
        } else {
            this.titulo.text("Consulta de Solicitud");
            divAcciones.addClass("d-none");
            $(".edit-control").prop("disabled", true);
            $('.tarifa-opcionesregistro, .tarifa-container').removeClass('d-none').addClass('d-none');
            $txt_comentario.prop("disabled", true);
        }
        new SolicitudService().obtenerParticipadosPorId(solicitud.idSolicitud, (response) => {
            solicitud = response.solicitud;
            _tarifas = response.tarifaCurso.map((item) => {

                return {
                    ...item,
                    idOrganizacion: item.organizacion,
                    idPeriodo: item.idPeriodoAcademico,
                    organizacion: item.nombreOrganizacion,
                    periodo: `${solicitud.periodoAcademico.academicYear + '-' + (solicitud.organizacion == 'ESC' ? solicitud.periodoAcademico?.academicSession : solicitud.periodoAcademico?.academicTerm)}`,
                    curso: `${item.idCurso} - ${item.nombreCurso}`,
                    tipoSesion: item.tipoSesion
                }
            });
            _idOrganizacion = _tarifas[0].idOrganizacion;
            _idPeriodo = _tarifas[0].idPeriodo;
            $txt_comentario.val(response.solicitud.comentarioSolicitud);
            _drawTable();

            solicitud = response.solicitud;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));
            //this.sesion.val(`${response.justificacion.idSesion} - ${response.sesionClase.sesionsDesCurso} - ${response.sesionClase.sesionsSeccion} - ${Util.formatearFechaAsString(response.sesionClase.sesiondFechaSesion)}`);
            //this.identificador.val(response.justificacion.identificador);
            //this.horaEntrada.val(response.justificacion.horaEntrada);
            //this.horaSalida.val(response.justificacion.horaSalida);
            //this.temaClase.val(response.justificacion.temaClase);
            this.idSolicitud.text(response.solicitud.idSolicitud);
            //this.adjunto.text(response.justificacion.adjunto);
            //this.adjunto.attr("href", `${response.urlEvidencia}${response.justificacion.adjunto}`);
            //this.motivoJustificacion.val(response.justificacion.motivo);
            this.evaluador.val(response.solicitud.nombreEvaluador?.toLowerCase() || ' ');
            this.estadoSolicitud.val(response.solicitud.estadoSolicitud.nombre);
            if (response.solicitud.idEstadoSolicitud === Constantes.EstadoSolicitud.Rechazado) {
                divMotivoRechazoSolicitud.removeClass("d-none");
                this.motivoRechazoSolicitud.val(response.solicitud.motivoRechazoSolicitud?.nombre || ' ');
            } else {
                divMotivoRechazoSolicitud.addClass("d-none");
                this.motivoRechazoSolicitud.val("");
            }
            this.comentarioAtencion.val(response.solicitud.comentarioAtencion || ' ');
            this.btnExportar.attr("href", URL_BASE + "WkAprobacionSolicitud/DescargarExcelPendienteAprobarPorId?key=" + response.solicitud.idSolicitud);
            if (esInicio) {
                new WorkflowService().listar({}, (response) => {
                    this.idWorkflow.append(Constantes.Select.OpcionSeleccione);
                    response.forEach(x => {
                        this.idWorkflow.append(`<option value="${x.idWorkflow}">${x.nombre}</option>`);
                    });
                    if (solicitud) {
                        this.idWorkflow.val(solicitud.idWorkflow);
                    }
                });
                new FaseWorkflowService().listar({}, (response) => {
                    this.idFaseWorkflow.append(Constantes.Select.OpcionNinguno);
                    response.forEach(x => {
                        this.idFaseWorkflow.append(`<option value="${x.idFaseWorkflow}">${x.nombre}</option>`);
                    });
                    if (solicitud) {
                        this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
                    }
                });
            } else {
                this.idFaseWorkflow.val(solicitud.idFaseWorkflow);
                this.idWorkflow.val(solicitud.idWorkflow);
            }
            if (esEdicion)
                $tbl_tarifas.DataTable().column(5).visible(true);
            else
                $tbl_tarifas.DataTable().column(5).visible(false);
        });
        this.modal.show();
    }

    configurarVentana(data, esEdicion, callback) {
        this.inputAdjunto.on("change", () => {
            if (this.inputAdjunto[0].files.length > 0) {
                let ext = this.inputAdjunto[0].files[0].name.split('.').pop().trim();
                if (ext !== "docx" && ext !== "doc" && ext !== "pdf") {
                    this.inputAdjunto.val(null);
                    MessageBox.showMessenger("Documento adjunto inválido", 'error', 'Error')
                }
                this.labelAdjunto.text(this.inputAdjunto[0].files[0].name);
            } else {
                this.labelAdjunto.text("Evidencia");
            }
        });
        this.btnCargarAdjunto.on("click", () => {
            this.inputAdjunto.click();
        });
        this.btnGuardar.on("click", () => {
            let request = {
                motivo: $txt_comentario.val(),
                items: _tarifas.map(item => ({
                    idSolicitud: _idSolicitudC,
                    idCurso: item.idCurso,
                    tarifa: item.tarifa
                }))
            };
            new SolicitudService().actualizarTarifaCurso(request, (response) => {
                callback(true);
                MessageBox.info('Solicitud actualizada correctamente');
                this.modal.hide();
            });
        });

        this.cargarData(data, esEdicion, true);
    }
}

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
            { data: "periodo", title: "Periodo" },
            { data: "curso", title: "Curso" },
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
}