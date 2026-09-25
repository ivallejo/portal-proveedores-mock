$(document).ready(function () {
    $.validator.unobtrusive.parse(this);
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });
});

const _docentesRemoteTD = [];
const _docentesSplitCharTD = ' - ';

const _docentesTypeaheadTD = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: URL_BASE + 'WkTarifaDocente/buscarDocentesAd?',
        replace: function (url, query) {
            const periodoValue = $("#frmTarifaDocente #periodo option:selected").val().trim();
            return url + 'query=' + query.toUpperCase() + '&periodoAcademico=' + (periodoValue == '' ? periodoValue : $("#frmTarifaDocente #periodo option:selected").text()) +
                '&organizacion=' + $("#frmTarifaDocente #organizacion option:selected").val();
        },
        wildcard: '%QUERY',
        filter: _docentesTypeaheadTD => $.map(_docentesTypeaheadTD, option => ({
            value: option.docenteAD + _docentesSplitCharTD + option.displayName
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_docentesTypeaheadTD.initialize();

class BandejaSolicitudTarifaDocente {
    constructor() {
        this.modal = new bootstrap.Offcanvas($("#tarifaDocenteModal"));
        this.idWorkflow = $("#frmTarifaDocente #IdWorkflow");
        this.idFaseWorkflow = $("#frmTarifaDocente #IdFaseWorkflow");
        this.solicitante = $("#frmTarifaDocente #Solicitante");
        this.fechaCreacion = $("#frmTarifaDocente #FechaCreacion");
        this.idSolicitud = $("#frmTarifaDocente #IdSolicitud");
        this.identificador = $("#frmTarifaDocente #Identificador");
        this.titulo = $("#frmTarifaDocente #tarifaDocenteModalTitulo");

        this.evaluador = $("#frmTarifaDocente #Evaluador");
        this.estadoSolicitud = $("#frmTarifaDocente #EstadoSolicitud");
        this.motivoRechazoSolicitud = $("#frmTarifaDocente #MotivoRechazoSolicitud");
        this.comentarioAtencion = $("#frmTarifaDocente #ComentarioAtencion");
        this.inputAdjunto = $("#frmTarifaDocente #inputAdjuntoModal");
        this.labelAdjunto = $("#frmTarifaDocente #inputLabelModal");
        this.organizacion = $("#frmTarifaDocente #organizacion");
        this.periodoAcademico = $("#frmTarifaDocente #periodo");
        this.docente = $("#frmTarifaDocente #docente");
        this.tarifa = $("#frmTarifaDocente #tarifa");
        this.tblDocentes = $("#frmTarifaDocente #tarifaDocenteTable");
        this.contentCardsMobile = $("#frmTarifaDocente #contentCards-tarifaDocente");
        this.btnAgregar = $("#frmTarifaDocente #btnAgregarModal");
        this.btnIndividual = $("#frmTarifaDocente #btnIndividualModal");
        this.btnMasivo = $("#frmTarifaDocente #btnMasivoModal");
        this.frmAccion = $("#frmTarifaDocente");
        this.btnCargarAdjunto = $("#frmTarifaDocente #btnCargarAdjuntoModal");
        this.btnExportar = $("#frmTarifaDocente #btnExportar");
        this.btnGuardar = $("#frmTarifaDocente #btnGuardar");
        this.btnFormato = $("#frmTarifaDocente #btnFormato");
        this.model = null;
        this.tarifaDocenteEdit = null;
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
                { data: "idTarifaDocente", title: "idTarifaDocente", visible: false },
                { data: "idOrganizacion", title: "idOrganizacion", visible: false },
                { data: "idPeriodoAcademico", title: "idPeriodoAcademico", visible: false },
                { data: "idDocente", title: "idDocente", visible: false },
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
        let divAcciones = $("#frmTarifaDocente .divAcciones");
        let divMotivoRechazoSolicitud = $("#frmTarifaDocente #divMotivoRechazoSolicitud");
        this.resetFormState();
        this.esEdicion = esEdicion;
        if (esEdicion) {
            this.titulo.text("Edición de Solicitud");
            divAcciones.removeClass("d-none");
            $('#frmTarifaDocente .div-individual-copia, #frmTarifaDocente .div-opciones-tarifa').removeClass('d-none');
            $(".edit-control").prop("disabled", false);
            this.tblDocentes.DataTable().column(9).visible(true);
        } else {
            this.titulo.text("Consulta de Solicitud");
            divAcciones.addClass("d-none");
            $('#frmTarifaDocente .div-individual-copia, #frmTarifaDocente .div-opciones-tarifa').addClass('d-none');
            $('#frmTarifaDocente .div-individual').addClass('d-none');
            $('#frmTarifaDocente .div-masivo').addClass('d-none');
            $(".edit-control").prop("disabled", true);
            this.tblDocentes.DataTable().column(9).visible(false);
        }
        new SolicitudService().obtenerParticipadosPorId(solicitud.idSolicitud, (response) => {
            solicitud = response.solicitud;
            const docentes = response.tarifaDocente;
            this.model = response;
            this.solicitante.val(response.solicitud.nombreSolicitante.toLowerCase());
            this.fechaCreacion.val(Util.formatearFechaHoraAsString(response.solicitud.fechaCreacion));

            if (docentes.length > 0) {
                this.organizacion.val(solicitud.organizacion);
                this.organizacion.trigger('change');
                const nombreOrganizacion = this.organizacion.find('option:selected').text();
                docentes.forEach(item => {
                    let row = new Object();
                    row.idTarifaDocente = null;
                    row.idOrganizacion = solicitud.organizacion;
                    row.idPeriodoAcademico = solicitud.idPeriodoAcademico;
                    row.idDocente = item.idDocente;
                    row.docente = item.docente;
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
                new TarifaDocenteService().procesar(request, (response) => {
                    if (response.lista.length > 0) {
                        for (let row of response.lista) {
                            this.tblDocentes.DataTable().row.add(row).draw();
                        }
                        MessageBox.alert('Operación correcta', 'Documento procesado correctamente', 'success', true, false, function () {
                            $("#frmTarifaDocente #inputAdjuntoModal").val(null);
                            $("#frmTarifaDocente #inputLabelModal").text(labelSave);
                            if (!$("#frmTarifaDocente #organizacion").is(':disabled')) {
                                $("#frmTarifaDocente #organizacion").val(response.idOrganizacion);
                                for (let x of response.lstPeriodos) {
                                    $("#frmTarifaDocente #periodo").append($("<option></option>").attr("value", x.key).text(x.value));
                                }
                                $("#frmTarifaDocente #periodo").val(response.idPeriodoAcademico);
                                $("#frmTarifaDocente #organizacion, #frmTarifaDocente #periodo").prop("disabled", true);
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
        this.btnFormato.attr("href", URL_BASE + "WkSolicitud/DescargaFormato?key=" + Constantes.Workflow.TarifaDocentes);
        this.btnCargarAdjunto.on("click", () => {
            this.inputAdjunto.click();
        });
        this.btnIndividual.on("click", (e) => {
            e.preventDefault();
            this.btnMasivo.removeClass('active');
            this.btnIndividual.addClass('active');
            $('#frmTarifaDocente .div-individual-copia').removeClass('d-none');
            $('#frmTarifaDocente .div-individual').removeClass('d-none');
            $('#frmTarifaDocente .div-masivo').addClass('d-none');
        });
        this.btnMasivo.on("click", (e) => {
            e.preventDefault();
            this.btnMasivo.addClass('active');
            this.btnIndividual.removeClass('active');
            $('#frmTarifaDocente .div-individual-copia').addClass('d-none');
            $('#frmTarifaDocente .div-individual').addClass('d-none');
            $('#frmTarifaDocente .div-masivo').removeClass('d-none');
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

            const docenteValueSplitted = docenteValue.split(_docentesSplitCharTD);
            if (docenteValueSplitted?.length < 2) {
                MessageBox.error('Docente no válido');
                return false;
            }

            const docente = docenteValueSplitted[0];
            const docenteRemote = _docentesRemoteTD.filter(x => x.docente == docente)?.[0];
            if (!docenteRemote) {
                MessageBox.error('Docente no válido');
                return false;
            }

            let docentes = this.tblDocentes.DataTable().rows().data().toArray();
            if (docentes.findIndex(x => x.idDocente === docente) >= 0) {
                MessageBox.showMessenger('El docente ya está asignado', 'warning', 'Docente Duplicado');
            } else {
                let row = new Object();
                row.idTarifaDocente = null;
                row.idOrganizacion = $("#frmTarifaDocente #organizacion option:selected").val();
                row.idDocente = docente;
                row.idPeriodoAcademico = $("#frmTarifaDocente #periodo option:selected").val();
                row.organizacion = $("#frmTarifaDocente #organizacion option:selected").text();
                row.periodo = $("#frmTarifaDocente #periodo option:selected").text();
                row.docente = docenteRemote.nombre || '';
                row.tarifa = this.tarifa.val();
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
                NombreOrganizacion: $("#frmTarifaDocente #organizacion option:selected").text(),
                NombrePeriodoAcademico: $("#frmTarifaDocente #periodo option:selected").text(),
                Docentes: docentes
            };
            new SolicitudService().actualizarTarifaDocente(tarifaDocente, (response) => {
                callback(true);
                MessageBox.info('Registros guardado correctamente');
                this.modal.hide();
            }, true, false);
        });
        this.tblDocentes.on("click", ".editar", (e) => {
            const key = e.currentTarget.closest("td");
            var data = this.tblDocentes.DataTable().row(key).data();
            if (!data.idTarifaDocente) {
                const index = this.tblDocentes.DataTable().row(key).index();
                data.idTarifaDocente = index;
            }
            this.abrirModalRegistro(data);
        });
        this.contentCardsMobile.on("click", ".editar", (e) => {
            let data = this.tblDocentes.DataTable().rows().data().toArray();
            let rowsCount = this.tblDocentes.DataTable().rows().data().count();
            for (let rIndex = 0; rIndex < rowsCount; rIndex++) {
                const item = this.tblDocentes.DataTable().rows(rIndex).data();
                let idx = data.findIndex(x => x.idDocente == item[0].idDocente && x.idTarifaDocente == null);
                if (idx >= 0)
                    data[idx].idTarifaDocente = rIndex;
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
                $("#frmTarifaDocente #organizacion, #frmTarifaDocente #periodo").prop("disabled", false);
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
                $("#frmTarifaDocente #organizacion, #frmTarifaDocente #periodo").prop("disabled", false);
            }
        });
        this.organizacion.on("change", () => {
            this.docente.typeahead('val', '');
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
            source: _docentesTypeaheadTD.ttAdapter(),
            highlighter: function (item) {
                return item.split(_docentesSplitCharTD)[0];
            }
        }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
            const docenteValueSplitted = $("#frmTarifaDocente #docente")?.val().split(_docentesSplitCharTD);
            if (!docenteValueSplitted || docenteValueSplitted.length < 2) return;
            const docente = docenteValueSplitted[0];

            if (!_docentesRemoteTD.some(x => x.docente == docente)) _docentesRemoteTD.push({
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
            new UtilService().obtenerHtml("WkTarifaDocente/_Create", (html) => {
                this.frmAccion.after(html);
                this.tarifaDocenteEdit = new TarifaDocenteCreate();
                this.tarifaDocenteEdit.configurarVentana(item, (data) => {
                    this.cargarMobile();
                });
            });
        }
    }

    listarOrganizaciones() {
        new TarifaDocenteService().listarOrganizacion({}, (response) => {
            response.lista.forEach(x => {
                $("#frmTarifaDocente #organizacion").append(`<option value="${x.key}">${x.value}</option>`);
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