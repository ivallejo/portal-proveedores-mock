//const { event } = require("jquery");

const headers = ["NOMBRES", "CODIGO", "NOTA", "SECCION", "FECHA ACT"]

const tokenResponse = 'tknResponse';


function cargarAsistentes() {
    try {
        var sinceDatos = $('#CurrentValue').val();
    }
    catch (error) {
        console.error(`Error al cargar las notas: ${error}`)
    }
}

function chargeECs(academic_year, academic_term, section, event_id,nombreCarrera,turno) {
    try {
        var formdxtx = new FormData();
        formdxtx.append("academic_year", academic_year);
        formdxtx.append("academic_term", academic_term);
        formdxtx.append("section", section);
        formdxtx.append("event_id", event_id);
        formdxtx.append("academic_session", turno);


        $.ajax({
            url: request_get_ecs, //GetEvaluacionesContinuas
            type: 'POST',
            data: formdxtx,
            processData: false,
            contentType: false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let success = response.success;
                let response_ec = response.data_ec

                if (success) {
                    //var EC_hijas = response.response_Hijas; //construyo tabs por seccion
                    var seccionesHijas = response.seccionHijas;
                    var promedioCargable = response.promedioCargable;
                    //console.log(response_ec);

                    $('#txtAnio').val(academic_year)
                    $('#txtSemestre').val(academic_term)
                    $('#txtSection').val(section)
                    $('#txtEventId').val(event_id)

                    $('#txtAcademicSession').val(turno)

                    var turnoFormateado = getNameFromValue(turno);
                    $('#txtAcademicSessionFront').val(turnoFormateado)

                    $('#Course').html(nombreCarrera);

                    drawHTML(response.data, seccionesHijas, promedioCargable);

                    $("#tab-evaluaciones").removeClass("d-none");
                    $('#ec-tab').trigger("click");
                    showTabsEC(1);

                    cleanDiv("#target-asistentes"); //limpio la tabla de registros
                    var record_number = $('#record_number');
                    record_number.val('');

                    //validacion de secciones hija
                    if (seccionesHijas.length > 0) {
                        var content = generateHTMLSeccionesHijas(seccionesHijas, "");
                        toastSeccionesHijas(content);
                    }
                }
                else {
                    alerta_center(response.swal, "Advertencia", response.mensaje)
                }

            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error al cargar las EC: " + error.responseText);
                console.error("Error al cargar la vista parcial:", error);
            },
            complete: function () {
                hideModalLoader();
            }

        })

    }
    catch (error) {
        alerta_center("error", "Excepción encontrada", `No se ha podido cargar las evaluaciones continuas del curso: ${error}`)
    }
    
}

function drawHTML(jsonResult, seccionesHija, promedioCargable) {
    // Eliminar todos los valores de sessionStorage
    sessionStorage.clear();

    //seteo en sesion
    var jsonresultEncode_ss = encriptarBase64UTF8(JSON.stringify(jsonResult));
    var promedioCargable_ss = +promedioCargable;

    sessionStorage.setItem("ECs", jsonresultEncode_ss);

    sessionStorage.setItem("promedioCargable", promedioCargable_ss.toString());
    //console.log("Promedio cargable? ", promedioCargable_ss.toString())
    //considera esta iteración para imprimir la data en el card
    var htmlElement = '';
    var htmlTarget = "#resultTab";
    var hijasTarget = "#hijasToggle_ec";

    if (seccionesHija.length > 0) {
        var content = generate_ToggleSF(seccionesHija);
        $(hijasTarget).html(content)
    }
    else {
        $(hijasTarget).html('')
    }

    //htmlElement += `<input class="form-control" id="EC_hijas" value='${JSON.stringify(EC_hijas)}'/>`

    var ecs = getElementsECndPF(promedioCargable);
    htmlElement += ecs;

   
    
    $(htmlTarget).html(htmlElement);


    //finalmente, guardo tanto promediocargable como jsonResult en un sessionStorage para obtener
}

function getElementsECndPF(notasPendientes) {

    //obtengo los valores
    let encoded_json = sessionStorage.getItem("ECs");
    let stringifyJson = desencriptarBase64UTF8(encoded_json);

    //let sessionPromedioCargable = sessionStorage.getItem("promedioCargable");
    //let intValue = parseInt(sessionPromedioCargable);
    //let booleanValue = !!intValue;

    //casteo los valores
    var jsonResult = JSON.parse(stringifyJson);
    //var promedioCargable = booleanValue;

    var htmlElement = '';
    jsonResult.forEach(function (item) {
        //console.log(item);

        var title = item.title;
        var record_number = item.record_number; //para filtrar los estudiantes en fx al id de la EC


        let html =
            `<div class="col-md-3 col-sm-12 mt-1 mb-1">
            <a class="btn btn-outline-primary EC" onclick="searchAssistants(${record_number})">${item.title}</a>
        </div>`

        htmlElement += html;

    })

    if (!notasPendientes) {
        //console.log("ButtonPromedio autorizado.")
        htmlElement +=
            `<div class="col-md-3 col-sm-12 mt-1 mb-1">
            <a class="btn btn-outline-danger fw-bold h-100 btnPF_restricted" onclick="sendEC_prom()">PROMEDIO FINAL</a>
        </div>`;
    }
    else {
        htmlElement +=
            `<div class="col-md-3 col-sm-12 mt-1 mb-1">
            <a class="btn btn-outline-warning fw-bold h-100 btnPF_restricted" onclick="evaluateShowPromediofinal()" >PROMEDIO FINAL</a>
        </div>`;
    }
    //console.log(encoded_json)
    return htmlElement;
}

async function construirButtonsEC() {
    let encoded_json = sessionStorage.getItem("ECs");
    let stringifyJson = desencriptarBase64UTF8(encoded_json);

    // Llama a promedioCargable_ajx con await
    var notasPendientes = await promedioCargable_ajx(stringifyJson);
    //console.log("Promedio cargable", notasPendientes);
    //console.log("promedio cargable: ", promedioCargable);

    const textContent = await getElementsECndPF(notasPendientes);
    $('#resultTab').html(textContent);
}


async function promedioCargable_ajx(jsonString) {
    var fdt = new FormData();
    fdt.append("req", jsonString);

    try {
        const response =
            await $.ajax({
            url: rq_validate_Act_PF,
            type: 'POST',
            data: fdt,
            contentType: false,
            processData: false,
        });

        // Retorna el valor 'promedioCargable' de la respuesta
        return response.notasPendientes;
    } catch (error) {
        alerta_center("Ocurrió un error al validar notas registradas.");
        console.error(error);
        return false;
    }
}


function searchAssistants(record_number) {
    try {
        let anio = $('#txtAnio').val();
        let semestre = $('#txtSemestre').val();
        let seccion = $('#txtSection').val();
        let event_id = $('#txtEventId').val();
        let academic_session = $('#txtAcademicSession').val();
        //let academic_session = $('#txtAcademicSessionFront').val();
        
        if (anio && semestre && seccion && event_id) {
            var fdtx = new FormData()
            fdtx.append("ACADEMIC_YEAR", anio)
            fdtx.append("ACADEMIC_TERM", semestre)
            fdtx.append("SECTION", seccion)
            fdtx.append("EVENT_ID", event_id)
            fdtx.append("RECORD_NUMBER", record_number)
            fdtx.append("academic_session", academic_session)

            //console.log(listadoAsistentes);

            $.ajax({
                url: listadoAsistentes, //cargarAsistentes
                type: 'POST',
                data: fdtx,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {
                    //console.log(response.response);

                    let status = response.success;
                    if (status) {
                        $('#record_number').val(record_number);

                        var contentJson = response.response;
                        var notasEditables = response.notasEditables;
                        var editablesPorPromedio = response.editablesPorPromedio;
                        var detallesSeccionPadre = [anio, semestre, seccion, event_id, academic_session]
                        var fechaLimite = response.fechaLimite;
                        var fecha_nula = response.fecha_nula;

                        

                        var notasEditables_resume = false;

                        notasEditables = (fechaLimite === fecha_nula) ? true : notasEditables;

                        //console.log("notasEditables", notasEditables)

                        notasEditables_resume = editablesPorPromedio && notasEditables;

                        //console.log("notasEditables_resume", notasEditables_resume)
                        //console.log("editablesPorPromedio", editablesPorPromedio)

                        var mensaje = !editablesPorPromedio
                            ?
                            //"Ya se registró el promedio de este curso por lo que no se puede modificar las notas previas."
                                "Ya se ha realizado anteriormente una carga de promedios, por lo que no se puede modificar las notas previas."
                            : !notasEditables
                                ? "Recuerde que la fecha límite de registro de notas ya expiró."
                                : "";

                        fechaLimite = (fechaLimite === fecha_nula) ? "No aplica" : fechaLimite;



                        drawTableNotas(contentJson, notasEditables_resume, detallesSeccionPadre, fechaLimite,mensaje)


                        var requestJson = response.response;

                        var currentPage = 1;
                        var totalPages = Math.ceil(requestJson.length / 10);
                        var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                        // Mostrar la primera página
                        construirCards(requestJson, '#contentCards-notas', notasEditables_resume, detallesSeccionPadre);
                        displayPageNotas(currentPage, totalPages, maxVisibleButtons);


                        // Manejador de clic en la paginación
                        $(document).on('click', '.pagination a', function (e) {
                            e.preventDefault();

                            if ($(this).hasClass('prev-page')) {
                                currentPage = Math.max(currentPage - 1, 1);
                            } else if ($(this).hasClass('next-page')) {
                                currentPage = Math.min(currentPage + 1, totalPages);
                            } else {
                                currentPage = $(this).data('page');
                            }

                            displayPageNotas(currentPage, totalPages, maxVisibleButtons);
                        });

                    }
                    else {
                        alerta_center(response.swal, "Advertencia", response.mensaje);

                    }

                },
                error: function () {
                    alerta_center("error", "Error", `Ocurrió un error al cargar los asistentes de ${record_number}:  ${error.responseText}`);
                    console.error("Error al cargar la vista parcial:", error);
                },
                complete: function () {
                    hideModalLoader();
                    limitGradePoints();
                }
            })
        }
        else {
            alerta_center("error", "Datos inválidos", "Se encontro información")
        }

    }
    catch (error) {
        alerta_center("error", "Excepción encontrada", `No se ha podido cargar los asistentes de la evaluacion de id ${record_number}: ${error}`)

    }
}

function displayPageNotas(page, totalPages, maxVisibleButtons) {
    //console.log('display');

    // Ocultar todos los cards y mostrar solo los de la página actual
    $('.mobile-card').hide();
    $(`.card-page-${page}`).show();

    // Actualizar la paginación
    updatePaginationNotas(page, maxVisibleButtons, totalPages);
}
// Función para actualizar la paginación
function updatePaginationNotas(currentPage, maxVisibleButtons, totalPages) {
    $('.pagination').html(''); // Limpiar el contenedor de la paginación

    var startPage = Math.max(currentPage - Math.floor(maxVisibleButtons / 2), 1);
    var endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

    // Ajustar los botones visibles cuando estás al inicio o al final
    if (endPage - startPage + 1 < maxVisibleButtons) {
        startPage = Math.max(endPage - maxVisibleButtons + 1, 1);
    }

    // Botón "Anterior"
    if (currentPage > 1) {
        $('.pagination').append(`<a href="#" class="prev-page"><i class="fas fa-arrow-left"></i></a>`);
    }

    // Botones de número de página
    for (var i = startPage; i <= endPage; i++) {
        var pageLink = `<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
        $('.pagination').append(pageLink);
    }

    // Botón "Siguiente"
    if (currentPage < totalPages) {
        $('.pagination').append(`<a href="#" class="next-page"><i class="fas fa-arrow-right"></i></a>`);
    }
}
//utils
function showTabsEC(key) {
    /*
    * 0 => oculto el result
    * 1 => muestro el result
    * donde result == #EC-Tab
    */

    let selectOption = "#selectSection";
    let result = "#EC-Tab";

    switch (key) {
        case 0:
            $(result).css("display", "none")
            $(selectOption).css("display", "revert")
            break
        case 1:
            $(selectOption).css("display", "none")
            $(result).css("display", "revert")
    }
}

function cleanDiv(targetDiv) {
    //console.log(`div limpiado: ${targetDiv}`)
    $(targetDiv).html('');
}
function construirCards(data, contentContainer, notasEditables, detallesSeccionPadre) {
    //console.log('construir cards');
    // Limpiar el contenedor antes de agregar nuevas tarjetas
    $(contentContainer).html('');
    // Verificar si hay datos
    if (data.length === 0) {
        // Mostrar un mensaje si no hay datos
        $(contentContainer).html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
        return; // Salir de la función si no hay datos
    }
    // Crear las tarjetas
    data.forEach(function (item, index) {
        // Información visible inicialmente
        var fullName = `<span class="fullName">${item.fullName}</span>`;
        var codigoAlumno = `<span class="people_code_id">${item.people_code_id}</span>`;

        // Campo de Nota
        var disable = notasEditables === false ? "disabled" : "";
        var type = "text";
        var notaInput = `<input ${disable} name="nota" class="form-control text-center nota" type="${type}" min="0" max="${item.notaMax}" value="${item.nota}">`;

        var notaField = `
            <div class="row">
                <div class="col-sm-12">
                    ${notaInput}
                </div>
            </div>
        `;

        // Campo de Detalles de la Sección
        var detail = item.detailsGrading;
        var seccion = detail.section;
        var event_id = detail.evenT_ID;
        var text = seccion !== detallesSeccionPadre[2] || event_id !== detallesSeccionPadre[3]
            ? `<span class="text-primary fw-bold">FUSIONADA</span>`
            : '';

        text += ` (${seccion}/${event_id})`;

        var seccionField = `<span class="revision_date">${text}</span>`;

        // Campo de Fecha de Revisión
        var revisionDateField = `<span class="revision_date">${item.revision_date}</span>`;

        // Estructura de la tarjeta con datos visibles e inicialmente ocultos
        var card = `
            <div class="mobile-card card-page-${Math.floor(index / 10) + 1}" data-people-code-id="${item.people_code_id}" 
                 data-details-grading='${JSON.stringify(item.detailsGrading)}'>
                 <input type="hidden" name="personId" value="${item.personId}">
                <input type="hidden" name="recordNumber" value="${item.record_number}">
                <!-- Datos visibles: Nombre Completo y Código del Alumno -->
                <h5><i class="fas fa-user" style="margin-right: 5px;"></i> ${fullName} - ${codigoAlumno}</h5>

                <!-- Campo de Nota -->
                <p><strong>Nota:</strong> ${notaField}</p>

                <!-- Botón de Mostrar/Ocultar detalles -->
                <button class="btn btn-sm btn-secondary mt-2" onclick="toggleDetails(this)">Mostrar más</button>

                <!-- Detalles adicionales ocultos -->
                <div class="hidden-details" style="display: none;">
                    <!-- Detalles de la Sección -->
                    <p><strong>Detalles de la Sección:</strong> ${seccionField}</p>

                    <!-- Fecha de Revisión -->
                    <p><strong>Fecha de Revisión:</strong> ${revisionDateField}</p>
                </div>
            </div>
        `;

        $(contentContainer).append(card);
    });
}

function drawTableNotas(body, notasEditables, detallesSeccionPadre,fechaLimite,mensaje) {

    var target = "#lstNotas"
    var target_class = "nota";

    //destruyo el objeto existente del sessionStorage
    //destroySessionRequest();

    let targetDiv = "#target-asistentes";
    //primero limpio el contenido
    cleanDiv(targetDiv);

    //now
    var rows = ''
    var fechaLimite = fechaLimite;

    headers.forEach(function (item) {
        rows += `<th class="bg-header-table" style="padding: 5px; border-radius: 12px; color: white; margin: 10px;">${item}</th>`;
    })

    //body.forEach(item => {
    //    console.log(item)
    //    fechaLimite = item.due_date;
    //});

    var maxPoints = `<h6>Total de puntos: 20</h6>`;
    maxPoints = '';

    var notasVacias = 0;
    body.forEach(function (item) {
        if (item.nota === "") {
            notasVacias++;
        }
    })

    var bodyTable = `
    <div id="asists-target">

        <div class="">
            <span class="bg-primary mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex">
                <h6 class="mb-0">Fecha límite: <strong id="txtLimite">${fechaLimite}</strong> </h6>
            </span>

            <span class="bg-info mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex fw-bold shake_element">
                <h6 class="mb-0">Notas pendientes de registro: <strong id="txtNotasVacias">${notasVacias}</strong> </h6>
            </span>

            <span class="bg-secondary mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex" style="display:none !important;">
                <h6 class="mb-0">Nota máxima: <strong id="txtMaxPoints">${maxPoints}</strong> </h6>
            </span>

        </div>
        
        <div class="table-responsive-docente">
            <table id="lstNotas" class="table text-nowrap" style="width:100%;border-spacing: 5px;">
                <thead>

                    <tr style="pointer-events:none; cursor:default;">`+ rows +`</tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
            <div id="marcacionesCard" class="table-cards">
                <div id="contentCards-notas">
                </div>
                <div class="pagination">
                    <!-- Links de paginación se generarán aquí -->
                </div>
            </div>

        <div class="sectionSend mt-4 d-flex justify-content-end">
            <button class="btn btn-primary sendButton_notas" onclick="CommitSendNotas()">Guardar cambios</button>
        </div>

    </div>
    `
    $(targetDiv).html(bodyTable)

    $(target).DataTable({
        
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[50, 100, 150, -1], [50, 100, 150, "All"]],
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": true,
        "responsive": true,
        "initComplete": function () {
            // Remover el texto dentro del contenedor del buscador
            //dt_generalComponents();
        },
        "language": {
            url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
            searchPlaceholder: "Buscar"
        },
        "initComplete": function (settings, json) {
            // Cambiar el texto de "Buscar:" en el label
            $('.dataTables_filter label').contents().filter(function () {
                return this.nodeType === 3;  // Filtra los nodos de texto
            }).first().replaceWith('');  // Reemplaza con el nuevo texto
        },
        "order": [
            [0, "asc"]
        ],
        data: body,
        columns: [
            {
                'data': 'fullName',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="fullName">' + data + '</span>';
                    }

                    return data;
                }
            },
            {
                'data': 'people_code_id',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="people_code_id">' + data + '</span>';
                    }

                    return data;
                }
            },
            {
                'data': 'nota',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        var disable = notasEditables == false ? "disabled" : "";
                        var etiqueta =
                            `<input ${disable} name="${target_class}" 
                            step="0.1"
                            class="form-control text-center ${target_class}" 
                            type="text" 
                            maxlength="5"
                            min="0" max="${row.notaMax}" 

                            placeholder="Ingrese nota" value="${data}">`;

                        var content = `
                        <div class="row">
                            <div class="col-sm-12">
                                ${etiqueta}
                            </div>
                        </div>
                        `;
                        return content;
                    }

                    return data;
                }
            },
            {
                'data': 'people_code_id',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        var detail = row.detailsGrading;

                        var seccion = detail.section;
                        var event_id = detail.evenT_ID;
                        var text = ''

                        if (seccion != detallesSeccionPadre[2] || event_id != detallesSeccionPadre[3]) {
                            text += ` text-primary fw-bold"> FUSIONADA `
                        }
                        else {
                            text += `">`;
                        }
                        text += ` (${seccion}/${event_id})`;


                        return '<span class="revision_date' + text + '</span>';
                        //return '<span class="revision_date">' + text + '</span>';
                    }

                    return data;
                }
            },
            {
                'data': 'revision_date',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="revision_date">' + data + '</span>';
                    }

                    return data;
                }
            }
            
        ]
    })
    //applicateCustomDt(target);

    if (!notasEditables) {
        disableSendNotas(mensaje);
    }

    //finalmente, agrego configuraciones al datatable
    //delimitarNotas(target_class); //se inyectaesta funcionalidad en la sig fx
    preventChangeDefaultValue(target, target_class,"nota"); //evitar el reestablecimiento de valores insertados en table responsive
    limitGradePoints();
}

//para cargar notas 
function cargarNotas() { //al parecer no se utiliza

    try {
        var request = getJsonRequest();
        //console.log(request)

        $.ajax({
            url: rq_carga_notas,
            type: 'POST',
            data: request,
            contentType: 'application/json',
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status = response.success;

                if (status) {
                    alerta_center(response.swal, "Éxito", response.mensaje);

                }
                else {
                    alerta_center(response.swal, "Advertencia", response.mensaje)
                }
            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error al subir las notas: " + error.responseText);
                console.error(error.responseText);
            },
            complete: function () {
                hideModalLoader();
            }
        })
    }
    catch (error) {
        alerta_center("error","Excepción encontrada","No se ha podido cargar las notas proporcionadas.")
    }
}

//requestApi
function CommitSendNotas() {

    /*LA LOGICA DE  REGISTRO DE NOTAS SE MIGRÓ A Notas_source.js*/
    commmitChanges("Se cargarán las notas editadas", "¿Está seguro de realizar el registro?", sendNotasSF,null)
    //commmitChanges("Se cargarán las notas editadas","¿Está seguro de realizar el registro?",sendNotas,null)
}
/*restore logica anterior*/

function bloquearNotas() {
    $('.nota').attr("disabled")
    $('.sendButton_notas').attr("disabled", true)
}

//------------------------------
//NOTAS FINALES

function recopilarECS_prom() {
    const response = [];
    $('.EC').each(function () {
        // Obtiene el valor del atributo 'onclick' de cada elemento con la clase 'EC'
        let onClickValue = $(this).attr('onclick');

        // Extrae el número de la función 'searchAssistants' usando una expresión regular
        let match = onClickValue.match(/\((\d+)\)/);

        if (match) {
            let param = match[1]; // El número extraído
            response.push(param);
            //console.log(param); // Puedes hacer lo que necesites con el parámetro aquí
        }
    });

    return response;
}
function sendEC_prom() {
    try {

        var request = recopilarECS_prom();
        //console.log(request);

        console.log(rq_notas_sgk);

        $.ajax({
            url: rq_notas_sgk,//getEC_sgk
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(request),
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status = response.success;
                if (status) {
                    //console.log(response)
                    //console.log(response.data);
                    //console.log(response.headers);

                    var headers = response.headers;
                    var content = response.data;
                    var notasEditables = response.notasEditables;
                    var due_Date = response.due_Date;
                    var promediosCargables = response.promediosCargables;

                    //console.log(`Notas editables: ${notasEditables}`)

                    //drawTable_PF(headers, content, notasEditables, due_Date);
                    drawTablePF(headers, content, notasEditables, due_Date, promediosCargables);

                    var requestJson = response.data;
                    var currentPage = 1;
                    var totalPages = Math.ceil(requestJson.length / 10);
                    var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                    // Mostrar la primera página
                    construirCardsNotasPF(requestJson, '#contentCards-notasFinales', notasEditables, headers);
                    displayPageNotas(currentPage, totalPages, maxVisibleButtons);


                    // Manejador de clic en la paginación
                    $(document).on('click', '.pagination a', function (e) {
                        e.preventDefault();

                        if ($(this).hasClass('prev-page')) {
                            currentPage = Math.max(currentPage - 1, 1);
                        } else if ($(this).hasClass('next-page')) {
                            currentPage = Math.min(currentPage + 1, totalPages);
                        } else {
                            currentPage = $(this).data('page');
                        }

                        displayPageNotas(currentPage, totalPages, maxVisibleButtons);
                    });
                }
                else {
                    alerta_center(response.swal,
                        "Advertencia", response.mensaje);

                }
                
            },
            error: function (error) {
                alerta_center("error", "Error", `Ocurrió un error al cargar las notas`);
                console.error("Error al cargar notas previas promedio final:", error);
            },
            complete: function () {
                enableTooltip();
                inicializartooltip();

                hideModalLoader();
                limitGradePoints();
            }
        })

    }
    catch (error) {
        alerta_center("error", "Excepción encontrada", `No se ha podido cargar las notas previas: ${error}`)

    }
}

function drawTablePF(headers, content, notasEditables, due_date, promediosCargables) {

    //console.log(content)
    //console.log(content)
    //console.log(notasEditables)
    //console.log(due_date)

    var target = "lstNotas";
    var target_table = "#lstNotas";
    let targetDiv = `#target-asistentes`;
    const promedioClass = 'promedio_bd';

    var rows = "";
    var fechaLimite = "";

    headers.forEach(function (item) {
        rows += `<th class="bg-header-table" style="padding: 5px; border-radius: 12px; color: white; margin: 10px;">${item.toUpperCase()}</th>`;
    })
    var options = "";

    //console.log("promedioscargables: ",promediosCargables)
    options = !promediosCargables ? ` hidden ` : `onclick="CommitSendPromedios()"`;

    var bodyTable = `
    <div id="asists-target">

        <div class="">
            <span class="bg-primary mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex">
                <h6>Fecha límite: <strong id="txtLimite_Fecha">${due_date}</strong> </h6>
            </span>
        </div>

        <div class="asists-target">
            <div class="table-responsive-docente">
                <table id="${target}" class="table text-nowrap" style="width:100%;border-spacing: 5px;">
                    <thead>
                        <tr style="pointer-events:none; cursor:default;">`+ rows + `</tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
            <div id="marcacionesCard" class="table-cards">
                <div id="contentCards-notasFinales">
                </div>
                <div class="pagination">
                    <!-- Links de paginación se generarán aquí -->
                </div>
            </div>
        </div>

         <div class="sectionSend mt-4 d-flex justify-content-end">
           <button class="btn btn-primary sendButton_notasPF" ${options}>Confirmar promedios</button>
        </div>

    </div>
    `

    $(targetDiv).html(bodyTable);

    $(target_table).DataTable({

        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[50, 100, 150, -1], [50, 100, 150, "All"]],
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": true,
        "responsive": true,
        "initComplete": function () {
            // Remover el texto dentro del contenedor del buscador
            //dt_generalComponents();
        },
        "language": {
            url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
            searchPlaceholder: "Buscar"
        },
        "initComplete": function (settings, json) {
            // Cambiar el texto de "Buscar:" en el label
            $('.dataTables_filter label').contents().filter(function () {
                return this.nodeType === 3;  // Filtra los nodos de texto
            }).first().replaceWith('');  // Reemplaza con el nuevo texto
        },
        data: content,
        "order": [
            //[3, "desc"],
            [0, "asc"]
        ],
        columnDefs: [
            {
                targets: 2,    // Índice de la columna que quieres ocultar (2 = tercera columna)
                visible: false // Ocultar la columna
            }
        ],
        columns: [
            {
                'data': 'fullname',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="fullname">' + data + '</span>';
                    }

                    return data;
                }
            },
            {
                'data': 'people_code_id',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="people_code_id">' + data + '</span>';
                    }

                    return data;
                }
            }, 
            //
            
            //
            {
                'data': 'promedios.promedioCalculado',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        var nombre = row.fullname;
                        var rowNota = row.ecs
                        //var rowPromedy = row.promedios

                        var titleTooltip = `Promedio calculado en base a las siguientes evaluaciones:<br>`
                        rowNota.forEach(function (item) {
                            var percentage = item.percentage_final;
                            //titleTooltip += `<p>${item.title} (${percentage}%): ${item.grade_points}</p> `
                            titleTooltip += `${item.title} (${percentage}%): ${item.grade_points}<br>`
                        });

                        return `
                        <div class="row d-flex justify-content-center">
                            <button type="button" class="btn btn-secondary text-center col-8 fw-bold"
                            data-toggle="tooltip"
                            data-placement="top"
                            data-html="true"
                            title="${titleTooltip}">
                            ${data} 
                                <strong style="color: red;">*</strong>
                            </button>
                        </div>`;
                    }

                    return data;
                }
            },
            {
                'data': 'promedios.promedio_bd',
                'render': function (data, type, row) {
                    if (type === 'display') {

                        var promedioCalculado = row.promedios.promedioCalculado;
                        var parametroNotaBaja = 13;
                        resaltedClass = (parseInt(promedioCalculado) >= parametroNotaBaja) ? "input-success_n" : "input-error_n";

                        var promedioClass = (data == "") ? resaltedClass : "";
                        var value = (data == "") ? promedioCalculado : data;

                        //var disabled = !notasEditables ? "disabled" : "";
                        var disabled = "disabled";

                        var rowNota = row.ecs
                        var titleTooltip = `Promedio calculado en base a las siguientes evaluaciones:<br>`
                        rowNota.forEach(function (item) {
                            var percentage = item.percentage_final;
                            //titleTooltip += `<p>${item.title} (${percentage}%): ${item.grade_points}</p> `
                            titleTooltip += `${item.title} (${percentage}%): ${item.grade_points}<br>`
                        });

                        var ttip = `data-bs-toggle="tooltip"
                            data-placement="top"
                            data-html="true"
                            title="${titleTooltip}"`;

                        //var options = (data == "") ? ttip : "";
                        var options =ttip;


                        var _input = `<input class = "form-control ${promedioClass}" ${options} ${disabled} placeholder="Ingrese un promedio..." value="${value}" />`;
                        return _input;
                    }

                    return data;
                }
            }
        ],
        "drawCallback": function () {
            inicializartooltip();  // Llama a la función de inicialización del tooltip
        }
    })
    //applicateCustomDt(target);
    //if (!notasEditables) {
    //    disableSendNotas();
    //}

    //inicializartooltip();
    preventChangeDefaultValue(target_table, promedioClass, 'promedios.promedio_bd');
    limitGradePoints();
}

function construirCardsNotasPF(data, contentContainer, notasEditables, detallesSeccionPadre) {
    //console.log('construir cards');
    // Limpiar el contenedor antes de agregar nuevas tarjetas
    $(contentContainer).html('');
    // Verificar si hay datos
    if (data.length === 0) {
        // Mostrar un mensaje si no hay datos
        $(contentContainer).html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
        return; // Salir de la función si no hay datos
    }
    // Crear las tarjetas
    data.forEach(function (item, index) {
        //console.log(item);
        // Información visible inicialmente
        var fullName = `<span class="fullName">${item.fullname}</span>`;
        var codigoAlumno = `<span class="people_code_id">${item.people_code_id}</span>`;

        // Campo de Nota
        var disable = notasEditables === false ? "disabled" : "";
        var type = "text";

        // Campo de Promedio Calculado con Tooltip
        var titleTooltip = `Promedio calculado en base a las siguientes evaluaciones:<br>`; // Usa <br> para saltos de línea en HTML
        item.ecs.forEach(function (evalItem) {
            var percentage = evalItem.percentage_final;
            titleTooltip += `${evalItem.title} (${percentage}%): ${evalItem.grade_points}<br>`; // Agrega <br> para cada línea
        });
        var ttip = `
                    data-bs-toggle="tooltip"
                    data-placement="top"
                    data-html="true"
                    title="${titleTooltip.trim()}"
                    disabled
                    `;
        
        //var options = (item.promedios.promedio_bd == "") ? ttip : "disabled";
        var options = ttip;

        var nota = (item.promedios.promedio_bd == "") ? item.promedios.promedioCalculado : item.promedios.promedio_bd;

        var promedioCalculado = item.promedios.promedioCalculado;
        var parametroNotaBaja = 13;
        resaltedClass = (parseInt(promedioCalculado) >= parametroNotaBaja) ? "input-success_n" : "input-error_n";

        //resaltedClass = "input-success";
        var promedioClass = (item.promedios.promedio_bd == "") ? resaltedClass : "";

        var notaInput = `<input ${disable} ${options} name="nota" class="form-control nota ${promedioClass}" type="${type}" min="0" max="20" value="${nota}">`;

        // Inicializar el tooltip
        $('[data-toggle="tooltip"]').tooltip({
            html: true // Permite HTML en el contenido del tooltip
        });

        var notaField = `
            <div class="row">
                <div class="col-sm-12"> 
                    ${notaInput}
                </div>
            </div>
        `;

        var card = `
            <div class="mobile-card card-page-${Math.floor(index / 10) + 1}" data-people-code-id="${item.people_code_id}" 
                 data-details-grading='${JSON.stringify(item.detailsGrading)}'>
                <!-- Datos visibles: Nombre Completo y Código del Alumno -->
                <h5><i class="fas fa-user" style="margin-right: 5px;"></i> ${fullName} - ${codigoAlumno}</h5>

                <!-- Campo de Nota -->
                <p><strong>Promedio:</strong> ${notaField}</p>

            </div>
        `;
        //"//<p><strong>Promedio Calculado:</strong> ${promedioButton}</p>//"

        $(contentContainer).append(card);
    });

    // Inicializar todos los tooltips dentro del contenedor después de agregar las tarjetas
    $('[data-toggle="tooltip"]').tooltip();
}
function obtenerDatosCardsNotasPF(contentContainer) {
    var data = [];

    // Seleccionar cada tarjeta dentro del contenedor y extraer los datos
    $(contentContainer).find('.mobile-card').each(function () {
        // Obtener datos básicos
        let peopleCodeId = $(this).data('people-code-id');
        let detailsGrading = JSON.parse($(this).attr('data-details-grading'));

        // Obtener el nombre completo y código de estudiante
        let fullname = $(this).find('.fullName').text().trim();
        let codigoAlumno = $(this).find('.people_code_id').text().trim();

        // Obtener el valor de la nota
        let grade = $(this).find('input[name="nota"]').val().trim();

        // Obtener la fecha de revisión y detalles de sección
        let revision_date = $(this).find('.revision_date').text().trim();

        // Tooltip del promedio calculado
        let promedioTooltip = $(this).find('.btn-secondary').attr('title').trim();

        // Estructura del objeto a agregar a la lista
        data.push({
            "fullname": fullname,
            "people_code_id": peopleCodeId,
            "promedios": {
                "promedio_bd": grade,
                "promedioCalculadoTooltip": promedioTooltip
            },
            "revision_date": revision_date,
            "detailsGrading": detailsGrading
        });
    });

    return data;
}
function CommitSendPromedios() {
    //commmitChanges("Se cargarán las notas finales", "¿Está seguro de realizar el registro?", sendNotas_Finales, null)
    commmitChanges("Esta acción no se puede deshacer", "¿Está seguro de realizar el registro de los promedios?", sendPromediosSF, null)
}

function sendNotas_Finales() {
    try {
        let isTableResponsiveHidden = $('.table-responsive-docente').css('display') === 'none';

        // Verifica si la tabla está oculta para decidir la fuente de los datos
        let body;
        if (isTableResponsiveHidden) {
            // Obtener datos de las tarjetas cuando la tabla esté oculta
            body = obtenerDatosCardsNotasPF('#contentCards-notasFinales');
        } else {
            // Obtener datos de la tabla generada
            body = mergeNotasFinalesDetailsHeader();
        }

        //console.log(body);

        // Obtener la fecha de vencimiento
        let vencimiento = $('#txtLimite_Fecha').html();
        var formdxtx = new FormData();

        formdxtx.append("request", JSON.stringify(body));
        formdxtx.append("due_Date", vencimiento);

        $.ajax({
            url: rq_carga_notas_finales,
            type: 'POST',
            data: formdxtx,
            contentType: false,
            processData: false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status = response.success;

                if (status) {
                    sendEC_prom(); // Realizo nuevamente la consulta para visualizar los cambios
                    alerta_center(response.swal, "Exito", response.mensaje);
                } else {
                    alerta_center(response.swal, "Advertencia", response.mensaje);
                }
            },
            error: function (error) {
                alerta_center("error", "Error",
                    `Ocurrió un error al registrar las notas: ${error.responseText}`);
                console.error("Error en el registro de notas: " + error);
            },
            complete: function () {
                hideModalLoader();
            }
        });
    } catch (error) {
        alerta_center("error", "Excepción encontrada", `No se ha podido registrar las notas proporcionadas: ${error.message}`);
    }
}

function mergeNotasFinalesDetailsHeader() {

    var academic_year = $('#txtAnio').val()
    var academic_term = $('#txtSemestre').val()
    var academic_session = $('#txtAcademicSession').val()
    var event_id = $('#txtEventId').val()
    var section = $('#txtSection').val()
    
    var body = getContentNotasFinales();

    var data = [];
    data.push({
        "academic_year": academic_year,
        "academic_term": academic_term,
        "academic_session": academic_session,
        "event_id": event_id,
        "section": section,
        "opid": "frontuser",
        "notasPromedioFinal": body
    })


    return data[0];
}

function getContentNotasFinales() {
    var data = [];
    var targetItems = "tr.table_row";

    //Genero un Json con los componentes a NotasPromedioFinalBE
    $(targetItems).each(function () {
        // Obtener el valor de 'people_code_id' (el primer td en cada fila)
        let peopleCodeId = $(this).find('.people_code_id').text().trim();

        // Obtener el valor de 'PF' (el input dentro del td con la clase PF)
        let grade = $(this).find('td.PF input').val().trim();

        // Crear un objeto y agregarlo a la lista
        data.push({
            "people_code_id": peopleCodeId,
            "grade": grade,
            "comment": ""
        });
    });

    //
    //let jsonData = JSON.stringify(data);

    return data;
}


//utilidades
function disableSendNotas(mensaje) {
    alerta("info", "No se podrán actualizar las notas", mensaje)

    //desactivo ambos botones(quedaria bacan con un switch ;v)
    $('.sendButton_notas').attr("disabled", true)
    $('.sendButton_notasPF').attr("disabled", true)
}



function evaluateShowPromediofinal() {
    try {
        var sgks = recopilarECS_prom();
        $.ajax({
            url: evaluarVisibilidadPF,
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify(sgks),
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                var success = response.success;

                if (success) {
                    var data = response.data;
                    var body_content = buildTogglePF(data);
                }
                else {
                    alerta_center(response.swal, "", response.mensaje);
                }
            },
            error: function (error) {
                alerta_center("error", "Error",
                    `Ocurrió un error: ${error.responseText}`);
                console.error(error);
            },
            complete: function () {
                hideModalLoader();

            }
        })
    }
    catch (error) {
        alerta_center("error", "Excepción encontrada", `${error.message}`);

    }
}


function buildTogglePF(data) {

    try {
        var html = "";
        data.forEach(function (item) {
            //console.log(item);
            var title = item.title;
            var selector = `${Math.floor(Math.random() * 500)}${Math.floor(Math.random() * 500)}`;
            var plazoVencido = item.plazoVencido;
            var due_date = item.due_date;
            var class_vencimiento = (plazoVencido) ? "danger" : "blue";
            var content = generateTablePf(item.participantes, plazoVencido, due_date, class_vencimiento, plazoVencido)
            

            html += generate_dynamic_ToggleSF(title, selector, content, class_vencimiento, plazoVencido);
        })

        toastHtml("warning"
            //, "No se puede acceder a Promedios Finales debido a notas pendientes. Complete la información o contacte a registros académicos para regularizar de ser necesario."
            //, "Para poder acceder a la carga de promedios finales debe de registrar primero todas las notas de las evaluaciones. Por favor, revise detenidamente el detalle adjunto, de haber notas pendientes en evaluaciones ya vencidas, ponerse en contacto con el área de registros académicos."
            , "No puede registrar promedios porque hay notas pendientes. Si existen notas vencidas, contacte al área de registros académicos; de lo contrario, edítelas usted mismo."
            ,html);
    }
    catch (error) {
        alerta_center("error", "Error",
            `Ocurrió un error al construir las notas faltantes de registro: ${error.message}`);
    }
}

function generateTablePf(participantes, plazoVencido, due_date, class_vencimiento) {
    //console.log(participantes);
    try {
        var cantidadParticipantes = participantes.length;

        var table_response = "";
        var alumnos_cant = `<span class="bg-${class_vencimiento} mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex fw-bold shake_element"><h6 class="mb-0">Estudiantes encontrados: <strong >${cantidadParticipantes}</strong> </h6></span>`;
        
        var due_date = `<span class="bg-${class_vencimiento} mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex fw-bold shake_element"><h6 class="mb-0">Fecha de vencimiento: <strong >${due_date}</strong> </h6></span>`;

            
        table_response += alumnos_cant;
        table_response += due_date;
        table_response += `<table class="table table-striped table-bordered">`;
        table_response += `<thead class="bg-blue text-white text-center">
                                <tr>
                                    <th>Código de Estudiante</th>
                                    <th>Nombres</th>
                                </tr>
                            </thead>`;
        table_response += `<tbody>`;
        participantes.forEach(function (est) {
            table_response += `<tr>
                    <td>${est.people_code_id}</td>
                    <td>${est.fullname}</td>
                </tr>`;
        })

        table_response += `</tbody>`;
        table_response += `</table>`;

        return table_response;
    }
    catch (error) {
        alerta_center("error", "Error",
            `Ocurrió un error al construir la tabla de estudiantes sin notas registradas: ${error.message}`);
    }
}