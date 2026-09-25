const STATUS_PENDIENTE = "SELECCIONE...";

function buildSessionsView(sIdCurso, sSeccion, sAnio, sSemestre, academic_session, event_sub_type) {
    var formDatr = new FormData();

    //formDatr.append("sCodDocente", sCodDocente)
    formDatr.append("sIdCurso", sIdCurso);
    formDatr.append("sSeccion", sSeccion);
    formDatr.append("sAnio", sAnio);
    formDatr.append("sSemestre", sSemestre);
    formDatr.append("academic_session", academic_session);
    formDatr.append("event_sub_type", event_sub_type);

    let targetDiv = "#div_" + sAnio + sSemestre + sSeccion + sIdCurso;


    $.ajax({
        url: listHorarioSesionesView, //SESSIONS_SCHEDULE
        type: 'POST',
        data: formDatr,
        contentType: false,
        processData: false,
        beforeSend: function () {
            showModalLoader();
            cleanCardAsistence(); // Limpia la lista de asistencia
        },
        success: function (response) {
            // Si el contenedor ya tiene contenido visible, lo oculta
            if ($(targetDiv).is(':visible')) {
                $(targetDiv).slideUp(); // Ocultar con animación si ya está visible
            } else {
                $(".detail-view").slideUp(); // Oculta cualquier otro detalle visible
                $(targetDiv).html(response).slideDown(); // Muestra el nuevo contenido
            }
        },
        error: function (error) {


            ("error", "Error", "Ocurrió un error al cargar la vista parcial: " + error.responseText);
            console.error("Error al cargar la vista parcial:", error);
        },
        complete: function () {
            hideModalLoader();
            setTimeout(function () {
                $('#idtgl').focus();
                //console.log("focus")
            },1000)
        }
    })
}
function cleanCardAsistence() {
    $('#lstAsistencia').DataTable().clear().destroy()
    $('#detailsCurso').html('')
}

function buscarParticipantes(anio,semestre,seccion,event_id,turno
    ,date, sections64_base) {

    try {
        //var anio = $('#sAnio').val();
        //var semestre = $('#sSemestre').val();
        //var seccion = $('#sSeccion').val();
        //var event_id = $('#sIdCurso').val();
        //var turno = $('#academic_session').val();

        $('#attendance_date').val(date);

        var formdats = new FormData();
        formdats.append("ACADEMIC_YEAR", anio);
        formdats.append("ACADEMIC_TERM", semestre);
        formdats.append("SECTION", seccion);
        formdats.append("EVENT_ID", event_id);
        formdats.append("ATTENDANCE_DATE", date);
        formdats.append("ACADEMIC_SESSION", turno);
        formdats.append("sections_encoded", sections64_base);


        $.ajax({
            url: listadoAsistentesSesion, //list_asistents
            type: 'POST',
            data: formdats,
            contentType: false,
            processData: false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {

                console.log(response)

                var seccionesHijas = response.seccionHijas; //cantidad de secciones hijas (hacer match con la )
                var asistenciaEditable = response.asistenciasEditables;
                //console.log("Asitencia Editable: ", asistenciaEditable)
                if (!asistenciaEditable) {
                    $('#btnSendAttendance').attr("disabled", "true");
                    $('#allabsents').attr("disabled", "true");
                    $('#allpresents').attr("disabled", "true");
                }
                else {
                    $('#btnSendAttendance').removeAttr("disabled");
                    $('#allabsents').removeAttr("disabled");
                    $('#allpresents').removeAttr("disabled");
                }


                var countResponse = response.data.length;
                //console.log(countResponse)
                var htmlDetails = drawInfoSession(response.cardInfo, seccionesHijas, asistenciaEditable, countResponse);
                //console.log('Datos JSON recibidos:', response.data)
                drawTable(response.data, response.attendance_status, asistenciaEditable);

                var requestJson = response.data;
                var currentPage = 1;
                var totalPages = Math.ceil(requestJson.length / 10);
                var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                // Construir todas las tarjetas una vez y mostrar la primera página
                construirCards(requestJson, '#contentCards-asistenciaAlumnos', response.attendance_status, asistenciaEditable);
                displayPageAsistencias(currentPage, totalPages, maxVisibleButtons);

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

                    displayPageAsistencias(currentPage, totalPages, maxVisibleButtons);
                });


                before_validate_attendance_status_pending(response.data, asistenciaEditable); //validar estatus de marcacion pendientes

                $('#detailsCurso').html(htmlDetails);
                $("#tab_asistencia").removeClass('d-none');
                $('#asists-tab').trigger("click");

                //validacion de secciones hija
                if (seccionesHijas.length > 0) {
                    var content = generateHTMLSeccionesHijas(seccionesHijas,"");
                    toastSeccionesHijas(content);
                }

            },
            error:function(error) {
                alerta_center("error", "Error", "Ocurrió un error al cargar al cargar los asistentes de la sesión: " + error.responseText);
                console.error(error.responseText);
            },
            complete: function () {
                hideModalLoader();
            }
        })

        
    }
    catch (error) {
        console.error(error.responseText);
        alerta_center("error", "Excepción encontrada", "Ocurrió una excepción al cargar los asistentes de la sesión: " + error.message);
    }

}
function displayPageAsistencias(page, totalPages, maxVisibleButtons) {
    //console.log('display');

    // Ocultar todos los cards y mostrar solo los de la página actual
    $('.mobile-card').hide();
    $(`.card-page-${page}`).show();

    // Actualizar la paginación
    updatePaginationAsistencias(page, maxVisibleButtons, totalPages);
}

// Función para actualizar la paginación
function updatePaginationAsistencias(currentPage, maxVisibleButtons, totalPages) {
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
function drawInfoSession(jsonDetails, seccionesHijas, asistenciaEditable,asistentes) {
    var disabled_options =""
    if (!asistenciaEditable) {
        disabled_options += " disabled";
        //$('#allabsents').attr("disabled", "true");
        //$('#allpresents').attr("disabled", "true");
    }

    var hidden_options = (asistentes > 0) ? "" : "hidden";
    //console.log(hidden_options)

    jsonDetails.sort((a, b) => a.dHoraInicio.localeCompare(b.dHoraInicio)); //ordeno las fechas u


    var optionalContent = "";
    if (seccionesHijas.length > 0) {
        var content = generate_ToggleSF(seccionesHijas);
        optionalContent = content;
        //console.log(optionalContent)
    }


    var academic_year = ''; var academic_term = '';
    var section = ''; var event_sub_type = '';
    var academic_session = ''; var event_id = '';
    var aula = ''; var sede = '';
    var sessionDate = '';
    var dHORARIO = '<div class="col-12">' //aqui voy a iterar los elementos que van llegando en la iteracion posterior
    var event_long_name = '';
    var docente = '';
    var dFechaInicio = '';
    var dFechaFin = '';
    var sModalidad = '';

    var iteraciones = jsonDetails.length; //validare que seea la ultima iteracion para obtener la hora de sesion
    var contador = 0;
    jsonDetails.forEach(function (i) {
        //console.log(i);
        academic_year = i.academiC_YEAR; academic_term = i.academiC_TERM; 
        section = i.section; event_sub_type = i.evenT_SUB_TYPE;
        academic_session = i.academiC_SESSION; event_id = i.evenT_ID;
        aula = i.sAula;//obs
        sede = i.sede;
        sessionDate = i.session_date;
        dHORARIO += `<span class="bg-primary mr-1 mb-1 p-2 rounded-pill text-white font-weight-bold d-inline-flex" style="margin-right: 5px;">${i.dHoraInicio}-${i.dHoraFin}</span>`
        event_long_name = i.evenT_LONG_NAME;
        docente = i.sNombreDocente;
        dFechaInicio = i.dFechaInicio;
        dFechaFin = i.dFechaFin;
        sModalidad = i.sModalidad;

        contador++;
        if (contador == iteraciones) {
            dHORARIO += '</div>'
        }
    })

    var i = jsonDetails;
    var htmlAsString= `
    <div class='row'>
        <div class='col-12 px-4'>
            <div class='card'>
                <div class='card-header'>
                    <h5 class='card-title'>Detalles del Curso </h5>
                </div>
                <div class='card-body'>
                    <p class='card-text text-primary fw-bold'>Curso:${academic_year}/${academic_term}/${academic_session} - ${event_id}/${event_sub_type}/${section}</p>
                    <p class='card-text'><strong>Aula:</strong> ${aula} - ${sede}</p>
                    <p class='card-text'><strong>Fecha:</strong> ${sessionDate}</p>
                     <p class='card-text'><strong>Modalidad:</strong> ${sModalidad}</p>
                    <p class='card-text'><strong>Fecha Inicio:</strong> ${dFechaInicio}</p>
                    <p class='card-text'><strong>Fecha Fin:</strong> ${dFechaFin}</p>
                    <p class='card-text'><strong>Horarios:</strong>${dHORARIO}</p>

                    <p class='card-text'><strong>Curso:</strong> ${event_long_name}</p>
                   
                    <p class='card-text' hidden>${docente}</p>
                    ${optionalContent}
                </div>
            </div>
        </div>
    </div>
    <br>
    <div class='row' ${hidden_options}>
        <div class="col-12 px-4 d-flex justify-content-end gap-2" >
            <button id="downloadParticipants" class="btn btn-outline-primary btn-sm d-inline-flex align-items-center" onclick="downloadParticipants()">
                <i class="fas fa-file-excel me-2"></i> Listado Estudiantes
            </button>

            <button ${disabled_options} id="allpresents" class="btn btn-outline-success btn-sm d-inline-flex align-items-center" onclick="fillAllSelects('PRESENT','#allpresents')">
                <i class="fas fa-user-check me-2"></i> Todos presentes
            </button>

            <button ${disabled_options} id="allabsents" class="btn btn-outline-danger btn-sm d-inline-flex align-items-center" onclick="fillAllSelects('ABSENT','#allabsents')">
                <i class="fas fa-user-times me-2"></i> Todos ausentes
            </button>
        </div>
    </div>
    `;

    

    return htmlAsString;

}
function fillAllSelects(value,idButton) {
    try {
        $(idButton).attr("disabled", "true")

        
        //para elementos mobile
        $('.attendance_status').val("")

        if ($('#marcacionesCard').length > 0 && $('#marcacionesCard').is(':visible')) {
            //console.log("limpiando elementos mobile")
            $('.attendance_status').val(value);
        }
        else {
            //para datatable
            //console.log("limpiando elementos pc")
            fillAllSelectsDatatable(value)
        }
    }
    catch (error) {
        alerta_center("error", "Error inesperado", `Ocurrió un error al marcar el valor solicitado: ${error.message}`)
        console.error(error);
    }
    finally {
        setTimeout(function () {
            $(idButton).removeAttr("disabled")
        },3000)
    }

}


function fillAllSelectsDatatable(value) {
    // Accede a la instancia de DataTables
    let target = '#lstAsistencia';
    var table = $(target).DataTable();

    // Guarda la página actual
    var currentPage = table.page();
    //console.log(currentPage);

    // Recorre todas las filas, incluidas las no visibles, usando la API de DataTables
    table.rows().every(function () {
        // Obtén el elemento .attendance_status en la fila actual
        var row = $(this.node());
        row.find('.attendance_status').val("").val(value).trigger('change');
    });

    // Restaura la página actual
    table.page(currentPage).draw(false);
}


function construirCards(data, contentContainer, elements_asistence, asistenciaEditable) {
    var options_hide = "";
    //if (!asistenciaEditable) { options_hide+="disabled" }
    if (!asistenciaEditable) {
        options_hide += "disabled";
    }


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
        var codigoAlumno = `<span class="people_code_id-asistents">${item.people_code_id}</span>`;
        var nombreAlumno = `<span>${item.names}</span>`;

        // Campo oculto de Estado de Asistencia como select
        //let elements_asistence = [STATUS_PENDIENTE, "ABSENT", "FALTA JUST. ESC", "PRESENT", "TARDANZA"];

        let attendanceOptions = elements_asistence.map(status => {
            // Verifica si este elemento debe estar seleccionado
            let selected = item.attendance_status === status.value ? 'selected' : '';
            // Genera el elemento <option> usando value y desc
            return `<option value="${status.value}" ${selected}>${status.desc}</option>`;
        }).join('');

        var attendanceStatus = `<select ${options_hide} id="attendance_status_${item.people_code_id}" class="form-control attendance_status">${attendanceOptions}</select>`;

        // Campo oculto de Comentarios como input
        var comentarios = `<input ${options_hide} id="comments_${item.people_code_id}" class="form-control comments" value="${item.comments || ''}" />`;

        // Estructura de la tarjeta con datos visibles e inicialmente ocultos
        var card = `
            <div class="mobile-card card-page-${Math.floor(index / 10) + 1}" data-people-code-id="${item.people_code_id}" 
                 data-section-info='${JSON.stringify(item.sectionInfo)}'>
                <!-- Datos visibles: Código y Nombre del Alumno -->
                <h5><i class="fas fa-user" style="margin-right: 5px;"></i> ${codigoAlumno} - ${nombreAlumno}</h5>
                <!-- Detalles adicionales ocultos -->
                <div>
                    <p><strong>Estado de Asistencia:</strong> ${attendanceStatus}</p>
                    <p><strong>Comentarios:</strong> ${comentarios}</p>
                </div>
            </div>
        `;

        $(contentContainer).append(card);
    });
}
function existeCardVacio(containerSelector, selectClassName) {
    let cardVacio = false;

    // Recorrer cada card dentro del contenedor especificado
    $(`${containerSelector} .mobile-card`).each(function () {
        const selectElement = $(this).find(`select.${selectClassName}`);

        const selectValue = selectElement.val();

        // Verificar si el select está vacío o contiene un valor predeterminado
        if (selectValue === null || selectValue === '' || selectValue === undefined
            //|| selectValue === STATUS_PENDIENTE
            ) {
            cardVacio = true; // Marcar que hay un select vacío
            selectElement.addClass('input-error');

            // Remover la clase después de 2 segundos
            setTimeout(() => {
                selectElement.removeClass('input-error');
            }, 2000);

            return false; // Romper el bucle al encontrar el primer select vacío
        }
    });

    return cardVacio;
}
function showLargePhoto(photoUrl) {
    document.getElementById('modalPhoto').src = photoUrl; // Cambia el src de la imagen en el modal
}
function drawTable(json, elements_asistence, asistenciaEditable) {
    //const elements_asistence = [STATUS_PENDIENTE, "ABSENT", "FALTA JUST. ESC", "PRESENT", "TARDANZA"];
    var options_hide = "";
    if (!asistenciaEditable) {
        options_hide += "disabled";
    }

    let target = '#lstAsistencia';
    // Destruir cualquier instancia previa de DataTable en el elemento objetivo
    $(target).DataTable().clear().destroy();

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
        "order": [[2, "asc"]],
        data: json,
        columns: [
            {
                'data': 'path_photo',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return `
                            <a href="#" onclick="showLargePhoto('${data}')" data-toggle="modal" data-target="#photoModal">
                                <img src="${data}" alt="Foto" style="width:50px; height:50px; border-radius:50%;">
                            </a>
                        `;
                    }
                    return data;
                }
            },
            {
                'data': 'people_code_id',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span class="people_code_id-asistents">' + data + '</span>';
                    }
                    return data;
                }
            },
            {
                'data': 'names',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span>' + data + '</span>';
                    }
                    return data;
                }
            },
            {
                'data': 'people_code_id',
                'render': function (data, type, row) {
                    var optionalclass = row.section_details.optionalclass;
                    var section_i = row.section_details.section_i;
                    console.log(optionalclass, section_i);

                    if (type === 'display') {
                        return `<span class="${optionalclass}">` + section_i + '</span>';
                    }
                    return data;
                }
            },
            {
                'data': 'modality',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return '<span>' + data + '</span>';
                    }
                    return data;
                }
            },
            {
                'data': 'attendance_status',
                'render': function (data, type, row) {
                    

                    if (type === 'display') {
                        // Genera las opciones del <select> usando elements_asistence
                        let options = elements_asistence.map(option => {
                            // Agrega 'selected' si el valor actual coincide con data
                            let selected = data === option.value ? 'selected' : '';
                            return `<option value="${option.value}" ${selected}>${option.desc}</option>`;
                        }).join(''); // Une todas las opciones en una sola cadena

                        // Retorna el <select> con las opciones generadas y un id único basado en people_code_id
                        return `<select ${options_hide}  id="attendance_status_${row.people_code_id}" class="form-control attendance_status">${options}</select>`;
                    }
                    // Si no es el tipo 'display', solo retorna el valor de 'data'
                    return data;
                }
            },
            {
                'data': 'comments',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        return `<input ${options_hide} id="comments_${row.people_code_id}" class="form-control comments" value='${data}' />`;
                    }
                    return data;
                }
            }
        ]
    })
    //applicateCustomDt(target);

    preventChangeDefaultValue_Select(target, "attendance_status", "attendance_status")
}

function before_validate_attendance_status_pending(json, asistenciaEditable) {
    var len = json.length;
    let countValues = 0;

    if (len > 0) {
        var flagAttendance = STATUS_PENDIENTE;
        

        json.forEach(function (item) {
            if (item.attendance_status === flagAttendance) {
                countValues++;
            }
        })
        if (countValues != 0 && asistenciaEditable) {
            alerta_center('info', `Se encontraron ${countValues} marcaciones pendientes.`,'Recuerde completar la información.');
        }
    }
    
}


function sendAttendance() {
    try {
        var rshidden = '.table-responsive'
        // Verificar si el contenedor de la tabla está oculto para cuando sea mobile
        let isTableResponsiveHidden = $(rshidden).css('display') === 'none';

        // Comprobar si hay registros en la tabla
        if ($('#lstAsistencia').DataTable().row().count() === 0) {
            alerta_center("warning", "Advertencia", "No se encontraron registros en asistencia para guardar");
        }
        //validar selects del datatable con pendiente y que el datatable no este oculta
        else if (existeSelectVacio('attendance_status', 'attendance_status', '#lstAsistencia') && !isTableResponsiveHidden) {
            alerta_center("warning", "Asistencias faltantes", "Por favor ingrese todas las asistencias respectivas.")
        }
        //validar selects de los Card con pendiente y que el datatable este oculta
        else if (existeCardVacio('#contentCards-asistenciaAlumnos', 'attendance_status') && isTableResponsiveHidden) {
            alerta_center("warning", "Asistencias faltantes", "Por favor ingrese todas las asistencias respectivas en las tarjetas.")
        }
        else {
            commmitChanges("¿Está seguro?", "Se cargarán las asistencias de los estudiantes indicados.",
                function () {
                    // Si el contenedor de la tabla está oculto, llama a la función para guardar desde los cards
                    if (isTableResponsiveHidden) {
                        var JsonRequestCards = getJsonAttendanceCards(); // Obtiene los datos de las tarjetas
                        filterAsistencia(JsonRequestCards);
                    } else {
                        var JsonRequestSF = getJsonAttendanceSF();
                        filterAsistencia(JsonRequestSF);
                    }
                },
                null
            );
        }
    }
    catch (error) {
        console.error(error.responseText);
        alerta_center("error", "Excepción encontrada", "Ocurrió una excepción al recopilar la información de asistencia: " + error.message);
    }
}

function validateAsitencia() {
    var flag = true;

    $('.attendance_status').each(function (index, item) {
        var status = $(item).val()
        if (status === STATUS_PENDIENTE || status === '') {
            //console.log(status)
            flag = false;
        }
    });

    return flag;
}

function getJsonAttendanceSF() {
    var table = $('#lstAsistencia').DataTable();

    // Obtener los datos actuales de la tabla, incluyendo el valor del select
    var tableData = [];

    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.data(); // Obtener los datos de la fila

        // Encontrar el select dentro de la celda correspondiente
        var selectElement = $(this.node()).find('select.attendance_status');
        //encontrar el input dentro de la celda correspondiente
        var inputElement = $(this.node()).find('input.comments');

        if (selectElement.length > 0) {
            var selectedValue = selectElement.val(); // Obtener el valor seleccionado del select
            var inputcomments = inputElement.val();

            // Actualizar el campo "attendance_status" con el valor seleccionado
            data.attendance_status = selectedValue;
            data.comments = inputcomments;
        }

        // Añadir la fila actualizada al array de datos
        tableData.push(data);
    });

    return tableData;
}

function getJsonAttendanceCards() {
    var cardsData = []; // Array para almacenar los datos de las tarjetas

    // Iterar sobre cada tarjeta
    $('.mobile-card').each(function () {
        var peopleCodeId = $(this).data('people-code-id'); // Obtener el ID del alumno
        var selectElement = $(this).find('select.attendance_status');
        var inputElement = $(this).find('input.comments');

        // Obtener el valor del select y el input
        var selectedValue = selectElement.val();
        var inputComments = inputElement.val();

        // Crear un objeto con la misma estructura que el de la tabla
        var cardData = {
            people_code_id: peopleCodeId,
            attendance_status: selectedValue,
            comments: inputComments
        };

        // Obtener sectionInfo desde el atributo data
        var sectionInfo = $(this).data('section-info');

        // Solo agregar sectionInfo si no es null
        if (sectionInfo) {
            cardData.sectionInfo = sectionInfo; // Asignar el sectionInfo real
        }

        // Añadir el objeto al array
        cardsData.push(cardData);
    });

    return cardsData; // Devolver el array con los datos de las tarjetas
}

// Convertir FormData a JSON
function formDataToJson(formData,asistentes) {
    const object = {};
    formData.forEach((value, key) => {
        object[key] = value;
    });
    object["asistentes"] = asistentes; // Agregar el array de asistentes al objeto
    return JSON.stringify(object);
}

//para registrar información asistencia
function filterAsistencia(jsonString) {
    var asists = JSON.stringify(jsonString);
    //var asists = jsonString;
    var datex =$('#attendance_date').val()
    //var attendance_date = convertDateFormat(datex)

    //console.log(datex);

    var formdatta = new FormData();
    formdatta.append("asists_s",asists);
    formdatta.append("attendance_date", datex);

    try {
        $.ajax({
            url: sendJsonStudents,
            type: 'POST',
            data: formdatta,
            //contentType: 'application/json',
            contentType: false,
            processData: false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status = response.success;

                if (status) {
                    alerta_center(response.swal, "Éxito", response.mensaje);
                }
                else {
                    //valido que  response.codigosError contenga mas de un elemento
                    var errores = response.codigosError;
                    //console.log(errores)
                    var mensaje = "";
                    if (errores.length > 0) {
                        mensaje = `<h5><strong>${response.mensaje}</strong></h5>`;
                        errores.forEach(function (item) {
                            mensaje += `<p>Código de estudiante: ${item.people_code_id} - Status: ${item.attendance_status}</p>`
                        })
                    }
                    else {
                        mensaje = response.mensaje;
                    }

                    api_result_alert(response.swal, "Advertencia", mensaje);

                }

            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error al cargar la asistencia: " + error.responseText);
                console.error(error.responseText);
            }
            ,complete: function () {
                enableTooltip();
                hideModalLoader();
                limitGradePoints();
            }
        })
    }
    catch (error) {
        console.error(error.responseText);
        alerta_center("error", "Excepción encontrada", "Ocurrió una excepción al cargar la asistencia: " + error.message);
    }
}

//para manejar una reporteria de alumnos tomando como origen el datatable PREVIAMENTE CONSTRUIDO
function downloadParticipants() {
    try {
        // Inicializa el DataTable (si no lo has hecho ya)
        var table = $('#lstAsistencia').DataTable();
        // Obtener todos los datos almacenados en el DataTable
        var data = table.data().toArray();
        var request = JSON.stringify(data); //xd

        var fdxxx = new FormData();
        fdxxx.append("request", request);

        $.ajax({
            url: generateReporteEstudiantes,
            type: 'POST',
            data: fdxxx,
            contentType: false,
            processData:false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                var status = response.success;
                if (status) {
                    var pruebasSlug = response.pathAuxiliar; //'/por si se encuentra en un entorno de pruebas';
                    let urlResponse = window.location.origin + pruebasSlug + "/" + response.redirect;

                    window.location.href = urlResponse;
                    //window.open(urlResponse, '_blank');
                    alerta_center(response.swal, "Exito", response.mensaje);
                }
                else {
                    alerta_center(response.swal,"Advertencia",response.mensaje)
                }
            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error al generar el reporte: " + error.responseText);
                console.error(error.responseText);
            },
            complete: function () {
                hideModalLoader();
            }

        })
    }
    catch (error) {
        console.error(error.responseText);
        alerta_center("error", "Excepción encontrada", "Se ha producido un error al generar el reporte de estudiantes: " + error.message);
    }
}