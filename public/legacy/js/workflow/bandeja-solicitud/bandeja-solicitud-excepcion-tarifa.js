$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const _docentesRemoteET = [];
const _docentesSplitCharET = ' - ';
const _cursosRemoteET = [];
const _cursosSplitCharET = ' - ';

const _docentesTypeaheadET = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: URL_BASE + 'WkTarifaDocente/buscarDocentesAd?',
        replace: function (url, query) {
            const periodoValue = $("#frmExcepcionTarifa #periodo option:selected").val().trim();
            return url + 'query=' + query.toUpperCase() + '&periodoAcademico=' + (periodoValue == '' ? periodoValue : $("#frmExcepcionTarifa #periodo option:selected").text()) +
                '&organizacion=' + $("#frmExcepcionTarifa #organizacion option:selected").val();
        },
        wildcard: '%QUERY',
        filter: _docentesTypeaheadET => $.map(_docentesTypeaheadET, option => ({
            value: option.docenteAD + _docentesSplitCharET + option.displayName
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_docentesTypeaheadET.initialize();

const _cursosTypeahead = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: URL_BASE + 'WkExcepcionTarifa/buscarCursosAd?',
        replace: function (url, query) {
            const periodoValue = $("#frmExcepcionTarifa #periodo option:selected").val();
            return url + 'query=' + query.toUpperCase() + '&idPeriodoAcademico=' + periodoValue;
        },
        wildcard: '%QUERY',
        filter: _cursosTypeahead => $.map(_cursosTypeahead, option => ({
            value: option.codigo + _cursosSplitCharET + option.nombre
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_cursosTypeahead.initialize();

class BandejaSolicitudExcepcionTarifa {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#excepcionTarifaModal"));
        this.idWorkflow = $("#frmExcepcionTarifa #IdWorkflow");
        this.idFaseWorkflow = $("#frmExcepcionTarifa #IdFaseWorkflow");
        this.solicitante = $("#frmExcepcionTarifa #Solicitante");
        this.fechaCreacion = $("#frmExcepcionTarifa #FechaCreacion");
        this.idSolicitud = $("#frmExcepcionTarifa #IdSolicitud");
        this.identificador = $("#frmExcepcionTarifa #Identificador");
        this.titulo = $("#frmExcepcionTarifa #excepcionTarifaModalTitulo");

        this.evaluador = $("#frmExcepcionTarifa #Evaluador");
        this.estadoSolicitud = $("#frmExcepcionTarifa #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmExcepcionTarifa #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmExcepcionTarifa #ComentarioAtencion");
        this.inputAdjunto = $("#frmExcepcionTarifa #inputAdjuntoModal");
        this.labelAdjunto = $("#frmExcepcionTarifa #inputLabelModal");
        this.organizacion = $("#frmExcepcionTarifa #organizacion");
        this.periodoAcademico = $("#frmExcepcionTarifa #periodo");
        this.docente = $("#frmExcepcionTarifa #docente");
        this.curso = $("#frmExcepcionTarifa #curso");
        this.tarifa = $("#frmExcepcionTarifa #tarifa");
        this.tblDocentes = $("#frmExcepcionTarifa #excepcionTarifaTable");
        this.contentCardsMobile = $("#frmExcepcionTarifa #contentCards-excepcionTarifa");
        this.btnAgregar = $("#frmExcepcionTarifa #btnAgregarModal");
        this.btnIndividual = $("#frmExcepcionTarifa #btnIndividualModal");
        this.btnMasivo = $("#frmExcepcionTarifa #btnMasivoModal");
        this.frmAccion = $("#frmExcepcionTarifa");
        this.btnCargarAdjunto = $("#frmExcepcionTarifa #btnCargarAdjuntoModal");
        this.btnExportar = $("#frmExcepcionTarifa #btnExportar");
        this.btnGuardar = $("#frmExcepcionTarifa #btnGuardar");
        this.btnFormato = $("#frmExcepcionTarifa #btnFormato");
        this.model = null;
        this.excepcionTarifaEdit = null;
        this.esEdicion = false;
        this.organizacion.prepend(Constantes.Select.OpcionSeleccione);
        this.periodoAcademico.prepend(Constantes.Select.OpcionSeleccione);
        this.periodoAcademicoService = new PeriodoAcademicoService();
        this.dataTable = this.tblDocentes.DataTable({
            searching: false,
            paging: true,
            info: false,
            lengthChange: true,
            destroy: true,
            language: Util.obtenerLenguajeDataTable(),
            createdRow: function (row, data, dataIndex) {
                $(row).find('td:last-child').attr('key', data.idDocente);
                $(row).find('td:last-child').attr('idx', dataIndex);
            },
            columns: [
                { data: "idExcepcionTarifa", title: "idExcepcionTarifa", visible: false },
                { data: "idOrganizacion", title: "idOrganizacion", visible: false },
                { data: "idPeriodoAcademico", title: "idPeriodoAcademico", visible: false },
                { data: "idDocente", title: "idDocente", visible: false },
                { data: "idCurso", title: "idCurso", visible: false },
                { data: "organizacion", title: "Organizacion", className: "no-mobile" },
                /*{ data: "periodo", title: "Periodo" },*/
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
                { data: "docente", title: "Docente" },
                {
                    data: "curso", title: "Curso",
                    render: (data, type, row) => {
                        return `${row.idCurso} - ${data}`;
                    }
                },
                {
                    data: "tarifa", title: "Tarifa",
                    render: (data) => {
                        return "S/. " + data
                    }
                },
                {
                    className: 'td-accion text-center',
                    title: '<span class="no-mobile">Acciones<span>',
                    orderable: false,
                    render: (data, type, row) => {
                        let acciones = "";
                        acciones += '<i class="fas fa-pencil-alt editar me-2"></i>';
                        acciones += '<i class="fas fa-trash eliminar-docente"></i>';
                        return acciones;
                    }
                },
            ]
        });
    }

    cargarData(solicitud, esEdicion, esInicio = false) {
        let divAcciones = $("#frmExcepcionTarifa .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmExcepcionTarifa #divMotivoRechazoSolicitud");
        this.resetFormState();
        this.esEdicion = esEdicion;
        if (esEdicion) {
            this.titulo.text("Edición de Solicitud");
            divAcciones.removeClass("d-none");
            $('#frmExcepcionTarifa .div-individual-copia, #frmExcepcionTarifa .div-opciones-tarifa').removeClass('d-none');
            $(".edit-control").prop("disabled", false);
            this.tblDocentes.DataTable().column(11).visible(true);
        } else {
            this.titulo.text("Consulta de Solicitud");
            divAcciones.addClass("d-none");
            $('#frmExcepcionTarifa .div-individual-copia, #frmExcepcionTarifa .div-opciones-tarifa').addClass('d-none');
            $('#frmExcepcionTarifa .div-individual').addClass('d-none');
            $('#frmExcepcionTarifa .div-masivo').addClass('d-none');
            $(".edit-control").prop("disabled", true);
            this.tblDocentes.DataTable().column(11).visible(false);
        }
        new SolicitudService().obtenerParticipadosPorId(solicitud.idSolicitud, (response) => {
            solicitud = response.solicitud;
            const excepciones = response.excepcionesTarifa;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));

            if (excepciones.length > 0) {
                this.organizacion.val(solicitud.organizacion);
                this.organizacion.trigger('change');
                const nombreOrganizacion = this.organizacion.find('option:selected').text();
                excepciones.forEach(item => {

                    let row = new Object();
                    row.idExcepcionTarifa = null;
                    row.idOrganizacion = solicitud.organizacion;
                    row.idPeriodoAcademico = solicitud.idPeriodoAcademico;
                    row.idDocente = item.idDocente;
                    row.docente = item.docente;
                    row.idCurso = item.idCurso;
                    row.curso = item.curso;
                    row.organizacion = nombreOrganizacion;
                    row.periodo = `${solicitud.periodoAcademico.academicYear + '-' + (solicitud.organizacion == 'ESC' ? solicitud.periodoAcademico?.academicSession : solicitud.periodoAcademico?.academicTerm)}`;
                    row.tarifa = item.tarifa;
                    this.tblDocentes.DataTable().row.add(row).draw(false);
                });
                this.btnExportar.attr("href", URL_BASE + "WkAprobacionSolicitud/DescargarExcelPendienteAprobarPorId?key=" + solicitud.idSolicitud);
                setTimeout(() => { this.periodoAcademico.val(solicitud.idPeriodoAcademico) }, 700);
                this.organizacion.prop("disabled", true);
                this.periodoAcademico.prop("disabled", true);
                this.cargarMobile();
            }
            this.idSolicitud.text(response.solicitud.idSolicitud);
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
        });
        this.modal.show();
    }

    configurarVentana(data, esEdicion, callback) {
        this.inputAdjunto.on("change", () => {
            const labelSave = 'Subir un excel';
            if (this.inputAdjunto[0].files.length > 0) {
                let ext = this.inputAdjunto[0].files[0].name.split('.').pop().trim();
                if (ext !== "xls" && ext !== "xlsx") {
                    this.inputAdjunto.val(null);
                    MessageBox.showMessenger("Documento adjunto inválido", 'error', 'Error');
                }
                this.labelAdjunto.text(this.inputAdjunto[0].files[0].name);

                // Llama al servidor para procesar documento
                var data = $(this.tblDocentes).DataTable().row(0).data();
                let request = new Object();
                request.documento = this.inputAdjunto[0].files[0];
                if (data) {
                    request.idOrganizacion = data.idOrganizacion;
                    //request.idPeriodoAcademico = data.idPeriodoAcademico;
                    request.nombrePeriodo = data.periodo;
                }
                new ExcepcionTarifaService().procesar(request, (response) => {
                    if (response.lista.length > 0) {
                        for (let row of response.lista) {
                            this.tblDocentes.DataTable().row.add(row).draw();
                        }
                        MessageBox.alert('Operación correcta', 'Documento procesado correctamente', 'success', true, false, function () {
                            $("#frmExcepcionTarifa #inputAdjuntoModal").val(null);
                            $("#frmExcepcionTarifa #inputLabelModal").text(labelSave);
                            if (!$("#frmExcepcionTarifa #organizacion").is(':disabled')) {
                                $("#frmExcepcionTarifa #organizacion").val(response.idOrganizacion);
                                for (let x of response.lstPeriodos) {
                                    $("#frmExcepcionTarifa #periodo").append($("<option></option>").attr("value", x.key).text(x.value));
                                }
                                $("#frmExcepcionTarifa #periodo").val(response.idPeriodoAcademico);
                                $("#frmExcepcionTarifa #organizacion, #frmExcepcionTarifa #periodo").prop("disabled", true);
                            }
                        });
                        this.cargarMobile();
                    }
                }, true, true);
                this.inputAdjunto.val(null);
            } else {
                this.labelAdjunto.text(labelSave);
            }
        });
        this.btnFormato.attr("href", URL_BASE + "WkSolicitud/DescargaFormato?key=" + Constantes.Workflow.ExcepcionesTarifasDocente);
        this.btnCargarAdjunto.on("click", () => {
            this.inputAdjunto.click();
        });
        this.btnIndividual.on("click", (e) => {
            e.preventDefault();
            this.btnMasivo.removeClass('active');
            this.btnIndividual.addClass('active');
            $('#frmExcepcionTarifa .div-individual-copia').removeClass('d-none');
            $('#frmExcepcionTarifa .div-individual').removeClass('d-none');
            $('#frmExcepcionTarifa .div-masivo').addClass('d-none');
        });
        this.btnMasivo.on("click", (e) => {
            e.preventDefault();
            this.btnMasivo.addClass('active');
            this.btnIndividual.removeClass('active');
            $('#frmExcepcionTarifa .div-individual-copia').addClass('d-none');
            $('#frmExcepcionTarifa .div-individual').addClass('d-none');
            $('#frmExcepcionTarifa .div-masivo').removeClass('d-none');
        });
        this.btnAgregar.on("click", (e) => {
            let docenteValue = this.docente.val();
            let cursoValue = this.curso.val();
            let tarifaValue = this.tarifa.val();

            if (docenteValue == null || docenteValue.trim() === '') {
                MessageBox.error('Debe seleccionar un Docente');
                return false;
            }

            if (cursoValue == null || cursoValue.trim() === '') {
                MessageBox.error('Debe seleccionar un Curso');
                return false;
            }

            if (tarifaValue == null || tarifaValue.trim() === '') {
                MessageBox.error('Debe ingresar una tarifa');
                return false;
            } else if (parseFloat(tarifaValue).toFixed(2) == 0) {
                MessageBox.error('Ingrese una tarifa mayor a cero');
                return false;
            }

            const docenteValueSplitted = docenteValue.split(_docentesSplitCharET);
            if (docenteValueSplitted?.length < 2) {
                MessageBox.error('Docente no válido');
                return false;
            }

            const docente = docenteValueSplitted[0];
            const docenteRemote = _docentesRemoteET.filter(x => x.docente == docente)?.[0];
            if (!docenteRemote) {
                MessageBox.error('Docente no válido');
                return false;
            }

            const cursoValueSplitted = cursoValue.split(_cursosSplitCharET);
            if (cursoValueSplitted?.length < 2) {
                MessageBox.error('Curso no válido');
                return false;
            }

            const curso = cursoValueSplitted[0];
            const cursoRemote = _cursosRemoteET.filter(x => x.curso == curso)?.[0];
            if (!cursoRemote) {
                MessageBox.error('Curso no válido');
                return false;
            }

            let docentes = this.tblDocentes.DataTable().rows().data().toArray();
            if (docentes.findIndex(x => x.idDocente === docente && x.idCurso === curso) >= 0) {
                MessageBox.showMessenger('El docente y curso ya estan asignados', 'warning', 'Registro Duplicado');
            } else {
                let row = new Object();
                row.idExcepcionTarifa = null;
                row.idOrganizacion = $("#frmExcepcionTarifa #organizacion option:selected").val();
                row.idDocente = docente;
                row.idCurso = curso;
                row.idPeriodoAcademico = $("#frmExcepcionTarifa #periodo option:selected").val();
                row.organizacion = $("#frmExcepcionTarifa #organizacion option:selected").text();
                row.periodo = $("#frmExcepcionTarifa #periodo option:selected").text();
                row.docente = docenteRemote.nombre || '';
                row.curso = cursoRemote.nombre || '';
                row.tarifa = this.tarifa.val();
                this.tblDocentes.DataTable().row.add(row).draw();
                this.cargarMobile();
                this.organizacion.prop("disabled", true);
                this.periodoAcademico.prop("disabled", true);
                this.tarifa.val('');
                this.docente.typeahead('val', '');
                this.curso.typeahead('val', '');
            }
            return false;
        });
        this.btnGuardar.on("click", () => {
            let docentes = this.tblDocentes.DataTable().rows().data().toArray();

            if (docentes.length == 0) {
                MessageBox.error('Debe ingresar por lo menos un registro');
                return;
            }
            let excepcionTarifa = {
                Comentario: this.model.solicitud.comentarioAtencion || ' ',
                idSolicitud: this.model.solicitud.idSolicitud,
                NombreOrganizacion: $("#frmExcepcionTarifa #organizacion option:selected").text(),
                NombrePeriodoAcademico: $("#frmExcepcionTarifa #periodo option:selected").text(),
                Docentes: docentes
            };
            new SolicitudService().actualizarExcepcionTarifa(excepcionTarifa, (response) => {
                callback(true);
                MessageBox.info('Registros guardado correctamente');
                this.modal.hide();
            }, true, false);
        });
        this.tblDocentes.on("click", ".editar", (e) => {
            const key = e.currentTarget.closest("td");
            var data = this.tblDocentes.DataTable().row(key).data();
            if (!data.idExcepcionTarifa) {
                const index = this.tblDocentes.DataTable().row(key).index();
                data.idExcepcionTarifa = index;
            }
            this.abrirModalRegistro(data);
        });
        this.contentCardsMobile.on("click", ".editar", (e) => {
            let data = this.tblDocentes.DataTable().rows().data().toArray();
            let rowsCount = this.tblDocentes.DataTable().rows().data().count();
            for (let rIndex = 0; rIndex < rowsCount; rIndex++) {
                const item = this.tblDocentes.DataTable().rows(rIndex).data();
                let idx = data.findIndex(x => x.idDocente == item[0].idDocente && x.idCurso == item[0].idCurso && x.idExcepcionTarifa == null);
                if (idx >= 0)
                    data[idx].idExcepcionTarifa = rIndex;
            };
            let idDocente = $(e.currentTarget).attr("keyDocente");
            let idCurso = $(e.currentTarget).attr("keyCurso");
            const item = data.find(x => x.idDocente == idDocente && x.idCurso == idCurso);
            this.abrirModalRegistro(item);
            return false;
        });
        this.tblDocentes.on("click", ".eliminar-docente", (e) => {
            this.dataTable.row(e.currentTarget.closest("tr")).remove().draw();
            var count = this.tblDocentes.DataTable().data().count();
            if (count <= 0) {
                $("#frmExcepcionTarifa #organizacion, #frmExcepcionTarifa #periodo").prop("disabled", false);
            }
        });
        this.contentCardsMobile.on("click", ".eliminar", (e) => {
            const data = this.tblDocentes.DataTable().rows().data().toArray();
            const idDocente = $(e.currentTarget).attr("keyDocente");
            let idCurso = $(e.currentTarget).attr("keyCurso");
            const item = data.findIndex(x => x.idDocente == idDocente && x.idCurso == idCurso);
            this.tblDocentes.DataTable().row(item).remove().draw();
            this.cargarMobile();
            var count = this.tblDocentes.DataTable().data().count();
            if (count <= 0) {
                $("#frmExcepcionTarifa #organizacion, #frmExcepcionTarifa #periodo").prop("disabled", false);
            }
        });
        this.organizacion.on("change", () => {
            this.docente.typeahead('val', '');
            this.curso.typeahead('val', '');
            if (this.organizacion.val().trim() != '') {
                this.periodoAcademico.find('option').not(':first').remove();
                const organizacion = this.organizacion.val();
                if (organizacion == null || organizacion.trim() === '') return false;
                this.listarPeriodosPorOrganizacion();
            }
            else {
                this.periodoAcademico.empty().append(Constantes.Select.OpcionSeleccione).val('');
            }
        });
        this.periodoAcademico.on("change", () => {
            this.docente.typeahead('val', '');
            this.curso.typeahead('val', '');
        });
        this.tarifa.keydown(function (e) {
            var match = $(this).val().match(/\./g);
            if (match != null) {
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                else if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && (e.keyCode == 190)) {
                    e.preventDefault();
                }
            }
            else {
                if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    return;
                }
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            }
        });
        this.tarifa.keyup(function () {
            if ($(this).val().indexOf('.') != -1) {
                if ($(this).val().split(".")[1].length > 2) {
                    if (isNaN(parseFloat(this.value))) return;
                    this.value = parseFloat(this.value).toFixed(2);
                }
            }
        });
        this.docente.typeahead({
            hint: true,
            highlight: true,
            minLength: 3,
            limit: 20,
            cache: false,
        }, {
            displayKey: 'value',
            source: _docentesTypeaheadET.ttAdapter(),
            highlighter: function (item) {
                return item.split(_docentesSplitCharET)[0];
            }
        }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
            const docenteValueSplitted = $("#frmExcepcionTarifa #docente")?.val().split(_docentesSplitCharET);
            if (!docenteValueSplitted || docenteValueSplitted.length < 2) return;
            const docente = docenteValueSplitted[0];

            if (!_docentesRemoteET.some(x => x.docente == docente)) {
                _docentesRemoteET.push({
                    docente: docente,
                    nombre: docenteValueSplitted[1]
                });
                this.curso.typeahead('val', '');
            }
        });
        this.curso.typeahead({
            hint: true,
            highlight: true,
            minLength: 3,
            limit: 20,
            cache: false,
        }, {
            displayKey: 'value',
            source: _cursosTypeahead.ttAdapter(),
            highlighter: function (item) {
                return item.split(_cursosSplitCharET)[0];
            }
        }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
            const cursoValueSplitted = $("#frmExcepcionTarifa #curso")?.val().split(_cursosSplitCharET);
            if (!cursoValueSplitted || cursoValueSplitted.length < 2) return;
            const curso = cursoValueSplitted[0];

            if (!_cursosRemoteET.some(x => x.curso == curso)) _cursosRemoteET.push({
                curso: curso,
                nombre: cursoValueSplitted[1]
            });
        });
        this.listarOrganizaciones();
        this.cargarData(data, esEdicion, true);
    }

    abrirModalRegistro(item) {
        if (this.excepcionTarifaEdit)
            this.excepcionTarifaEdit.cargarData(item);
        else {
            new UtilService().obtenerHtml("WkExcepcionTarifa/_Create", (html) => {
                this.frmAccion.after(html);
                this.excepcionTarifaEdit = new ExcepcionTarifaCreate();
                this.excepcionTarifaEdit.configurarVentana(item, (data) => {
                    this.cargarMobile();
                });
            });
        }
    }

    listarOrganizaciones() {
        new ExcepcionTarifaService().listarOrganizacion({}, (response) => {
            response.lista.forEach(x => {
                $("#frmExcepcionTarifa #organizacion").append(`<option value="${x.key}">${x.value}</option>`);
            });
        });
    }

    listarPeriodosPorOrganizacion() {
        let filtroOrganizacion = this.organizacion.val();
        this.periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
            for (let x of response) {
                this.periodoAcademico.append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    }

    cargarMobile(response) {
        if (!response)
            response = this.tblDocentes.DataTable().rows().data().toArray();
        Mobile.generarCard(response, 1, (data) => {
            this.contentCardsMobile.html('');
            if (data.length === 0) {
                // Mostrar un mensaje si no hay datos
                this.contentCardsMobile.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                return; // Salir de la función si no hay datos
            }
            data.forEach((item, index) => {
                const actions = (this.esEdicion ? `<div>
                    <button class="btn btn-action-card float-end eliminar" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"><i class="fas fa-trash-alt" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"></i></button>
                    <button class="btn btn-action-card float-end editar" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"><i class="fas fa-pencil-alt" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"></i></button>
                </div>`: '');
                let card = `<div class="mobile-card">
                ${actions}
                <div>
                    <span>Organización:</span>
                    <span>${item.organizacion}</span>
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
                    <span>Docente:</span>
                    <span>${item.docente}</span>
                </div>
                <div>
                    <span>Curso:</span>
                    <span>${item.idCurso} - ${item.curso}</span>
                </div>
                    </div>`;
                this.contentCardsMobile.append(card);
            });
        });
    }

    excepcionTarifaDataTable() {
        this.dataTable.clear().draw();
    }

    resetFormState() {
        this.frmAccion.find(".was-validated").removeClass("was-validated");
        this.frmAccion[0].reset();
        this.btnIndividual.click();
        this.organizacion.trigger('change');
        this.excepcionTarifaDataTable();
        this.organizacion.prop("disabled", false);
        this.periodoAcademico.prop("disabled", false);
    }
}