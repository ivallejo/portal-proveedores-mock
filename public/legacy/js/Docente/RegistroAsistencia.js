const sinMarcar = "00:00:00";
let _paramIdSesion = null;
function consultarSesiones() {
    $.ajax({
        url: requestSesiones,
        type: 'POST',
        beforeSend: function () {
            showModalLoader();
        },
        success: function (response) {
            let statusExec = response.success;


            if (statusExec) {
                var requestJson = JSON.parse(response.data);
                // Ordenar el JSON por sIdSesion en orden ascendente
                requestJson.sort((a, b) => {
                    return parseInt(a.sIdSesion) - parseInt(b.sIdSesion);
                });

                //console.log(response.data);

                construirTableSesiones(requestJson, response.parametro);

                //SECCION PARA CONSTRUIR CARDS MOBILE
                var currentPage = 1;
                var totalPages = Math.ceil(requestJson.length / 10);
                var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                // Mostrar la primera página
                displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-asistencias');

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
                    displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-asistencias');
                });
            }
            else {
                alerta(response.swal, "Advertencia", response.stackTrace)
            }
            
        },
        error: function (error) {
            console.error("Se ha producido un error al realizar la solicitud" +error.responseText);
        },
        complete: function () {
            hideModalLoader();
        }
    })
}

function construirTableSesiones(response, parametro) {
    //console.log(response);
    //console.log(response);
    let target = '#lstAsistencia';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams && urlParams.get('s')) {
        _paramIdSesion = window.atob(urlParams.get('s'));
    }
    // Destruir cualquier instancia previa de DataTable en el elemento objetivo
    $(target).DataTable().clear().destroy();

    // Configurar DataTable
    $(target).DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[50, 100, 150, -1], [50, 100, 150, "All"]],
        "searching": true,
        "ordering": true,
        "info": true,
        "autoWidth": true,
        "responsive": true,
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
        "order": [[0, "asc"]],
        columnDefs: [
            {
                targets: 0,    // Índice de la columna que quieres ocultar (0 = primera columna)
                visible: false // Ocultar la columna
            }
        ],
        data: response,
        columns: [
            { 'data':'sIdSesion'},
            {
                'data': 'dFechaSesion',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        // En modo de visualización, mostrar el icono de calendario y la fecha formateada
                        return '<div style="margin: auto 8px; text-align: center;">' +
                            '<i class="fas fa-calendar-alt" style="margin-right: 5px;"></i>' +
                            '<span>' + transformDateFormat(extractDate(data)) + '</span></div>';
                    }
                    // En otros modos (ordenamiento, búsqueda, etc.), mantener el valor original
                    return data;
                }
            },
            {
                'data': 'sDesCurso',
                'render': function (data, type, row) {
                    // Verificar si sTema tiene un valor significativo
                    var tema = '';
                    if (row.sTema && row.sTema.trim() !== '') { // Asegúrate de que no es nulo ni una cadena vacía
                        tema = '<br>Tema: ' + row.sTema;
                    }
                    var codCurso = '';
                    if (row.sIdCurso && row.sIdCurso.trim() !== '') { // Asegúrate de que no es nulo ni una cadena vacía
                        codCurso = '<strong style="background: #f2f7ab; padding: 3px; border-radius: 5px; ">' + row.sIdCurso + '</strong> | ';
                    }
                    var sIdSeccion = '<br>Seccion: <strong style="background: #abd3f7; padding: 3px; border-radius: 5px;">' + row.sSeccion+'</strong>';
                    return codCurso + '<strong>' + data + '</strong>' + sIdSeccion + tema;
                }
            },
            {
                'data': 'sAula',
                'render': function (data, type, row) {
                    return '<div style="margin: auto 8px; text-align: center;">' + data + '</div>';
                }
            },
            {
                'data': 'dHoraInicio',
                'render': function (data, type, row) {
                    // Función auxiliar para ocultar "00:00:00"
                    function formatTime(time) {
                        return time === '00:00:00' ? '-' : time;
                    }

                    // Verificar si la entrada es "00:00:00" y mostrar "-"
                    var entrada = row.dHoraInicio && row.dHoraInicio !== '00:00:00' ?
                        '<i class="fas fa-door-open"></i> Inicio: ' + row.dHoraInicio :
                        '<i class="fas fa-door-open"></i> Inicio: -';

                    // Verificar si la salida es "00:00:00" y no mostrar nada si es el caso
                    var salida = row.dHoraFin && row.dHoraFin !== '00:00:00' ?
                        '<br><i class="fas fa-door-closed"></i> Fin: ' + row.dHoraFin :
                        '<br><i class="fas fa-door-closed"></i> Fin: -';


                    // Devolver el resultado formateado
                    return '<div style="text-align: start;">' + entrada + salida + '</div>';
                }
            },
            {
                'data': 'dHoraEnt',
                'render': function (data, type, row) {
                    // Función auxiliar para ocultar "00:00:00"
                    function formatTime(time) {
                        return time === '00:00:00' ? '-' : time;
                    }

                    // Verificar si la entrada es "00:00:00" y mostrar "-"
                    var entrada = row.dHoraEnt && row.dHoraEnt !== '00:00:00' ?
                        '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i> Entrada: ' + row.dHoraEnt :
                        '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i> Entrada: -';

                    // Verificar si la salida es "00:00:00" y no mostrar nada si es el caso
                    var salida = row.dHoraSal && row.dHoraSal !== '00:00:00' ?
                        '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i> Salida: ' + row.dHoraSal :
                        '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i> Salida: -';


                    // Devolver el resultado formateado
                    return '<div style="text-align: start;">' + entrada + salida + '</div>';
                }
            }, 
            {
                'data': 'sIdSesion',
                'className': 'text-center', // Centrar el contenido en la celda
                'render': function (data, type, row) {

                    let curso = row.sDesCurso;
                    let seccion = row.sSeccion;
                    let aula = row.sAula;
                    let session = row.sIdSesion;
                    let tema = row.sTema;
                    let dFechaSesion = row.dFechaSesion;
                    
                    let m_entrada = row.dHoraEnt;
                    let m_salida = row.dHoraSal;
                    let conJustificacion = row.conJustificacion;

                    let s_modalidad = row.sBuildingCode;

                    var options="";

                    if (parametro.valor === "D") {

                        label = "Registrar Asistencia";

                    }
                    else if (s_modalidad != "Asin") {


                        options += "disabled"
                        label = "La marcación se realizará por Zoom"
                    }
                    else if (m_entrada != sinMarcar && m_salida != sinMarcar) {

                        options += "disabled"
                        label = "Ambas marcaciones realizadas"
                    }
                    else if (conJustificacion == 1) {


                        options += "disabled"
                        label = "Justificación cargada"
                    }
                    else {

                        label = "Registrar Asistencia";
                    }

                    let targetHeader = "asistenciaModalLabel";
                    return `<button class='btn btn-registrar-asistencia btn-sm' data-bs-toggle='modal' 
                    data-bs-target='#asistencia_modal' ${options}
                    onclick="fillModalAsistencia('${curso}', '${seccion}', '${aula}','${session}', '${targetHeader}','${tema}','${dFechaSesion}')">
                    <i class="fas fa-check-circle"></i> ${label}
                </button>`;
                }
            },
            {
                'data': 'sIdSesion',
                'className': 'text-center', // Centrar el contenido en la celda
                'render': function (data, type, row) {
                    let curso = row.sDesCurso;
                    let seccion = row.sSeccion;
                    let fecha = row.dFechaSesion;
                    let targetHeader = "justificacionModalLabel";
                    let session = row.sIdSesion;
                    let entrada = row.dHoraInicio;
                    let salida = row.dHoraFin;
                    let tema = row.sTema;
                    let fechaSesion = row.dFechaSesion;
                    
                    let m_entrada = row.dHoraEnt;
                    let m_salida = row.dHoraSal;
                    let conJustificacion = row.conJustificacion;
                    let options = "";

                    let label = "";

                    //if (m_entrada != sinMarcar && m_salida != sinMarcar) {
                    //    options += "disabled"
                    //    label ="Ambas marcaciones realizadas"
                //}
                    if (row.ClaseFinalizada === "N") {
                        options += "disabled"
                        label = "Clase no finalizada"
                    }
                    else if (conJustificacion == 1) {
                        options += "disabled"
                        label = "Justificación cargada"
                    }
                    else {
                        label = "Registrar Justificación";
                    }

                    //return `<button class='btn btn-registrar-justificacion btn-sm' data-bs-toggle='modal'
                    //        data-bs-target='#justificacion_modal' ${options}
                    //        onclick="fillJustificacion('${curso}', '${seccion}', '${fecha}', '${targetHeader}','${session}','${entrada}','${salida}','${tema}','${fechaSesion}')">
                    //        <i class="fas fa-exclamation-circle"></i> ${label}
                    //    </button>`;
                    return `<a class="btn btn-registrar-justificacion btn-sm ${options}" 
                        href="/WkSolicitud/JustificacionAsistenciaCreate?key=${window.btoa(session)}&ori=A">
                        <i class="bi bi-check2-circle""></i>${label}</a>`;
                }
            }
        ], createdRow: function (row, data, dataIndex) {
            if (_paramIdSesion && data.sIdSesion == _paramIdSesion) {
                $(row).addClass("bg-ultimasolicitud");
            }
        }
    });
}
function construirCards(data, contentContainer) {
    // Limpiar el contenedor antes de agregar nuevas tarjetas
    $(contentContainer).html('');
    if (data.length === 0) {
        // Mostrar un mensaje si no hay datos
        $(contentContainer).html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
        return; // Salir de la función si no hay datos
    }
    // Crear las tarjetas
    data.forEach(function (item) {
        var m_entrada = item.dHoraEnt;
        var m_salida = item.dHoraSal;
        var options = "";
        var options_just = "";
        var label_just = "";
        var label_asist = "";
        let conJustificacion = item.conJustificacion;

        if (m_entrada != sinMarcar && m_salida != sinMarcar) {
            options += "disabled"
            var prompt = "Ambas marcaciones realizadas"
            //label_just = prompt
            label_asist = prompt    
        }
        else if (conJustificacion == 1) {
            options += "disabled"
            var prompt = "Justificación cargada"
            //label_just = prompt
            label_asist = prompt  
        }
        else {
            label_asist = "Registrar Asistencia";
            //label_just = "Registrar Justificación";
        }

        if (item.ClaseFinalizada === "N") {
            options_just += "disabled"
            label_just = "Clase no finalizada"
        }
        else if (conJustificacion == 1) {
            options_just += " disabled"
            label_just = "Justificación cargada"
        }
        else {
            label_just = "Registrar Justificación";
        }

        // Verificar si la entrada es "00:00:00" y mostrar "-"
        var entrada = item.dHoraEnt && item.dHoraEnt !== '00:00:00' ?
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: ' + item.dHoraEnt :
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: -';

        // Verificar si la salida es "00:00:00" y mostrar "-"
        var salida = item.dHoraSal && item.dHoraSal !== '00:00:00' ?
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: ' + item.dHoraSal :
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: -';

        // Botón de "Registrar Asistencia"
        var asistenciaButton = `
            <button class='btn btn-registrar-asistencia btn-sm mb-2' ${options}
                    data-bs-toggle='modal' 
                    data-bs-target='#asistencia_modal' 
                    onclick="fillModalAsistencia('${item.sDesCurso}', '${item.sSeccion}', '${item.sAula}', '${item.sIdSesion}', 'asistenciaModalLabel', '${item.sTema}','${item.dFechaSesion}')">
                <i class="fas fa-check-circle"></i> ${label_asist}
            </button>
        `;

        // Botón de "Registrar Justificación"
        //var justificarButton = `
        //    <button class='btn btn-registrar-justificacion btn-sm mb-2' ${options}
        //            data-bs-toggle='modal' 
        //            data-bs-target='#justificacion_modal' 
        //            onclick="fillJustificacion('${item.sDesCurso}', '${item.sSeccion}', '${item.dFechaSesion}', 'justificacionModalLabel', '${item.sIdSesion}', '${item.dHoraInicio}', '${item.dHoraFin}', '${item.sTema}','${item.dFechaSesion}')">
        //        <i class="fas fa-exclamation-circle"></i> ${label_just}
        //    </button>
        //`;
        var justificarButton = `<a class="btn btn-registrar-justificacion btn-sm ${options_just}" 
                        href="/WkSolicitud/JustificacionAsistenciaCreate?key=${window.btoa(item.sIdSesion)}&ori=A">
                        <i class="bi bi-check2-circle""></i>${label_just}</a>`;
        //
        var empty = "";
        // Estructura de la tarjeta con ambos botones y detalles adicionales
        var card = `
            <div class="mobile-card ${(_paramIdSesion && item.sIdSesion == _paramIdSesion) ? "bg-ultimasolicitud":""  }">
                <h5> <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ${transformDateFormat(extractDate(item.dFechaSesion))} </h5>

                <!-- Contenedor de Marcación -->
                <div class="marcacion-container">
                    <strong>Marcación:</strong>
                    <span class="marcacion">${entrada}${salida}</span>
                </div>
                <p><strong>Curso:</strong> ${item.sDesCurso}</p>
                <!-- Botones de Registro -->
                <div class="btn-group d-flex justify-content-between">
                    ${asistenciaButton}
                    ${justificarButton}
                </div>

                <!-- Botón de Mostrar/Ocultar detalles -->
                <button class="btn btn-sm btn-secondary mt-2" onclick="toggleDetails(this)">Mostrar más</button>
                <div class="hidden-details" style="display: none;">
                    <p><strong>Aula:</strong> ${item.sAula}</p>
                    <p><strong>Tema:</strong> ${item.sTema1 ?? empty}</p>
                </div>
            </div>
        `;
        $(contentContainer).append(card);
    });
}

function fillModalAsistencia(curso, seccion, aula, session, target, tema, dFechaSesion) {
    $('#nIdSesion').val(session);
    $('#dFechaSesion').val(dFechaSesion);

    document.getElementById(target).innerText = curso + " - " + seccion + " - " + aula;

    if (tema === '') {
        $('#txtTema').prop("disabled", false)
        $('#txtTema').val('')
    }
    else {
        $('#txtTema').prop("disabled", true)
        $('#txtTema').val(tema)
    }
}
function fillJustificacion(curso, seccion, date, target,session,entrada,salida,tema,dFechaSesion) {
    document.getElementById(target).innerText = curso + " - " + seccion + " - " + formatDate(date);
    $('#nIdSesionJusti').val(session);
    $('#fechaSesion').val(dFechaSesion);

    $('#txtMarcacionEntrada').val(entrada);
    $('#txtMarcacionSalida').val(salida);

    if (tema === '') {
        $('#txtTemaJustificar').prop("disabled", false)
        $('#txtTemaJustificar').val('')
    }
    else {
        $('#txtTemaJustificar').prop("disabled", true)
        $('#txtTemaJustificar').val(tema)
    }
}
//utildades 
function hideModalMarcacion() {
    //cierro el modal
    $("#asistencia_modal").modal("hide")
    //limpio los inputs respectivos
    $('#nIdSesion').val('');
    $('#txtTema').val('');
}
function hideModalJustificacion() {
    $('#justificacion_modal').modal("hide");

    //limpio los inputs involucrados, asi como los ocultos
    $('#txtJustificacion').val('');
    $('#txtTemaJustificar').val('');
    $('#fileUpload').val('');

    $('#nIdSesionJusti').val('');

    //opcionales
    $('#txtMarcacionEntrada').val('');
    $('#txtMarcacionSalida').val('');

}
function getRowDataByIdSesion(sIdSesion) {
        // Obtener todas las filas del DataTable
        var allData = $('#lstAsistencia').DataTable().rows().data().toArray();

        // Filtrar las filas para encontrar la que tiene el sIdSesion especificado
        var filteredData = allData.filter(function (row) {
            return row.sIdSesion == sIdSesion;
        });

        // Convertir el resultado a JSON
        var jsonResult = JSON.stringify(filteredData);

        return jsonResult;
    
}
//para marcar asistencia

//ingreso
function marcarIngreso() {
    var targetButton = "#btnSendingreso";
    try {
        let tema = $('#txtTema').val();
        let sIdSesion = $('#nIdSesion').val()
        let dFechaSesion = $('#dFechaSesion').val();

        if (tema === "" || tema === undefined) {
            alerta_center("question", "Datos inválidos", "Por favor especifique un tema válido");
            //console.log("--> entrada");
            return;
        }
        else if (sIdSesion === "" || sIdSesion === undefined) {
            alerta_center("question", "Datos inválidos", "sIdSesion invalida");
            //console.log("--> entrada");
            return;
        }
        else {
            $.ajax({
                url: requestMarcacionIngreso + "?tema=" + tema + "&sIdSesion=" + sIdSesion + "&dFechaSesion=" + dFechaSesion,
                    type: "POST",
                    beforeSend: function () {
                        showModalLoader();
                        $(targetButton).attr("disabled", "true");

                    },
                    success: function (response) {
                        let status = response.success;

                        if (status) {
                            alerta_center(response.swal, "Exito", response.mensaje);
                            //limpio el modal y refresco la tabla
                            hideModalMarcacion();
                            consultarSesiones();
                        }
                        else {
                            info_alert(response.swal, "Advertencia", response.mensaje)
                        }
                    },
                    error: function (error) {
                        console.error("Ocurrió un error al realizar la solicitud --> " + error.responseText);
                        alerta_center("error", "Error", "Ocurrió un error inesperado")
                        hideModalMarcacion();
                    },
                     complete: function () {
                        hideModalLoader();
                    }
                })
        }
    }
    catch (error) {
        hideModalMarcacion();
        console.error("Ocurrió un error al realizar la solicitud --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al marcar el ingreso.")
    }

    $(targetButton).removeAttr("disabled")
}

//salida
function marcarSalida() {
    var targetButton = "#btnSendSalida";
    try {
        let sIdSesion = $('#nIdSesion').val()
        let dFechaSesion = $('#dFechaSesion').val();

        if (sIdSesion === "" || sIdSesion === undefined) {
            alerta_center("question", "Datos inválidos", "sIdSesion invalida")
            //console.log("--> salida");
            return;
        }
        else {
            $.ajax({
                url: requestMarcacionSalida + "?sIdSesion=" + sIdSesion + "&dFechaSesion=" + dFechaSesion,
                type: "POST",
                beforeSend: function () {
                    showModalLoader();
                    $(targetButton).attr("disabled", "true");
                },
                success: function (response) {
                    let status = response.success;

                    if (status) {
                        alerta_center(response.swal, "Exito", response.mensaje);
                        //limpio el modal y refresco la tabla
                        hideModalMarcacion();
                        consultarSesiones();
                    }
                    else {
                        info_alert(response.swal, "Advertencia", response.mensaje)
                    }
                },
                error: function (error) {
                    console.error("Ocurrió un error al realizar la solicitud --> " + error.responseText);
                    alerta_center("error", "Error", "Ocurrió un error inesperado")
                    hideModalMarcacion();
                },
                complete: function () {
                    hideModalLoader();
                }

            })
        }

    }
    catch (error) {
        hideModalMarcacion();
        console.error("Ocurrió un error al realizar la solicitud --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al marcar la salida.")
    }
    $(targetButton).removeAttr("disabled")  
}

//para justificaciones
function justificacion_asistencia() {
    try {
        var sIdSesion = $('#nIdSesionJusti').val();
        var fechaSesion = $('#fechaSesion').val();

        if (sIdSesion === "" || sIdSesion === undefined) {
            alerta_center("question", "Datos inválidos", "sIdSesion inválida.");
            //console.log("--> justificacion");
            return;
        }
        else {
            var dtJson = getRowDataByIdSesion(sIdSesion);
            var justificacion = $('#txtJustificacion').val();
            var tema = $('#txtTemaJustificar').val();
            var uploadFile = $('#fileUpload')[0].files[0];

            if (tema.trim() === '' || tema === undefined) {
                alerta_center("warning", "Datos insuficientes", "El tema a dictar es requerido");
                return;
            }
            else if (justificacion.trim() === '' || justificacion === undefined) {
                alerta_center("warning", "Datos insuficientes", "Por favor ingrese el motivo de la falta")
                return;
            }
            else if (uploadFile === undefined) {
                alerta_center("warning", "Datos insuficientes", "Por favor adjunte un documento para la justificación.");
                return;
            }

            else {
                var formData = new FormData();
                formData.append("fileInput", uploadFile);
                formData.append("justificacion", justificacion);
                formData.append("dtJson", dtJson);
                formData.append("sIdSesion", sIdSesion);
                formData.append("fechaSesion", fechaSesion);
                formData.append("temaJusti", tema);

                $.ajax({
                    url: requestJustificacion,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    beforeSend: function () {
                        showModalLoader();
                        $('#btnSend_j').attr("disabled", "true");
                    },
                    success: function (response) {

                        let status = response.success;
                        if (status) {
                            alerta_center(response.swal, "Éxito", response.mensaje);
                            //finally
                            hideModalJustificacion();
                            consultarSesiones();
                        }
                        else {
                            alerta_center(response.swal, "Advertencia", response.mensaje);

                        }
                    },
                    error: function (error) {
                        alerta_center("error", "Error", "Ocurrió un error inesperado: " + error.responseText);
                        console.error(error.responseText);
                        hideModalJustificacion();
                    },
                    complete: function () {
                        hideModalLoader();
                       
                    }
                })
            }

        }

    }
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar la justificación: "+ error.message);
    }

    $('#btnSend_j').removeAttr("disabled")
}


