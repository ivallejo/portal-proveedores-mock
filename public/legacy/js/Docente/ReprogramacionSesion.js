const emptyHour = '00:00:00';
let _paramIdSesion = null;

function listarSesionesReprogramables() {
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
                    var requestJson = response.lista

                    requestJson.sort((a, b) => {
                        return parseInt(a.sidsesion) - parseInt(b.sidsesion);
                    });

                    construirTableSesiones(requestJson)

                    //SECCION PARA CONSTRUIR CARDS MOBILE
                    var currentPage = 1;
                    var totalPages = Math.ceil(requestJson.length / 10);
                    var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                    // Mostrar la primera página
                    displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-reprogramacion');

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
                        displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-reprogramacion');
                    });

                }

                    
                else {
                    alerta_center(response.swal,"Advertencia",response.mensaje)
                }
            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error inesperado");
                console.error(error.responseText);
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
    let target = '#lstReprogramacion';
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
            { 'data':'sidsesion'},
            {
                'data': 'dfechasesion',
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
                'data': 'sdescurso',
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
                    var sIdSeccion = '<br>Seccion: <strong style="background: #abd3f7; padding: 3px; border-radius: 5px;">' + row.sseccion + '</strong>';
                    return codCurso + '<strong>' + data + '</strong>' + sIdSeccion
                        //+ ` ${row.sIdSesion}`;
                }
            },
            {
                'data': 'saula',
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
                'data': 'sidsesion',
                'className': 'text-center',
                'render': function (data, type, row) {

                    let session = row.sidsesion;
                    let estado = row.estadoSolicitud;

                    var label = "";
                    var options = "";

                    if (estado === Constantes.EstadoSolicitud.Solicitado) {
                        label = "Reprogramación solicitada";
                        options = "disabled"
                    }
                    else if (estado === Constantes.EstadoSolicitud.EnEvaluacion) {
                        label = "Reprogramación en evaluación";
                        options = "disabled"
                    }
                    else if (estado === Constantes.EstadoSolicitud.Aprobado) {
                        label = "Reprogramación aprobada";
                        options = "disabled"
                    }
                    else {
                        label = "Registrar reprogramación";
                    }

                    return `<a class="btn btn-registrar-reprogramacion btn-sm ${options}" 
                        href="/WkSolicitud/ReprogramacionClasesCreate?key=${window.btoa(session)}">
                        <i class="bi bi-check2-circle""></i>${label}</a>`;
                }
            }
        ]
        , createdRow: function (row, data, dataIndex) {
            if (_paramIdSesion && data.sidsesion == _paramIdSesion) {
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

        //// Verificar si la entrada es "00:00:00" y mostrar "-"
        //var entrada = item.dHoraEnt && item.dHoraEnt !== '00:00:00' ?
        //    '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: ' + item.dHoraEnt :
        //    '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: -';

        //// Verificar si la salida es "00:00:00" y mostrar "-"
        //var salida = item.dHoraSal && item.dHoraSal !== '00:00:00' ?
        //    '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: ' + item.dHoraSal :
        //    '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: -';

        //var tardanza = '<div class="tardanza-sin"><span>Sin tardanza</span></div>';
        //if (item["Minutos tardanza"] > 0) {
        //    tardanza = '<span class="tardanza-min">' + item["Minutos tardanza"] + ' min</span>';
        //}

        //var m_entrada = item.dHoraEnt;
        //var m_salida = item.dHoraSal;
        let conJustificacion = item.conJustificacion;
        var options = "";
        var label = "";


        if (item.estadoSolicitud === Constantes.EstadoSolicitud.Solicitado) {
            label = "Reprogramación solicitada";
            options = "disabled"
        }
        else if (item.estadoSolicitud === Constantes.EstadoSolicitud.EnEvaluacion) {
            label = "Reprogramación en evaluación";
            options = "disabled"
        }
        else if (item.estadoSolicitud === Constantes.EstadoSolicitud.Aprobado) {
            label = "Reprogramación aprobada";
            options = "disabled"
        }
        else {
            label = "Registrar reprogramación";
        }

        // Crear el botón de "Registrar Justificación"
        var reprogramacionButton = `<a class="btn btn-registrar-reprogramacion btn-sm ${options}" 
                        href="/WkSolicitud/ReprogramacionClasesCreate?key=${window.btoa(item.sidsesion)}">
                        <i class="bi bi-check2-circle""></i>${label}</a>`;

        var empty = "";
        // Estructura de la tarjeta con el botón de mostrar/ocultar
        var card = `
					<div class="mobile-card ${(_paramIdSesion && item.sidsesion == _paramIdSesion) ? "bg-ultimasolicitud":""}">
						<h5> <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ${transformDateFormat(extractDate(item.dfechasesion))} </h5>
                
						<!-- Contenedor de sesiones -->
						<div>
							<strong>Curso:${item.sdescurso}</strong>
						</div>
                        <div>
							<strong>Hora Inicio:${item.dHoraInicio}</strong>
							
						</div>
						<div>
							<strong>Hora Fub:${item.dHoraFin}</strong>
						</div>

                        ${reprogramacionButton}

					</div>
				`;
        $(contentContainer).append(card);
    });
}
//function fillJustificacion(curso, seccion, date,
//    target, session, entrada, salida, tema,fechasesion) {

//    document.getElementById(target).innerText = curso + " - " + seccion + " - " + formatDate(date);
//    $('#nIdSesionJusti').val(session);
//    $('#sIdFechaSesion_').val(fechasesion);

//    $('#txtMarcacionEntrada').val(entrada);
//    $('#txtMarcacionSalida').val(salida);

//    if (tema === '' || tema === 'null') {
//        $('#txtTemaJustificar').prop("disabled", false)
//        $('#txtTemaJustificar').val('')
//    }
//    else {
//        $('#txtTemaJustificar').prop("disabled", true)
//        $('#txtTemaJustificar').val(tema)
//    }
//}
//function hideModalJustificacion() {
//    $('#justificacion_modal').modal("hide");

//    //limpio los inputs involucrados, asi como los ocultos
//    $('#txtJustificacion').val('');
//    $('#txtTemaJustificar').val('');
//    $('#fileUpload').val('');

//    $('#nIdSesionJusti').val('');

//    //opcionales
//    $('#txtMarcacionEntrada').val('');
//    $('#txtMarcacionSalida').val('');

//}
//function getRowDataByIdSesion(sIdSesion) {
//    // Obtener todas las filas del DataTable
//    var allData = $('#lstJustificables').DataTable().rows().data().toArray();

//    // Filtrar las filas para encontrar la que tiene el sIdSesion especificado
//    var filteredData = allData.filter(function (row) {
//        return row.sIdSesion == sIdSesion;
//    });

//    // Convertir el resultado a JSON
//    var jsonResult = JSON.stringify(filteredData);

//    return jsonResult;

//}

//para justificaciones
//function justificacion_asistencia() {
//    try {
//        var sIdSesion = $('#nIdSesionJusti').val();
//        var sIdFechaSesion_ = $('#sIdFechaSesion_').val();

//        if (sIdSesion === "" || sIdSesion === undefined) {
//            alerta_center("question", "Datos inválidos", "sIdSesion inválida.");
//            //console.log("--> justificacion");
//            return;

//        }
//        else {
//            var dtJson = getRowDataByIdSesion(sIdSesion);

//            var justificacion = $('#txtJustificacion').val();
//            var tema = $('#txtTemaJustificar').val();
//            var uploadFile = $('#fileUpload')[0].files[0];

//            //validaciones de datos para enviar en el ajax
//            //if (false){}
//            //comentar para realizar pruebas
//            if (tema.trim() === '' || tema === undefined) {
//                alerta_center("warning", "Datos insuficientes", "El tema a dictar es requerido");
//                return;
//            }
//            else if (justificacion.trim() === '' || justificacion === undefined) {
//                alerta_center("warning", "Datos insuficientes", "Por favor ingrese el motivo de la falta.")
//                return;
//            }
//            //file Opcional
//            else if (uploadFile === undefined) {
//                alerta_center("warning", "Datos insuficientes", "Por favor adjunte un documento para la justificación.");
//                return;
//            }
//            else {
//                var formDataJ = new FormData();
//                formDataJ.append("fileInput", uploadFile);
//                formDataJ.append("justificacion", justificacion);
//                formDataJ.append("dtJson", dtJson);
//                formDataJ.append("sIdSesion", sIdSesion);
//                //formDataJ.append("sIdFechaSesion_", sIdFechaSesion_);
//                formDataJ.append("fechaSesion", sIdFechaSesion_);
//                formDataJ.append("temaJusti", tema);

//                $.ajax({
//                    url: requestJustificacion,
//                    type: 'POST',
//                    data: formDataJ,
//                    processData: false,
//                    contentType: false,
//                    beforeSend: function () {
//                        showModalLoader();
//                        $('#btnSend_j').attr("disabled", "true")
//                    },
//                    success: function (response) {

//                        let status = response.success;
//                        if (status) {


//                            alerta_center(response.swal, "Éxito", response.mensaje);
//                            //finally
//                            hideModalJustificacion();
//                            listarSesionesJustify();
//                        }
//                        else {
//                            alerta_center(response.swal, "Advertencia", response.mensaje);

//                        }
//                    },
//                    error: function (error) {
//                        alerta_center("error", "Error", "Ocurrió un error inesperado");
//                        console.error(error.responseText);
//                        hideModalJustificacion();
//                    }, complete: function () {
//                        hideModalLoader();
//                    }
//                })
//            }

//        }

//    }
//    catch (error) {
//        console.error("Error al cargar justificacion --> " + error.message);
//        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar la justificación.");
//    }

//    $('#btnSend_j').removeAttr("disabled");
//}


