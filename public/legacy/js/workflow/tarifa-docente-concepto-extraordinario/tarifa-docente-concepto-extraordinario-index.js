$(document).ready(function () {
    const periodoAcademicoService = new PeriodoAcademicoService();
    let tarifaDocenteModal = null;
    let divContent = $("#divContent");
    let selectorOrganizacion = "#organizacion";
    let selectorPeriodo = "#periodo";
    let selectorFechaTermino = "#fechaTermino";
    let selectorConcepto = "#concepto";
    let selectorCentroCosto = "#centroCosto";
    let tblDocentes = "#tarifaDocenteTable";
    let campoDocente = $("#docente");
    let campoTarifa = $("#tarifa");
    let campoComentario = $("#comentario");
    let btnGuardar = $("#btnGuardar");
    let btnAgregar = $("#btnAgregar");
    let contentCardsMobile = $("#contentCards-tarifaDocente");
    let contentCardsMobileAnt = $("#contentCards-tarifaDocenteAnterior");
    let tblDocentesAnt = $("#docenteAnteriorTable");
    const $form = $('#frmUpload');
    const $btnSubir = $form.find('button[name="btn-subir"]').first();
    const $fileDocumentos = $form.find('input[name="documentos"]').first();
    const $btnFormato = $('#btnFormato');
    $(selectorOrganizacion).prepend(Constantes.Select.OpcionSeleccione).val('');
    $(selectorPeriodo).prepend(Constantes.Select.OpcionSeleccione).val('');
    $(selectorConcepto).prepend(Constantes.Select.OpcionSeleccione).val('');
    $(selectorCentroCosto).prepend(Constantes.Select.OpcionSeleccione).val('');

    $('#concepto').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    $('#centroCosto').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    let dataTable = $(tblDocentes).DataTable({
        searching: false,
        paging: true,
        info: false,
        lengthChange: true,
        destroy: true,
        language: Util.obtenerLenguajeDataTable(),
        columns: [
            { data: "idTarifaDocente", title: "idTarifaDocente", visible: false },
            { data: "idOrganizacion", title: "idOrganizacion", visible: false },
            { data: "idPeriodoAcademico", title: "idPeriodoAcademico", visible: false },
            { data: "idDocente", title: "idDocente", visible: false },
            { data: "organizacion", title: "Organizacion", className: "no-mobile" },
            //{ data: "periodo", title: "Periodo" },
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
                    return data ? new Date(data).toLocaleDateString('es-ES') : '';
                }
            },
            { data: "concepto", title: "Concepto" },
            { data: "centroCosto", title: "Centro de Costo" },
            {
                className: 'td-accion text-center',
                title: '<span class="no-mobile">Acciones<span>',
                orderable: false,
                render: (data, type) => {
                    let acciones = "";
                    acciones += '<i class="fas fa-pencil-alt editar me-2"></i>';
                    acciones += '<i class="fas fa-trash eliminar-docente"></i>';
                    return acciones;
                }
            },
        ]
    });

    cargarMobile([]);
    cargarMobileAnt([]);

    // Cargar conceptos al inicio
    listarConceptos();

    // Cargar centros de costo cuando cambie la organización
    $(selectorOrganizacion).on("change", () => {
        campoDocente.typeahead('val', '');
        if ($(selectorOrganizacion).val().trim() != '') {
            $(selectorPeriodo).find('option').not(':first').remove();
            $(selectorCentroCosto).find('option').not(':first').remove();
            const organizacion = $(selectorOrganizacion).val();
            if (organizacion == null || organizacion.trim() === '') return false;
            listarPeriodosPorOrganizacion();
            listarCentroCostosPorOrganizacion(organizacion);
        }
        else {
            $(selectorPeriodo).empty().append(Constantes.Select.OpcionSeleccione).val('');
            $(selectorCentroCosto).empty().append(Constantes.Select.OpcionSeleccione).val('');
        }
    });
    
    $btnSubir.on('click', () => {
        $fileDocumentos.click();
    });

    $btnFormato.attr("href", URL_BASE + "WkSolicitud/DescargaFormato?key=" + Constantes.Workflow.TarifaDeDocenteConceptoExtraordinario);

    $fileDocumentos.on('change', () => {
        const labelSave = 'Subir un excel';
        var uploadFile = $fileDocumentos[0].files[0];
        let label = labelSave;
        if (uploadFile !== undefined) {
            let ext = uploadFile.name.split('.').pop().trim();
            if (ext !== "xls" && ext !== "xlsx") {
                $fileDocumentos.val(null);
                MessageBox.showMessenger("Documento adjunto inválido", 'error', 'Error');
                return;
            }
            label = uploadFile.name;
        }
        $form.find('[name="documentos-label"]').text(label);
        // Llama al servidor para procesar documento
        var data = $(tblDocentes).DataTable().row(0).data();
        let request = new Object();
        request.documento = uploadFile;
        if (data) {
            request.idOrganizacion = data.idOrganizacion;
            //request.idPeriodoAcademico = data.idPeriodoAcademico;
            request.nombrePeriodo = data.periodo;
        }
        new TarifaDocenteConceptoExtraordinarioService().procesar(request, (response) => {
            if (response.lista.length > 0) {
                for (let row of response.lista) {
                    $(tblDocentes).DataTable().row.add(row).draw();
                }
                MessageBox.alert('Operación correcta', 'Documento procesado correctamente', 'success', true, false, function () {
                    $form.get(0).reset();
                    $form.find('[name="documentos-label"]').text(labelSave);
                    if (!$(`${selectorOrganizacion}`).is(':disabled')) {
                        const org = $(selectorOrganizacion);
                        const per = $(selectorPeriodo);
                        org.val(response.idOrganizacion);
                        for (let x of response.lstPeriodos) {
                            per.append($("<option></option>").attr("value", x.key).text(x.value));
                        }
                        per.val(response.idPeriodoAcademico);
                        org.prop("disabled", true);
                        per.prop("disabled", true);
                    }
                });
                cargarMobile();
            }
        }, true, true);
        $form.get(0).reset();
    });

    $("#btnIndividual").on("click", (e) => {
        e.preventDefault();
        $("#btnMasivo, #btnCopiar").removeClass('active');
        $("#btnIndividual").addClass('active');
        $('.div-individual-copia').removeClass('d-none');
        $('.div-individual').removeClass('d-none');
        $('.div-masivo').addClass('d-none');
        btnAgregar.html("Agregar");
        const organizacion = $(selectorOrganizacion).val();
        if (organizacion == null || organizacion.trim() === '') return false;
        listarCentroCostosPorOrganizacion(organizacion);
    });
    $("#btnMasivo").on("click", (e) => {
        e.preventDefault();
        $("#btnIndividual, #btnCopiar").removeClass('active');
        $("#btnMasivo").addClass('active');
        $('.div-individual-copia').addClass('d-none');
        $('.div-individual').addClass('d-none');
        $('.div-masivo').removeClass('d-none');
    });
    $("#btnCopiar").on("click", (e) => {
        e.preventDefault();
        $("#btnIndividual, #btnMasivo").removeClass('active');
        $("#btnCopiar").addClass('active');
        $('.div-individual-copia').removeClass('d-none');
        $('.div-individual').addClass('d-none');
        $('.div-masivo').addClass('d-none');
        btnAgregar.html("Copiar");
    });

    btnAgregar.on("click", (e) => {
        const text = btnAgregar.text();
        if (text === "Agregar") {
            let docenteValue = campoDocente.val();
            let tarifaValue = campoTarifa.val();

            if (docenteValue == null || docenteValue.trim() === '') {
                MessageBox.error('Debe seleccionar un Docente');
                return false;
            }

            if ($(selectorFechaTermino).val() == null || $(selectorFechaTermino).val().trim() === '') {
                MessageBox.error('Debe seleccionar una fecha de término');
                return false;
            }

            if ($(selectorConcepto).val() == null || $(selectorConcepto).val().trim() === '') {
                MessageBox.error('Debe seleccionar un concepto');
                return false;
            }

            if ($(selectorCentroCosto).val() == null || $(selectorCentroCosto).val().trim() === '') {
                MessageBox.error('Debe seleccionar un centro de costo');
                return false;
            }

            if (tarifaValue == null || tarifaValue.trim() === '') {
                MessageBox.error('Debe ingresar una tarifa');
                return false;
            } else if (parseFloat(tarifaValue).toFixed(2) == 0) {
                MessageBox.error('Ingrese una tarifa mayor a cero');
                return false;
            }

            const docenteValueSplitted = docenteValue.split(_docentesSplitChar);
            if (docenteValueSplitted?.length < 2) {
                MessageBox.error('Docente no válido');
                return false;
            }

            const docente = docenteValueSplitted[0];
            const docenteRemote = _docentesRemote.filter(x => x.docente == docente)?.[0];
            if (!docenteRemote) {
                MessageBox.error('Docente no válido');
                return false;
            }

            let docentes = $(tblDocentes).DataTable().rows().data().toArray();
            if (docentes.findIndex(x => x.idDocente === docente) >= 0) {
                MessageBox.showMessenger('El docente ya está asignado', 'warning', 'Docente Duplicado');
            } else {
                let row = new Object();
                row.idTarifaDocente = null;
                row.idOrganizacion = $(selectorOrganizacion + " option:selected").val();
                row.idDocente = docente;
                row.idPeriodoAcademico = $(selectorPeriodo + " option:selected").val();
                row.organizacion = $(selectorOrganizacion + " option:selected").text();
                row.periodo = $(selectorPeriodo + " option:selected").text();
                row.docente = docenteRemote.nombre || '';
                row.tarifa = campoTarifa.val();
                row.fechaTermino = $(selectorFechaTermino).val();
                row.concepto = $(selectorConcepto + " option:selected").val();
                row.centroCosto = $(selectorCentroCosto + " option:selected").val();
                $(tblDocentes).DataTable().row.add(row).draw();
                cargarMobile();
                $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", true);
                campoTarifa.val('');
                campoDocente.typeahead('val', '');
            }
        }
        else { // Copiar
            const request = {
                organizacion: $(selectorOrganizacion).val(),
                idPeriodoAcademico: $(selectorPeriodo).val()
            };

            if (request.organizacion == '') {
                MessageBox.error('Debe seleccionar una Organización');
                return;
            }

            if (request.idPeriodoAcademico == '') {
                MessageBox.error('Debe seleccionar un periodo académico');
                return;
            }

            new TarifaDocenteConceptoExtraordinarioService().listarPeriodoAnterior(request, (response) => {
                debugger
                if (response.lista.length > 0) {
                    const nombreOrganizacion = $(selectorOrganizacion).find('option:selected').text();
                    const nomPeriodo = $(selectorPeriodo).find('option:selected').text();
                    let counter = 0;
                    let docentes = $(tblDocentes).DataTable().rows().data().toArray();
                    response.lista.forEach(item => {
                        let row = new Object();
                        row.idTarifaDocente = null;
                        row.idOrganizacion = request.organizacion;
                        row.idPeriodoAcademico = request.idPeriodoAcademico;
                        row.idDocente = item.idDocente;
                        row.docente = item.docente;
                        row.organizacion = nombreOrganizacion;
                        row.periodo = `${nomPeriodo}`;
                        row.tarifa = item.tarifa;
                        row.concepto = item.concepto;
                        row.fechaTermino = item.fechaTermino;
                        row.centroCosto = item.centroCosto;
                        row.concepto = item.concepto;
                        if (!item.tienePeriodoActual) {
                            row.periodo = `${item.academicYearAnterior}-${item.academicTermAnterior}`;
                            $(tblDocentesAnt).DataTable().row.add(row).draw(false);
                        }
                        else {
                            if (docentes.findIndex(x => x.idDocente === row.idDocente) < 0)
                                $(tblDocentes).DataTable().row.add(row).draw(false);
                            counter++
                        }
                    });
                    MessageBox.alert('Operación correcta', 'Documento procesado correctamente', 'success', true, false, function () {
                        if (counter > 0) {
                            if (!$(`${selectorOrganizacion}`).is(':disabled')) {
                                $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", true);
                            }
                        }
                    });
                }
                cargarMobileAnt();
                cargarMobile();
            }, true, true);
        }
    });

    btnGuardar.on("click", () => {
        let docentes = $(tblDocentes).DataTable().rows().data().toArray();
        let comentarioValue = campoComentario.val();

        if (docentes.length == 0) {
            MessageBox.error('Debe ingresar por lo menos un docente');
            return;
        }

        if (comentarioValue == null || comentarioValue.trim() === '') {
            MessageBox.error('Debe ingresar un Comentario');
            return false;
        }

        let tarifaDocente = {
            IdWorkflow: 8, // TarifaDeDocenteConceptoExtraordinario
            IdOrganizacion: $(selectorOrganizacion).val(),
            IdPeriodoAcademico: $(selectorPeriodo).val(),
            NombreOrganizacion: $(selectorOrganizacion + " option:selected").text(),
            NombrePeriodoAcademico: $(selectorPeriodo + " option:selected").text(),
            FechaTermino: $(selectorFechaTermino).val(),
            Concepto: $(selectorConcepto).val(),
            CentroCosto: $(selectorCentroCosto).val(),
            Comentario: campoComentario.val(),
            Docentes: docentes
        };
        new TarifaDocenteConceptoExtraordinarioService().agregar(tarifaDocente, (response) => {
            MessageBox.info('Registros guardado correctamente');
            $(tblDocentes).DataTable().clear().draw();
            $(tblDocentesAnt).DataTable().clear().draw();
            $(selectorOrganizacion).val('');
            $(selectorFechaTermino).val('');
            $(selectorConcepto).val('').trigger('change');
            $(selectorCentroCosto).val('');
            campoTarifa.val('');
            campoComentario.val('');
            campoDocente.val('');
            $form.get(0).reset();
            $(selectorOrganizacion).trigger('change');
            $form.find('[name="documentos-label"]').text("Subir un excel");
            $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", false);
        }, true, false);
    });

    $(tblDocentes).on("click", ".editar", (e) => {
        const key = e.currentTarget.closest("td");
        const index = $(tblDocentes).DataTable().row(key).index();
        var data = $(tblDocentes).DataTable().row(key).data();
        data.idTarifaDocente = index;
        abrirModalRegistro(data);
    });
    contentCardsMobile.on("click", ".editar", (e) => {
        let data = $(tblDocentes).DataTable().rows().data().toArray();
        let rowsCount = $(tblDocentes).DataTable().rows().data().count();
        for (let rIndex = 0; rIndex < rowsCount; rIndex++) {
            const item = $(tblDocentes).DataTable().rows(rIndex).data();
            let idx = data.findIndex(x => x.idDocente == item[0].idDocente && x.idTarifaDocente == null);
            if (idx >= 0)
                data[idx].idTarifaDocente = rIndex;
        };
        let idDocente = $(e.currentTarget).attr("key");
        let item = data.find(x => x.idDocente == idDocente);
        abrirModalRegistro(item);
    });
    $(tblDocentes).on("click", ".eliminar-docente", (e) => {
        dataTable.row(e.currentTarget.closest("tr")).remove().draw();
        var count = $(tblDocentes).DataTable().data().count();
        if (count <= 0) {
            $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", false);
            cargarMobileAnt();
        }
    });
    contentCardsMobile.on("click", ".eliminar", (e) => {
        let data = $(tblDocentes).DataTable().rows().data().toArray();
        let idDocente = $(e.currentTarget).attr("key");
        let item = data.findIndex(x => x.idDocente == idDocente);
        $(tblDocentes).DataTable().row(item).remove().draw();
        if (data.length == 1) {
            $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", false);
            cargarMobileAnt();
        }
        cargarMobile();
    });

    function abrirModalRegistro(item) {
        if (tarifaDocenteModal)
            tarifaDocenteModal.cargarData(item);
        else {
            new UtilService().obtenerHtml("WkTarifaDocenteConceptoExtraordinario/_Create", (html) => {
                divContent.after(html);
                tarifaDocenteModal = new TarifaDocenteConceptoExtraordinarioCreate();
                tarifaDocenteModal.configurarVentana(item, (data) => {
                    cargarMobile();
                });
            });
        }
    }

    $(selectorOrganizacion).on("change", () => {
        campoDocente.typeahead('val', '');
        if ($(selectorOrganizacion).val().trim() != '') {
            $(selectorPeriodo).find('option').not(':first').remove();
            const organizacion = $(selectorOrganizacion).val();
            if (organizacion == null || organizacion.trim() === '') return false;
            listarPeriodosPorOrganizacion();
        }
        else {
            $(selectorPeriodo).empty().append(Constantes.Select.OpcionSeleccione).val('');
        }
    });

    $(selectorPeriodo).on("change", () => {
        campoDocente.typeahead('val', '');
    });

    campoTarifa.keydown(function (e) {
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
    campoTarifa.keyup(function () {
        if ($(this).val().indexOf('.') != -1) {
            if ($(this).val().split(".")[1].length > 2) {
                if (isNaN(parseFloat(this.value))) return;
                this.value = parseFloat(this.value).toFixed(2);
            }
        }
    });

    function wkTarifaDocenteDataTable() {
        dataTable.clear().draw();
    }

    function listarPeriodosPorOrganizacion() {
        let filtroOrganizacion = $(selectorOrganizacion).val();
        periodoAcademicoService.listarPorOrganizacion(filtroOrganizacion, (response) => {
            for (let x of response) {
                $(selectorPeriodo).append($("<option></option>").attr("value", x.key).text(x.value));
            }
        });
    }

    function listarConceptos() {
        new TarifaDocenteConceptoExtraordinarioService().listarConceptos({}, (response) => {
            $(selectorConcepto).find('option').not(':first').remove();
            for (let x of response.lista) {
                $(selectorConcepto).append($("<option></option>").attr("value", x.codigo).text(x.nombre_largo));
            }
        }, false, true);
    }

    function listarCentroCostosPorOrganizacion(organizacion) {
        new TarifaDocenteConceptoExtraordinarioService().listarCentroCostos({ organizacion: organizacion }, (response) => {
            $(selectorCentroCosto).find('option').not(':first').remove();
            for (let x of response.lista) {
                $(selectorCentroCosto).append($("<option></option>").attr("value", x.nCodCentroCostos).text(`${x.nCodCentroCostos}-${x.sDescripcionCentroCostos}`));
            }
        }, false, true);
    }

    function cargarMobile(response) {
        if (!response)
            response = $(tblDocentes).DataTable().rows().data().toArray();
        Mobile.generarCard(response, 1, (data) => {
            contentCardsMobile.html('');
            if (data.length === 0) {
                // Mostrar un mensaje si no hay datos
                contentCardsMobile.html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
                return; // Salir de la función si no hay datos
            }
            data.forEach((item) => {
                let card = `<div class="mobile-card">
                    <div>
                    <button class="btn btn-action-card float-end eliminar" key="${item.idDocente}"><i class="fas fa-trash-alt" key="${item.idDocente}"></i></button>
                    <button class="btn btn-action-card float-end editar" key="${item.idDocente}"><i class="fas fa-pencil-alt" key="${item.idDocente}"></i></button>
                </div>
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
                    <span>${item.fechaTermino ? new Date(item.fechaTermino).toLocaleDateString('es-ES') : ''}</span>
                </div>
                <div>
                    <span>Concepto:</span>
                    <span>${item.concepto}</span>
                </div>
                <div>
                    <span>Centro de Costo:</span>
                    <span>${item.centroCosto}</span>
                </div>
                <div>
                    <span>Docente:</span>
                    <span>${item.docente}</span>
                </div>
                    </div>`;
                contentCardsMobile.append(card);
            });
        });
    }

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
                contentCardsMobileAnt.append(card);
            });
        });
    }

    campoDocente.typeahead({
        hint: true,
        highlight: true,
        minLength: 3,
        limit: 20,
        cache: false,
    }, {
        displayKey: 'value',
        source: _docentesTypeahead.ttAdapter(),
        highlighter: function (item) {
            return item.split(_docentesSplitChar)[0];
        }
    }).on("typeahead:selected typeahead:autocompleted", function (ev, my_Suggestion_class) {
        const docenteValueSplitted = campoDocente?.val().split(_docentesSplitChar);
        if (!docenteValueSplitted || docenteValueSplitted.length < 2) return;
        const docente = docenteValueSplitted[0];
        if (!_docentesRemote.some(x => x.docente == docente)) _docentesRemote.push({
            docente: docente,
            nombre: docenteValueSplitted[1]
        });
    });

    wkTarifaDocenteDataTable();
});

const _docentesRemote = [];
const _docentesSplitChar = ' - ';

const _docentesTypeahead = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: 'buscarDocentesAd?',
        replace: function (url, query) {
            const periodoValue = $("#periodo option:selected").val().trim();
            return url + 'query=' + query.toUpperCase() + '&periodoAcademico=' + (periodoValue == '' ? periodoValue : $("#periodo option:selected").text()) +
                '&organizacion=' + $("#organizacion option:selected").val();
        },
        wildcard: '%QUERY',
        filter: _docentesTypeahead => $.map(_docentesTypeahead, option => ({
            value: option.docenteAD + _docentesSplitChar + option.displayName
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_docentesTypeahead.initialize();