$(document).ready(function () {
    const periodoAcademicoService = new PeriodoAcademicoService();
    let excepcionTarifaModal = null;
    let divContent = $("#divContent");
    let selectorOrganizacion = "#organizacion";
    let selectorPeriodo = "#periodo";
    let tblDocentes = "#excepcionTarifaTable";
    let campoDocente = $("#docente");
    let campoCurso = $("#curso");
    let campoTarifa = $("#tarifa");
    let campoComentario = $("#comentario");
    let btnGuardar = $("#btnGuardar");
    let btnAgregar = $("#btnAgregar");
    let contentCardsMobile = $("#contentCards-excepcionTarifa");
    let contentCardsMobileAnt = $("#contentCards-excepcionTarifaAnterior");
    let containerDocenteAnt = $("#docentePeriodoAnterior");
    let tblDocentesAnt = $("#docenteAnteriorTable");
    let btnPeriodoAnt = $("#btnPeriodoAnt");
    const $form = $('#frmUpload');
    const $btnSubir = $form.find('button[name="btn-subir"]').first();
    const $fileDocumentos = $form.find('input[name="documentos"]').first();
    const $btnFormato = $('#btnFormato');
    $(selectorOrganizacion).prepend(Constantes.Select.OpcionSeleccione).val('');
    $(selectorPeriodo).prepend(Constantes.Select.OpcionSeleccione).val('');

    let dataTable = $(tblDocentes).DataTable({
        searching: false,
        paging: true,
        info: false,
        lengthChange: true,
        destroy: true,
        language: Util.obtenerLenguajeDataTable(),
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
                render: (data, type) => {
                    let acciones = "";
                    acciones += '<i class="fas fa-pencil-alt editar me-2"></i>';
                    acciones += '<i class="fas fa-trash eliminar-docente"></i>';
                    return acciones;
                }
            },
        ]
    });

    let dataTableAnt = $(tblDocentesAnt).DataTable({
        searching: false,
        paging: true,
        info: false,
        lengthChange: true,
        destroy: true,
        language: Util.obtenerLenguajeDataTable(),
        columns: [
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
            }
        ]
    });
    cargarMobile([]);
    cargarMobileAnt([]);

    $btnSubir.on('click', () => {
        $fileDocumentos.click();
    });

    $btnFormato.attr("href", URL_BASE + "WkSolicitud/DescargaFormato?key=" + Constantes.Workflow.ExcepcionesTarifasDocente);

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
        new ExcepcionTarifaService().procesar(request, (response) => {
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
        $('.div-copiar').addClass('d-none');
        btnAgregar.html("Agregar");
    });
    $("#btnMasivo").on("click", (e) => {
        e.preventDefault();
        $("#btnIndividual, #btnCopiar").removeClass('active');
        $("#btnMasivo").addClass('active');
        $('.div-individual-copia').addClass('d-none');
        $('.div-individual').addClass('d-none');
        $('.div-copiar').addClass('d-none');
        $('.div-masivo').removeClass('d-none');
    });
    $("#btnCopiar").on("click", (e) => {
        e.preventDefault();
        $("#btnIndividual, #btnMasivo").removeClass('active');
        $("#btnCopiar").addClass('active');
        $('.div-individual-copia').removeClass('d-none');
        $('.div-copiar').removeClass('d-none');
        $('.div-individual').addClass('d-none');
        $('.div-masivo').addClass('d-none');
        btnAgregar.html("Copiar");
    });

    btnAgregar.on("click", (e) => {
        const text = btnAgregar.text();
        if (text === "Agregar") {
            let docenteValue = campoDocente.val();
            let cursoValue = campoCurso.val();
            let tarifaValue = campoTarifa.val();

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

            const cursoValueSplitted = cursoValue.split(_cursosSplitChar);
            if (cursoValueSplitted?.length < 2) {
                MessageBox.error('Curso no válido');
                return false;
            }

            const curso = cursoValueSplitted[0];
            const cursoRemote = _cursosRemote.filter(x => x.curso == curso)?.[0];
            if (!cursoRemote) {
                MessageBox.error('Curso no válido');
                return false;
            }

            let docentes = $(tblDocentes).DataTable().rows().data().toArray();
            if (docentes.findIndex(x => x.idDocente === docente && x.idCurso === curso) >= 0) {
                MessageBox.showMessenger('El docente y curso ya estan asignados', 'warning', 'Registro Duplicado');
            } else {
                let row = new Object();
                row.idExcepcionTarifa = null;
                row.idOrganizacion = $(selectorOrganizacion + " option:selected").val();
                row.idDocente = docente;
                row.idCurso = curso;
                row.idPeriodoAcademico = $(selectorPeriodo + " option:selected").val();
                row.organizacion = $(selectorOrganizacion + " option:selected").text();
                row.periodo = $(selectorPeriodo + " option:selected").text();
                row.docente = docenteRemote.nombre || '';
                row.curso = cursoRemote.nombre || '';
                row.tarifa = campoTarifa.val();
                $(tblDocentes).DataTable().row.add(row).draw();
                cargarMobile();
                $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", true);
                campoTarifa.val('');
                campoDocente.typeahead('val', '');
                campoCurso.typeahead('val', '');
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

            new ExcepcionTarifaService().listarPeriodoAnterior(request, (response) => {
                if (response.lista.length > 0) {
                    wkExcepcionTarifaAnt();
                    const nombreOrganizacion = $(selectorOrganizacion).find('option:selected').text();
                    const nomPeriodo = $(selectorPeriodo).find('option:selected').text();
                    let counter = 0;
                    let docentes = $(tblDocentes).DataTable().rows().data().toArray();
                    response.lista.forEach(item => {
                        let row = new Object();
                        row.idExcepcionTarifa = null;
                        row.idOrganizacion = request.organizacion;
                        row.idPeriodoAcademico = request.idPeriodoAcademico;
                        row.idDocente = item.idDocente;
                        row.idCurso = item.idCurso;
                        row.docente = item.docente;
                        row.curso = item.curso;
                        row.organizacion = nombreOrganizacion;
                        row.periodo = `${nomPeriodo}`;
                        row.tarifa = item.tarifa;
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
                            if (!$(btnPeriodoAnt).is(':checked')) btnPeriodoAnt.click();
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
            MessageBox.error('Debe ingresar por lo menos un registro');
            return;
        }

        if (comentarioValue == null || comentarioValue.trim() === '') {
            MessageBox.error('Debe ingresar un Comentario');
            return false;
        }

        let excepcionTarifa = {
            IdOrganizacion: $(selectorOrganizacion).val(),
            IdPeriodoAcademico: $(selectorPeriodo).val(),
            NombreOrganizacion: $(selectorOrganizacion + " option:selected").text(),
            NombrePeriodoAcademico: $(selectorPeriodo + " option:selected").text(),
            Comentario: campoComentario.val(),
            Docentes: docentes
        };
        new ExcepcionTarifaService().agregar(excepcionTarifa, (response) => {
            MessageBox.info('Registros guardado correctamente');
            $(tblDocentes).DataTable().clear().draw();
            $(tblDocentesAnt).DataTable().clear().draw();
            $(selectorOrganizacion).val('');
            campoTarifa.val('');
            campoComentario.val('');
            campoDocente.typeahead('val', '');
            campoCurso.typeahead('val', '');
            $form.get(0).reset();
            $(selectorOrganizacion).trigger('change');
            $form.find('[name="documentos-label"]').text("Subir un excel");
            $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", false);
        }, true, false);
    });

    btnPeriodoAnt.on("click", (e) => {
        if ($(e.currentTarget).is(':checked'))
            containerDocenteAnt.removeClass("d-none");
        else
            containerDocenteAnt.addClass("d-none");
    });

    $(tblDocentes).on("click", ".editar", (e) => {
        const key = e.currentTarget.closest("td");
        const index = $(tblDocentes).DataTable().row(key).index();
        var data = $(tblDocentes).DataTable().row(key).data();
        data.idExcepcionTarifa = index;
        abrirModalRegistro(data);
    });
    contentCardsMobile.on("click", ".editar", (e) => {
        let data = $(tblDocentes).DataTable().rows().data().toArray();
        let rowsCount = $(tblDocentes).DataTable().rows().data().count();
        for (let rIndex = 0; rIndex < rowsCount; rIndex++) {
            const item = $(tblDocentes).DataTable().rows(rIndex).data();
            let idx = data.findIndex(x => x.idDocente == item[0].idDocente && x.idCurso == item[0].idCurso && x.idExcepcionTarifa == null);
            if (idx >= 0)
                data[idx].idExcepcionTarifa = rIndex;
        };
        let idDocente = $(e.currentTarget).attr("keyDocente");
        let idCurso = $(e.currentTarget).attr("keyCurso");
        let item = data.find(x => x.idDocente == idDocente && x.idCurso == idCurso);
        abrirModalRegistro(item);
    });
    $(tblDocentes).on("click", ".eliminar-docente", (e) => {
        dataTable.row(e.currentTarget.closest("tr")).remove().draw();
        var count = $(tblDocentes).DataTable().data().count();
        if (count <= 0) {
            $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", false);
            wkExcepcionTarifaAnt();
            cargarMobileAnt();
        }
    });
    contentCardsMobile.on("click", ".eliminar", (e) => {
        let data = $(tblDocentes).DataTable().rows().data().toArray();
        let idDocente = $(e.currentTarget).attr("keyDocente");
        let idCurso = $(e.currentTarget).attr("keyCurso");
        let item = data.findIndex(x => x.idDocente == idDocente && x.idCurso == idCurso);
        $(tblDocentes).DataTable().row(item).remove().draw();
        if (data.length == 1) {
            $(`${selectorOrganizacion}, ${selectorPeriodo}`).prop("disabled", false);
            wkExcepcionTarifaAnt();
            cargarMobileAnt();
        }
        cargarMobile();
    });

    function abrirModalRegistro(item) {
        if (excepcionTarifaModal)
            excepcionTarifaModal.cargarData(item);
        else {
            new UtilService().obtenerHtml("WkExcepcionTarifa/_Create", (html) => {
                divContent.after(html);
                excepcionTarifaModal = new ExcepcionTarifaCreate();
                excepcionTarifaModal.configurarVentana(item, (data) => {
                    cargarMobile();
                });
            });
        }
    }

    $(selectorOrganizacion).on("change", () => {
        campoDocente.typeahead('val', '');
        campoCurso.typeahead('val', '');
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
        campoCurso.typeahead('val', '');
    });

    campoTarifa.keydown(function (e) {
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

    campoTarifa.keyup(function () {
        if ($(this).val().indexOf('.') != -1) {
            if ($(this).val().split(".")[1].length > 2) {
                if (isNaN(parseFloat(this.value))) return;
                this.value = parseFloat(this.value).toFixed(2);
            }
        }
    });

    function wkExcepcionTarifaAnt() {
        dataTableAnt.clear().draw();
    }

    function wkExcepcionTarifaDataTable() {
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
                    <button class="btn btn-action-card float-end eliminar" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"><i class="fas fa-trash-alt" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"></i></button>
                    <button class="btn btn-action-card float-end editar" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"><i class="fas fa-pencil-alt" keyDocente="${item.idDocente}" keyCurso="${item.idCurso}"></i></button>
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
                    <span>Docente:</span>
                    <span>${item.docente}</span>
                </div>
                <div>
                    <span>Curso:</span>
                    <span>${item.idCurso} - ${item.curso}</span>
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
                <div>
                    <span>Curso:</span>
                    <span>${item.idCurso} - ${item.curso}</span>
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
        if (!_docentesRemote.some(x => x.docente == docente)) {
            _docentesRemote.push({
                docente: docente,
                nombre: docenteValueSplitted[1]
            });
            campoCurso.typeahead('val', '');
        }
    });

    campoCurso.typeahead({
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
        const cursoValueSplitted = campoCurso?.val().split(_cursosSplitChar);
        if (!cursoValueSplitted || cursoValueSplitted.length < 2) return;
        const curso = cursoValueSplitted[0];
        if (!_cursosRemote.some(x => x.curso == curso)) _cursosRemote.push({
            curso: curso,
            nombre: cursoValueSplitted[1]
        });
    });

    wkExcepcionTarifaDataTable();
    wkExcepcionTarifaAnt();
});

const _docentesRemote = [];
const _docentesSplitChar = ' - ';
const _cursosRemote = [];
const _cursosSplitChar = ' - ';

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
            //value: option.usuarioAD
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_docentesTypeahead.initialize();

const _cursosTypeahead = new Bloodhound({
    datumTokenizer: datum => Bloodhound.tokenizers.whitespace(datum.value),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    limit: 20,
    remote: {
        url: 'buscarCursosPorPeriodoAcademicoPorDocente?',
        replace: function (url, query) {
            const periodoValue = $("#periodo option:selected").val();
            const docenteValue = $("#docente").val()?.split('-')?.[0]?.trim() || '';
            return url + 'query=' + query.toUpperCase() + '&idPeriodoAcademico=' + periodoValue + '&codDocente=' + docenteValue;
        },
        wildcard: '%QUERY',
        //filter: function (data) {
        //    var ae = $.map(data, option => ({
        //        value: option.codigo + _cursosSplitChar + option.nombre
        //    }));
        //    return ae;
        //}
        filter: _cursosTypeahead => $.map(_cursosTypeahead, option => ({
            value: option.codigo + _cursosSplitChar + option.nombre
        }))
    }
});
// Initialize the Bloodhound suggestion engine
_cursosTypeahead.initialize();