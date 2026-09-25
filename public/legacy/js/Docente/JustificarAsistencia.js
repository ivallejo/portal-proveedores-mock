const emptyHour = '00:00:00';
let _paramIdSesion = null;
function listarSesionesJustify() {
    //alerta_center('error','error','error')
    try {
        $.ajax({
            url: requestList,
            type: 'POST',
            beforeSend: function () {
                showModalLoader();
            }, 
            success: function (response) {
                let status = response.success;
                if (status) {
                    
                    var requestJson = JSON.parse(response.data);
                    requestJson.sort((a, b) => {
                        return parseInt(a.sIdSesion) - parseInt(b.sIdSesion);
                    });

                    //console.log(response.data)
                    //console.log(requestJson);
                    construirTableSesiones(requestJson)

                    //SECCION PARA CONSTRUIR CARDS MOBILE
                    var currentPage = 1;
                    var totalPages = Math.ceil(requestJson.length / 10);
                    var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                    // Mostrar la primera página
                    displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-justificarAsitencia');

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
                        displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-justificarAsitencia');
                    });

                    ok_alert("info", "¡Información importante!", response.mensajeTolerancia)

                }

                    
                else {
                    alerta_center(response.swal,"Advertencia",response.mensaje)
                }
            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error inesperado");
            },
            complete: function () {
                hideModalLoader();
            }
        })
    }
    catch (error) {
        console.error("Error en búsqueda --> " + error.message);

        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar las sesiones justificables.");
    }
}

function construirTableSesiones(response) {
    //console.log(response)
    let target = '#lstJustificables';
    // Destruir cualquier instancia previa de DataTable en el elemento objetivo
    $(target).DataTable().clear().destroy();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams && urlParams.get('s')) {
        _paramIdSesion = window.atob(urlParams.get('s'));
    }

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
        //"order": [[5, "asc"]],
        "order": [[5, "asc"]],
        data: response,
        columnDefs: [
            {
                targets: 0,    // Índice de la columna que quieres ocultar (0 = primera columna)
                visible: false // Ocultar la columna
            }
        ],
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
                    var sIdSeccion = '<br>Seccion: <strong style="background: #abd3f7; padding: 3px; border-radius: 5px;">' + row.sSeccion + '</strong>';
                    return codCurso + '<strong>' + data + '</strong>' + sIdSeccion + tema
                        //+ ` ${row.sIdSesion}`;
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
                        '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: ' + row.dHoraEnt :
                        '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: -';

                    // Verificar si la salida es "00:00:00" y mostrar "-"
                    var salida = row.dHoraSal && row.dHoraSal !== '00:00:00' ?
                        '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: ' + row.dHoraSal :
                        '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: -';


                    // Devolver el resultado formateado
                    return '<div style="text-align: start;">' + entrada + salida + '</div>';
                }
            },
            {
                'data': 'Minutos tardanza',
                'render': function (data, type, row) {
                    // Verifica si el valor es mayor a 0
                    if (data > 0) {
                        // Aplica el estilo y centra el contenido si el valor es mayor a 0
                        return '<div style="width:100%;display:flex;justify-content:center;"><span style="background-color: rgb(255 0 0 / 56%); padding: 0 7px; border-radius: 5px; margin: auto 8px; text-align: center;color: white;">' + data + ' min</span></div>';
                    } else {
                        // Muestra solo '-' centrado en la celda
                        return '<div style="width:100%;display:flex;justify-content:center;"><span>-</span></div>';
                    }
                }
            },            
            {
                'data': 'sIdSesion',
                'className': 'text-center',
                'render': function (data, type, row) {
                    let curso = row.sDesCurso;
                    let seccion = row.sSeccion;
                    let fecha = row.dFechaSesion;
                    let targetHeader = "justificacionModalLabel";
                    let session = row.sIdSesion;
                    let entrada = row.dHoraInicio;
                    let salida = row.dHoraFin;
                    let tema = row.sTema;
                    let fsesion = row.dFechaSesion;
                    var m_entrada = row.dHoraEnt;
                    var m_salida = row.dHoraSal;
                    var options = "";
                    var label = "";
                    let conJustificacion = row.conJustificacion;
                    
                    //Metrica: valida justificar tardanzas y despues de clase

                    //if (m_entrada != emptyHour && m_salida != emptyHour) {
                    //    options += "disabled"
                    //    label="Ambas marcaciones realizadas."
                    //}
                    if (row.ClaseFinalizada === "N") {
                        options += "disabled"
                        label = "Clase no finalizada."
                    }
                    else if (conJustificacion == 1) {
                        options += "disabled"
                        label = "Justificación ya cargada."
                    }
                    else {
                        label ="Registrar Justificación"
                    }

                    //console.log(m_entrada, m_salida)


                    //return `<button class='btn btn-registrar-justificacion btn-sm' data-bs-toggle='modal' data-bs-target='#justificacion_modal'
                    //onclick="fillJustificacion('${curso}', '${seccion}', '${fecha}', '${targetHeader}','${session}',
                    //'${entrada}','${salida}','${tema}','${fsesion}')" ${options}>
                    //<i class="bi bi-check2-circle"></i>${label}</button>`;

                    //const wkParam = window.btoa(JSON.stringify({
                    //    curso: curso,
                    //    seccion: seccion,
                    //    fecha: fecha,
                    //    targetHeader: targetHeader,
                    //    session: session,
                    //    entrada: entrada,
                    //    salida: salida,
                    //    tema: tema,
                    //    fsesion: fsesion,
                    //    options: options,
                    //}));
                    return `<a class="btn btn-registrar-justificacion btn-sm ${options}" 
                        href="/WkSolicitud/JustificacionAsistenciaCreate?key=${window.btoa(session)}&ori=J">
                        <i class="bi bi-check2-circle""></i>${label}</a>`;
                }
            }
        ]
        , createdRow: function (row, data, dataIndex) {
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

        // Verificar si la entrada es "00:00:00" y mostrar "-"
        var entrada = item.dHoraEnt && item.dHoraEnt !== '00:00:00' ?
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: ' + item.dHoraEnt :
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: -';

        // Verificar si la salida es "00:00:00" y mostrar "-"
        var salida = item.dHoraSal && item.dHoraSal !== '00:00:00' ?
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: ' + item.dHoraSal :
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: -';

        var tardanza = '<div class="tardanza-sin"><span>Sin tardanza</span></div>';
        if (item["Minutos tardanza"] > 0) {
            tardanza = '<span class="tardanza-min">' + item["Minutos tardanza"] + ' min</span>';
        }

        var m_entrada = item.dHoraEnt;
        var m_salida = item.dHoraSal;
        let conJustificacion = item.conJustificacion;
        var options = "";
        var label = "";
        //if (m_entrada != emptyHour && m_salida != emptyHour) {
        //    options += " disabled"
        //    label ="Ambas marcaciones realizadas"
        //}
        if (item.ClaseFinalizada === "N") {
            options += "disabled"
            label = "Clase no finalizada."
        }
        else if (conJustificacion == 1) {
            options += " disabled"
            label = "Justificación ya cargada."
        }
        else {
            label = "Registrar Justificación";
        }

        // Crear el botón de "Registrar Justificación"
        //var justificarButton = `
        //    <button ${options} class='btn btn-registrar-justificacion btn-sm mb-2'
        //            data-bs-toggle='modal' 
        //            data-bs-target='#justificacion_modal' 
        //            onclick="fillJustificacion('${item.sDesCurso}', 
        //            '${item.sSeccion}', '${item.dFechaSesion}', 'justificacionModalLabel', '${item.sIdSesion}', 
        //            '${item.dHoraInicio}', '${item.dHoraFin}', '${item.sTema}','${item.dFechaSesion}')">
        //        <i class="bi bi-check2-circle"></i> ${label}
        //    </button>
        //`;
        var justificarButton = `<a class="btn btn-registrar-justificacion btn-sm ${options}" 
                        href="/WkSolicitud/JustificacionAsistenciaCreate?key=${window.btoa(item.sIdSesion)}&ori=J">
                        <i class="bi bi-check2-circle""></i>${label}</a>`;

        var empty = "";
        // Estructura de la tarjeta con el botón de mostrar/ocultar
        var card = `
					<div class="mobile-card ${(_paramIdSesion && item.sIdSesion == _paramIdSesion) ? "bg-ultimasolicitud":""}">
						<h5> <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ${transformDateFormat(extractDate(item.dFechaSesion))} </h5>
                
						<!-- Contenedor de Marcación -->
						<div class="marcacion-container">
							<strong>Marcación:</strong>
							<span class="marcacion"><br>`+ entrada + salida + `</span>
						</div>
                
						<!-- Contenedor de Tardanza -->
						<div class="tardanza-container">
							<strong>Tardanza:</strong>
							<span class="tardanza">${tardanza}</span>
						</div>

                        ${justificarButton}
                
						<button class="btn btn-sm btn-secondary" onclick="toggleDetails(this)">Mostrar más</button>
						<div class="hidden-details" style="display: none;">
							<p><strong>Curso:</strong> ${item.sDesCurso}</p>
							<p><strong>Aula:</strong> ${item.sAula}</p>
                            <p><strong>Tema:</strong> ${item.sTema1 ?? empty}</p>
						</div>
					</div>
				`;
        $(contentContainer).append(card);
    });
}
function fillJustificacion(curso, seccion, date,
    target, session, entrada, salida, tema,fechasesion) {

    console.log(curso);
    console.log(seccion);
    console.log(date);
    console.log(target);
    console.log(session);
    console.log(entrada);
    console.log(salida);
    console.log(tema);
    console.log(fechasesion);

    document.getElementById(target).innerText = curso + " - " + seccion + " - " + formatDate(date);
    $('#nIdSesionJusti').val(session);
    $('#sIdFechaSesion_').val(fechasesion);

    $('#txtMarcacionEntrada').val(entrada);
    $('#txtMarcacionSalida').val(salida);

    if (tema === '' || tema === 'null') {
        $('#txtTemaJustificar').prop("disabled", false)
        $('#txtTemaJustificar').val('')
    }
    else {
        $('#txtTemaJustificar').prop("disabled", true)
        $('#txtTemaJustificar').val(tema)
    }
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
    var allData = $('#lstJustificables').DataTable().rows().data().toArray();

    // Filtrar las filas para encontrar la que tiene el sIdSesion especificado
    var filteredData = allData.filter(function (row) {
        return row.sIdSesion == sIdSesion;
    });

    // Convertir el resultado a JSON
    var jsonResult = JSON.stringify(filteredData);

    return jsonResult;

}

//para justificaciones
function justificacion_asistencia() {
    try {
        var sIdSesion = $('#nIdSesionJusti').val();
        var sIdFechaSesion_ = $('#sIdFechaSesion_').val();

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

            //validaciones de datos para enviar en el ajax
            //if (false){}
            //comentar para realizar pruebas
            if (tema.trim() === '' || tema === undefined) {
                alerta_center("warning", "Datos insuficientes", "El tema a dictar es requerido");
                return;
            }
            else if (justificacion.trim() === '' || justificacion === undefined) {
                alerta_center("warning", "Datos insuficientes", "Por favor ingrese el motivo de la falta.")
                return;
            }
            //file Opcional
            else if (uploadFile === undefined) {
                alerta_center("warning", "Datos insuficientes", "Por favor adjunte un documento para la justificación.");
                return;
            }
            else {
                var formDataJ = new FormData();
                formDataJ.append("fileInput", uploadFile);
                formDataJ.append("justificacion", justificacion);
                formDataJ.append("dtJson", dtJson);
                formDataJ.append("sIdSesion", sIdSesion);
                //formDataJ.append("sIdFechaSesion_", sIdFechaSesion_);
                formDataJ.append("fechaSesion", sIdFechaSesion_);
                formDataJ.append("temaJusti", tema);

                $.ajax({
                    url: requestJustificacion,
                    type: 'POST',
                    data: formDataJ,
                    processData: false,
                    contentType: false,
                    beforeSend: function () {
                        showModalLoader();
                        $('#btnSend_j').attr("disabled", "true")
                    },
                    success: function (response) {

                        let status = response.success;
                        if (status) {


                            alerta_center(response.swal, "Éxito", response.mensaje);
                            //finally
                            hideModalJustificacion();
                            listarSesionesJustify();
                        }
                        else {
                            alerta_center(response.swal, "Advertencia", response.mensaje);

                        }
                    },
                    error: function (error) {
                        alerta_center("error", "Error", "Ocurrió un error inesperado");
                        console.error(error.responseText);
                        hideModalJustificacion();
                    }, complete: function () {
                        hideModalLoader();
                    }
                })
            }

        }

    }
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar la justificación.");
    }

    $('#btnSend_j').removeAttr("disabled");
}


