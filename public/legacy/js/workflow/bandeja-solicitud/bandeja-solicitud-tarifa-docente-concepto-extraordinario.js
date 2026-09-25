$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const _docentesRemoteTDCE = [];
const _docentesSplitCharTDCE = ' - ';

const _docentesTypeaheadTDCE = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: URL_BASE + 'WkTarifaDocenteConceptoExtraordinario/buscarDocentesAd?',
        replace: function (url, query) {
            const periodoValue = $("#frmTarifaDocenteConceptoExtraordinario #periodo option:selected").val().trim();
            return url + 'query=' + query.toUpperCase() + '&periodoAcademico=' + (periodoValue == '' ? periodoValue : $("#frmTarifaDocenteConceptoExtraordinario #periodo option:selected").text()) +
                '&organizacion=' + $("#frmTarifaDocenteConceptoExtraordinario #organizacion option:selected").val();
        },
        wildcard: '%QUERY',
        filter: _docentesTypeaheadTDCE => $.map(_docentesTypeaheadTDCE, option => ({
            value: option.docenteAD + _docentesSplitCharTDCE + option.displayName
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_docentesTypeaheadTDCE.initialize();

class BandejaSolicitudTarifaDocenteConceptoExtraordinario {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#tarifaDocenteConceptoExtraordinarioModal"));
        this.idWorkflow = $("#frmTarifaDocenteConceptoExtraordinario #IdWorkflow");
        this.idFaseWorkflow = $("#frmTarifaDocenteConceptoExtraordinario #IdFaseWorkflow");
        this.solicitante = $("#frmTarifaDocenteConceptoExtraordinario #Solicitante");
        this.fechaCreacion = $("#frmTarifaDocenteConceptoExtraordinario #FechaCreacion");
        this.idSolicitud = $("#frmTarifaDocenteConceptoExtraordinario #IdSolicitud");
        this.identificador = $("#frmTarifaDocenteConceptoExtraordinario #Identificador");
        this.titulo = $("#frmTarifaDocenteConceptoExtraordinario #tarifaDocenteConceptoExtraordinarioModalTitulo");

        this.evaluador = $("#frmTarifaDocenteConceptoExtraordinario #Evaluador");
        this.estadoSolicitud = $("#frmTarifaDocenteConceptoExtraordinario #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmTarifaDocenteConceptoExtraordinario #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmTarifaDocenteConceptoExtraordinario #ComentarioAtencion");
        this.inputAdjunto = $("#frmTarifaDocenteConceptoExtraordinario #inputAdjuntoModal");
        this.labelAdjunto = $("#frmTarifaDocenteConceptoExtraordinario #inputLabelModal");
        this.organizacion = $("#frmTarifaDocenteConceptoExtraordinario #organizacion");
        this.periodoAcademico = $("#frmTarifaDocenteConceptoExtraordinario #periodo");
        this.fechaTermino = $("#frmTarifaDocenteConceptoExtraordinario #fechaTermino");
        this.concepto = $("#frmTarifaDocenteConceptoExtraordinario #concepto");
        this.centroCosto = $("#frmTarifaDocenteConceptoExtraordinario #centroCosto");
        this.docente = $("#frmTarifaDocenteConceptoExtraordinario #docente");
        this.tarifa = $("#frmTarifaDocenteConceptoExtraordinario #tarifa");
        this.tblDocentes = $("#frmTarifaDocenteConceptoExtraordinario #tarifaDocenteTable");
        this.contentCardsMobile = $("#frmTarifaDocenteConceptoExtraordinario #contentCards-tarifaDocente");
        this.btnAgregar = $("#frmTarifaDocenteConceptoExtraordinario #btnAgregarModal");
        this.btnIndividual = $("#frmTarifaDocenteConceptoExtraordinario #btnIndividualModal");
        this.btnMasivo = $("#frmTarifaDocenteConceptoExtraordinario #btnMasivoModal");
        this.frmAccion = $("#frmTarifaDocenteConceptoExtraordinario");
        this.btnCargarAdjunto = $("#frmTarifaDocenteConceptoExtraordinario #btnCargarAdjuntoModal");
        this.btnExportar = $("#frmTarifaDocenteConceptoExtraordinario #btnExportar");
        this.btnGuardar = $("#frmTarifaDocenteConceptoExtraordinario #btnGuardar");
        this.btnFormato = $("#frmTarifaDocenteConceptoExtraordinario #btnFormato");
        this.model = null;
        this.tarifaDocenteEdit = null;
        this.esEdicion = false;
        this.organizacion.prepend(Constantes.Select.OpcionSeleccione);
        this.periodoAcademico.prepend(Constantes.Select.OpcionSeleccione);
        this.concepto.prepend(Constantes.Select.OpcionSeleccione);
        this.centroCosto.prepend(Constantes.Select.OpcionSeleccione);
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
                { data: "idTarifaDocenteConceptoExtraordinario", title: "idTarifaDocenteConceptoExtraordinario", visible: false },
                { data: "idOrganizacion", title: "idOrganizacion", visible: false },
                { data: "idPeriodoAcademico", title: "idPeriodoAcademico", visible: false },
                { data: "idDocente", title: "idDocente", visible: false },
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
                { data: "docente", title: "Docente" },
                {
                    data: "tarifa", title: "Tarifa",
                    render: (data) => {
                        return "S/. " + data
                    }
                },
                {
                    data: "fechaTermino", title: "Fecha Término",
                    render: (data) => {
                        return data ? Util.formatearFechaAsString(data) : ""
                    }
                },
                { data: "concepto", title: "Concepto" },
                { data: "centroCosto", title: "Centro Costo" },
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
        let divAcciones = $("#frmTarifaDocenteConceptoExtraordinario .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmTarifaDocenteConceptoExtraordinario #divMotivoRechazoSolicitud");
        this.resetFormState();
        this.esEdicion = esEdicion;
        if (esEdicion) {
            this.titulo.text("Edición de Solicitud");
            divAcciones.removeClass("d-none");
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual-copia, #frmTarifaDocenteConceptoExtraordinario .div-opciones-tarifa').removeClass('d-none');
            $(".edit-control").prop("disabled", false);
            this.tblDocentes.DataTable().column(12).visible(true);
        } else {
            this.titulo.text("Consulta de Solicitud");
            divAcciones.addClass("d-none");
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual-copia, #frmTarifaDocenteConceptoExtraordinario .div-opciones-tarifa').addClass('d-none');
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual').addClass('d-none');
            $('#frmTarifaDocenteConceptoExtraordinario .div-masivo').addClass('d-none');
            $(".edit-control").prop("disabled", true);
            this.tblDocentes.DataTable().column(12).visible(false);
        }
        new SolicitudService().obtenerParticipadosPorId2(solicitud.idSolicitud, false, (response) => {
            debugger
            solicitud = response.solicitud;
            const docentes = response.tarifaDocenteConceptoExtraordinario;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));

            if (docentes.length > 0) {
                this.organizacion.val(solicitud.organizacion);
                this.organizacion.trigger('change');
                const nombreOrganizacion = this.organizacion.find('option:selected').text();
                docentes.forEach(item => {
                    let row = new Object();
                    row.idTarifaDocenteConceptoExtraordinario = item.idTarifaDocenteConceptoExtraordinario;
                    row.idOrganizacion = solicitud.organizacion;
                    row.idPeriodoAcademico = solicitud.idPeriodoAcademico;
                    row.idDocente = item.idDocente;
                    row.docente = item.docente;
                    row.organizacion = nombreOrganizacion;
                    row.periodo = `${solicitud.periodoAcademico.academicYear + '-' + (solicitud.organizacion == 'ESC' ? solicitud.periodoAcademico?.academicSession : solicitud.periodoAcademico?.academicTerm)}`;
                    row.tarifa = item.tarifa;
                    row.fechaTermino = item.fechaTermino;
                    row.concepto = item.concepto;
                    row.centroCosto = item.centroCosto;
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
                    request.nombrePeriodo = data.periodo;
                }
                new TarifaDocenteConceptoExtraordinarioService().procesar(request, (response) => {
                    if (response.lista.length > 0) {
                        for (let row of response.lista) {
                            this.tblDocentes.DataTable().row.add(row).draw();
                        }
                        MessageBox.alert('Operación correcta', 'Documento procesado correctamente', 'success', true, false, function () {
                            $("#frmTarifaDocenteConceptoExtraordinario #inputAdjuntoModal").val(null);
                            $("#frmTarifaDocenteConceptoExtraordinario #inputLabelModal").text(labelSave);
                            if (!$("#frmTarifaDocenteConceptoExtraordinario #organizacion").is(':disabled')) {
                                $("#frmTarifaDocenteConceptoExtraordinario #organizacion").val(response.idOrganizacion);
                                for (let x of response.lstPeriodos) {
                                    $("#frmTarifaDocenteConceptoExtraordinario #periodo").append($("<option></option>").attr("value", x.key).text(x.value));
                                }
                                $("#frmTarifaDocenteConceptoExtraordinario #periodo").val(response.idPeriodoAcademico);
                                $("#frmTarifaDocenteConceptoExtraordinario #organizacion, #frmTarifaDocenteConceptoExtraordinario #periodo").prop("disabled", true);
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
        this.btnFormato.attr("href", URL_BASE + "WkSolicitud/DescargaFormato?key=" + Constantes.Workflow.TarifaDeDocenteConceptoExtraordinario);
        this.btnCargarAdjunto.on("click", () => {
            this.inputAdjunto.click();
        });
        this.btnIndividual.on("click", (e) => {
            e.preventDefault();
            this.btnMasivo.removeClass('active');
            this.btnIndividual.addClass('active');
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual-copia').removeClass('d-none');
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual').removeClass('d-none');
            $('#frmTarifaDocenteConceptoExtraordinario .div-masivo').addClass('d-none');
        });
        this.btnMasivo.on("click", (e) => {
            e.preventDefault();
            this.btnMasivo.addClass('active');
            this.btnIndividual.removeClass('active');
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual-copia').addClass('d-none');
            $('#frmTarifaDocenteConceptoExtraordinario .div-individual').addClass('d-none');
            $('#frmTarifaDocenteConceptoExtraordinario .div-masivo').removeClass('d-none');
        });
        this.btnAgregar.on("click", (e) => {
            let docenteValue = this.docente.val();
            let tarifaValue = this.tarifa.val();

            if (docenteValue == null || docenteValue.trim() === '') {
                MessageBox.error('Debe seleccionar un Docente');
                return false;
            }

            if (tarifaValue == null || tarifaValue.trim() === '') {
                MessageBox.error('Debe ingresar una tarifa');
                return false;
            } else if (parseFloat(tarifaValue).toFixed(2) == 0) {
                MessageBox.error('Ingrese una tarifa mayor a cero');
                return false;
            }

            const docenteValueSplitted = docenteValue.split(_docentesSplitCharTDCE);
            if (docenteValueSplitted?.length < 2) {
                MessageBox.error('Docente no válido');
                return false;
            }

            const docente = docenteValueSplitted[0];
            const docenteRemote = _docentesRemoteTDCE.filter(x => x.docente == docente)?.[0];
            if (!docenteRemote) {
                MessageBox.error('Docente no válido');
                return false;
            }

            let docentes = this.tblDocentes.DataTable().rows().data().toArray();
            if (docentes.findIndex(x => x.idDocente === docente) >= 0) {
                MessageBox.showMessenger('El docente ya está asignado', 'warning', 'Docente Duplicado');
            } else {
                let row = new Object();
                row.idTarifaDocenteConceptoExtraordinario = null;
                row.idOrganizacion = $("#frmTarifaDocenteConceptoExtraordinario #organizacion option:selected").val();
                row.idDocente = docente;
                row.idPeriodoAcademico = $("#frmTarifaDocenteConceptoExtraordinario #periodo option:selected").val();
                row.organizacion = $("#frmTarifaDocenteConceptoExtraordinario #organizacion option:selected").text();
                row.periodo = $("#frmTarifaDocenteConceptoExtraordinario #periodo option:selected").text();
                row.docente = docenteRemote.nombre || '';
                row.tarifa = this.tarifa.val();
                row.fechaTermino = this.fechaTermino.val();
                row.concepto = $("#frmTarifaDocenteConceptoExtraordinario #concepto option:selected").val();
                row.centroCosto = $("#frmTarifaDocenteConceptoExtraordinario #centroCosto option:selected").val();
                this.tblDocentes.DataTable().row.add(row).draw();
                this.cargarMobile();
                this.organizacion.prop("disabled", true);
                this.periodoAcademico.prop("disabled", true);
                this.docente.val('');
                this.tarifa.val('');
            }
            return false;
        });
        this.btnGuardar.on("click", () => {
            let docentes = this.tblDocentes.DataTable().rows().data().toArray();

            if (docentes.length == 0) {
                MessageBox.error('Debe ingresar por lo menos un docente');
                return;
            }
            let tarifaDocente = {
                Comentario: this.model.solicitud.comentarioAtencion || ' ',
                idSolicitud: this.model.solicitud.idSolicitud,
                NombreOrganizacion: $("#frmTarifaDocenteConceptoExtraordinario #organizacion option:selected").text(),
                NombrePeriodoAcademico: $("#frmTarifaDocenteConceptoExtraordinario #periodo option:selected").text(),
                Docentes: docentes
            };
            new SolicitudService().actualizarTarifaDocenteConceptoExtraordinario(tarifaDocente, (response) => {
                callback(true);
                MessageBox.info('Registros guardado correctamente');
                this.modal.hide();
            }, true, false);
        });
        this.tblDocentes.on("click", ".editar", (e) => {
            const key = e.currentTarget.closest("td");
            var data = this.tblDocentes.DataTable().row(key).data();
            if (!data.idTarifaDocenteConceptoExtraordinario) {
                const index = this.tblDocentes.DataTable().row(key).index();
                data.idTarifaDocenteConceptoExtraordinario = index;
            }
            this.abrirModalRegistro(data);
        });
        this.contentCardsMobile.on("click", ".editar", (e) => {
            let data = this.tblDocentes.DataTable().rows().data().toArray();
            let rowsCount = this.tblDocentes.DataTable().rows().data().count();
            for (let rIndex = 0; rIndex < rowsCount; rIndex++) {
                const item = this.tblDocentes.DataTable().rows(rIndex).data();
                let idx = data.findIndex(x => x.idDocente == item[0].idDocente && x.idTarifaDocenteConceptoExtraordinario == null);
                if (idx >= 0)
                    data[idx].idTarifaDocenteConceptoExtraordinario = rIndex;
            };
            let idDocente = $(e.currentTarget).attr("key");
            const item = data.find(x => x.idDocente == idDocente);
            this.abrirModalRegistro(item);
            return false;
        });
        this.tblDocentes.on("click", ".eliminar-docente", (e) => {
            this.dataTable.row(e.currentTarget.closest("tr")).remove().draw();
            var count = this.tblDocentes.DataTable().data().count();
            if (count <= 0) {
                $("#frmTarifaDocenteConceptoExtraordinario #organizacion, #frmTarifaDocenteConceptoExtraordinario #periodo").prop("disabled", false);
            }
        });
        this.contentCardsMobile.on("click", ".eliminar", (e) => {
            const data = this.tblDocentes.DataTable().rows().data().toArray();
            const idDocente = $(e.currentTarget).attr("key");
            const item = data.findIndex(x => x.idDocente == idDocente);
            this.tblDocentes.DataTable().row(item).remove().draw();
            this.cargarMobile();
            var count = this.tblDocentes.DataTable().data().count();
            if (count <= 0) {
                $("#frmTarifaDocenteConceptoExtraordinario #organizacion, #frmTarifaDocenteConceptoExtraordinario #periodo").prop("disabled", false);
            }
        });
        this.organizacion.on("change", () => {
            this.docente.typeahead('val', '');
            if (this.organizacion.val().trim() != '') {
                this.periodoAcademico.find('option').not(':first').remove();
                this.concepto.find('option').not(':first').remove();
                this.centroCosto.find('option').not(':first').remove();
                const organizacion = this.organizacion.val();
                if (organizacion == null || organizacion.trim() === '') return false;
                this.listarPeriodosPorOrganizacion();
                this.listarConceptos();
            }
            else {
                this.periodoAcademico.empty().append(Constantes.Select.OpcionSeleccione).val('');
                this.concepto.empty().append(Constantes.Select.OpcionSeleccione).val('');
                this.centroCosto.empty().append(Constantes.Select.OpcionSeleccione).val('');
            }
        });
        this.periodoAcademico.on("change", () => {
            this.docente.typeahead('val', '');
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
            source: _docentesTypeaheadTDCE.ttAdapter(),
            highlighter: function (item) {
                return item.split(_docentesSplitCharTDCE)[0];
            }
        }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
            const docenteValueSplitted = $("#frmTarifaDocenteConceptoExtraordinario #docente")?.val().split(_docentesSplitCharTDCE);
            if (!docenteValueSplitted || docenteValueSplitted.length < 2) return;
            const docente = docenteValueSplitted[0];

            if (!_docentesRemoteTDCE.some(x => x.docente == docente)) _docentesRemoteTDCE.push({
                docente: docente,
                nombre: docenteValueSplitted[1]
            });
        });
        this.listarOrganizaciones();
        this.cargarData(data, esEdicion, true);
    }

    abrirModalRegistro(item) {
        if (this.tarifaDocenteEdit)
            this.tarifaDocenteEdit.cargarData(item);
        else {
            new UtilService().obtenerHtml("WkTarifaDocenteConceptoExtraordinario/_Create", (html) => {
                this.frmAccion.after(html);
                this.tarifaDocenteEdit = new TarifaDocenteCreate();
                this.tarifaDocenteEdit.configurarVentana(item, (data) => {
                    this.cargarMobile();
                });
            });
        }
    }

    listarOrganizaciones() {
        new TarifaDocenteConceptoExtraordinarioService().listarOrganizacion({}, (response) => {
            response.lista.forEach(x => {
                $("#frmTarifaDocenteConceptoExtraordinario #organizacion").append(`<option value="${x.key}">${x.value}</option>`);
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

    listarConceptos() {
        // This method should populate the concepto and centroCosto dropdowns
        // For now, I'll add some dummy data - you may need to implement the actual service call
        this.concepto.append(`<option value="1">Concepto 1</option>`);
        this.concepto.append(`<option value="2">Concepto 2</option>`);
        this.centroCosto.append(`<option value="CC001">Centro Costo 1</option>`);
        this.centroCosto.append(`<option value="CC002">Centro Costo 2</option>`);
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
                    <button class="btn btn-action-card float-end eliminar" key="${item.idDocente}"><i class="fas fa-trash-alt" key="${item.idDocente}"></i></button>
                    <button class="btn btn-action-card float-end editar" key="${item.idDocente}"><i class="fas fa-pencil-alt" key="${item.idDocente}"></i></button>
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
                    <span>Fecha Término:</span>
                    <span>${item.fechaTermino ? Util.formatearFechaAsString(item.fechaTermino) : ""}</span>
                </div>
                <div>
                    <span>Concepto:</span>
                    <span>${item.concepto}</span>
                </div>
                <div>
                    <span>Centro Costo:</span>
                    <span>${item.centroCosto}</span>
                </div>
                <div>
                    <span>Docente:</span>
                    <span>${item.docente}</span>
                </div>
                    </div>`;
                this.contentCardsMobile.append(card);
            });
        });
    }

    tarifaDocenteDataTable() {
        this.dataTable.clear().draw();
    }

    resetFormState() {
        this.frmAccion.find(".was-validated").removeClass("was-validated");
        this.frmAccion[0].reset();
        this.btnIndividual.click();
        this.organizacion.trigger('change');
        this.tarifaDocenteDataTable();
        this.organizacion.prop("disabled", false);
        this.periodoAcademico.prop("disabled", false);
    }
}