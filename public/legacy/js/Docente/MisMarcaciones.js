function construirTablaMarcaciones(response) {
    let target = "#lstMarcaciones";
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
        "language": {
            url: "/DataTable/es_es.json",
            searchPlaceholder: "Buscar"
            //url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json"
        },
        "initComplete": function (settings, json) {
            // Cambiar el texto de "Buscar:" en el label
            $('.dataTables_filter label').contents().filter(function () {
                return this.nodeType === 3;  // Filtra los nodos de texto
            }).first().replaceWith('');  // Reemplaza con el nuevo texto
        },
        "order": [[0, "asc"]],
        data: response,
        columns: [
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
            /*{ 'data': 'Apellidos y Nombres del docente' },*/
            //{ 'data': 'sDesCurso' },
            //{ 'data': 'sTema' },
            {
                'data': 'sDesCurso',
                'render': function (data, type, row) {
                    // Verificar si sTema tiene un valor significativo
                    var tema = '';
                    if (row.sTema && row.sTema.trim() !== '') { // Asegúrate de que no es nulo ni una cadena vacía
                        tema = '<br>Tema: ' + row.sTema;
                    }
                    return '<strong>' + data + '</strong>' + tema;
                }
            },
            {
                'data': 'sAula',
                'render': function (data, type, row) {
                    return '<div style="margin: auto 8px; text-align: center;">' + data + '</div>';
                }
            },
            //{ 'data': 'dHoraInicio' },
            //{ 'data': 'dHoraFin' },
            //{ 'data': 'dHoraEnt' },
            //{ 'data': 'dHoraSal' },
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
            }
        ]
    })
}

function construirCards(data, contentContainer) {
    // Limpiar el contenedor antes de agregar nuevas tarjetas
    $(contentContainer).html('');

    // Verificar si hay datos
    if (data.length === 0) {
        // Mostrar un mensaje si no hay datos
        $(contentContainer).html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
        return; // Salir de la función si no hay datos
    }

    // Crear las tarjetas
    data.forEach(function (item) {
        //console.log('item', item);
        // Verificar si la entrada es "00:00:00" y mostrar "-"
        var entrada = item["dHoraEnt"] && item["dHoraEnt"] !== '00:00:00' ?
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: ' + item["dHoraEnt"] :
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: -';

        // Verificar si la salida es "00:00:00" y mostrar "-"
        var salida = item["dHoraSal"] && item["dHoraSal"] !== '00:00:00' ?
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: ' + item["dHoraSal"] :
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: -';

        // Mostrar tardanza si es mayor a 0 minutos
        var tardanza = '<div class="tardanza-sin"><span>Sin tardanza</span></div>';
        if (item["Minutos tardanza"] > 0) {
            tardanza = '<span class="tardanza-min">' + item["Minutos tardanza"] + ' min</span>';
        }

        // Estructura de la tarjeta con ambos botones y detalles adicionales
        var card = `
            <div class="mobile-card">
                <h5> <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ${transformDateFormat(extractDate(item.dFechaSesion))} </h5>

                <!-- Contenedor de Marcación -->
                <div class="marcacion-container">
                    <strong>Marcación:</strong>
                    <span class="marcacion">${entrada}${salida}</span>
                </div>

                <!-- Contenedor de Tardanza -->
                <div class="tardanza-container">
                    <strong>Tardanza:</strong>
                    <span class="tardanza">${tardanza}</span>
                </div>
                <p><strong>Curso:</strong> ${item.sDesCurso}</p>
                <!-- Botón de Mostrar/Ocultar detalles -->
                <button class="btn btn-sm btn-secondary mt-2" onclick="toggleDetails(this)">Mostrar más</button>
                <div class="hidden-details" style="display: none;">
                    
                    <p><strong>Aula:</strong> ${item.sAula}</p>
                </div>
            </div>
        `;
        $(contentContainer).append(card);
    });
}
function searchChecks() {

    try {
        //defino valores 
        let startDate = $('#StartDate').val();
        let endDate = $('#EndDate').val();
        var section = $('#cboSecciones').val()
        var course = $('#cboCursos').val()

        //if (startDate === '' || startDate === undefined) {
        //    alerta_center("error", "Datos insuficientes", "Por favor ingrese una fecha de inicio.")
        //}
        //else if (endDate === '' || endDate === undefined) {
        //    alerta_center("error", "Datos insuficientes", "Por favor ingrese una fecha de fin.")
        //}
        if (false) {
            //console.log("xd")
        }
        //seccion y curso no requieren de una validación
        else {

            //casteo los valores para una consulta limpia en el backend
            if (startDate != "") {
                startDate = transformDateFormat(startDate);

            }
            if (endDate != "") {
                endDate = transformDateFormat(endDate);
            }

            var formData = new FormData();
            formData.append("startDate", startDate)
            formData.append("endDate", endDate)
            formData.append("section", section)
            formData.append("course", course)

                $.ajax({
                    url: requestListado,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    beforeSend: function () {
                        showModalLoader();
                    },
                    success: function (response) {
                        let status = response.success;
                        if (status) {
                            $("#cardMarcaciones").removeClass('d-none');

                            var requestJson = JSON.parse(response.data);
                            //console.log(requestJson);
                            construirTablaMarcaciones(requestJson);

                            var currentPage = 1;
                            var totalPages = Math.ceil(requestJson.length / 10);
                            var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                            // Mostrar la primera página
                            displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-marcaciones');


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

                                displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-marcaciones');
                            });




                            sessionStorage.setItem('responseJson', response.data)
                            //sessionStorage.getItem('responseJson')
                        }
                        else {
                            alerta_center(response.swal, "Advertencia", response.mensaje);

                            $('#lstMarcaciones').DataTable().clear().destroy();
                            sessionStorage.setItem('responseJson', '')
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
    }
    catch (error) {
        console.error("Error en búsqueda --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar las marcaciones.");

    }
}

function generateReport() {
    try {
        var jsonReport = sessionStorage.getItem('responseJson');
        if (jsonReport === null || jsonReport === 'undefined' || jsonReport === ''
            || $('#lstMarcaciones').DataTable().rows().count() === 0 ) {
            alerta_center("question", "Falta Datos", "No se encontró datos para reportar, por favor primero realice una búsqueda con elementos.")
            return;
        }
        else {
            var formData = new FormData();
            formData.append("jsonReport", jsonReport)

            $.ajax({
                url: reporteMarcaciones,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {
                    if (response.success === true) {
                        //console.log(response)
                        var pruebasSlug = response.pathAuxiliar; //'/por si se encuentra en un entorno de pruebas';
                        let urlResponse = window.location.origin + pruebasSlug + "/" + response.rutaArchivo;
                        window.location.href = urlResponse;
                    }
                    else {
                        alerta_center(response.swal, "Advertencia", response.mensaje);
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
    }
    catch (error) {
        console.error("Error en generacion de reporte --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar las marcaciones.");
    }
}
