function searchJustificaciones() {
    try {
        var checkDate = $('#checkDate').val();
        var section = $('#cboSecciones').val();
        var course = $('#cboCursos').val();

        if (checkDate === '' /*|| section === '-1' || course === '-1'*/) {
            alerta_center("warning", "Advertencia", "Por favor seleccione una fecha válida.")
            return;
        }
        else {

            var formDatx = new FormData();
            //formDatx.append("date_check", formatDate(checkDate))
            formDatx.append("date_check", checkDate)
            formDatx.append("section", section)
            formDatx.append("course", course)

            $.ajax({
                url: requestJustificaciones,
                type: 'POST',
                data: formDatx,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {
                    let status = response.success;

                    if (status) {
                        alerta_center(response.swal,"",response.mensaje)
                        //console.log(response.jsonResult);

                        var data = JSON.parse(response.jsonResult);

                        

                        var requestJson = JSON.parse(response.jsonResult);
                        drawTable(requestJson);
                        //SECCION PARA CONSTRUIR CARDS MOBILE
                        var currentPage = 1;
                        var totalPages = Math.ceil(requestJson.length / 10);
                        var maxVisibleButtons = 5; // Número máximo de botones visibles a la vez

                        // Mostrar la primera página
                        displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-justificaciones');

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
                            displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-justificaciones');
                        });
                    }
                    else {
                        alerta_center(response.swal,"Advertencia", response.mensaje);
                    }
                },
                error: function (error) {
                    console.error("Error en la peticion  --> " + error.message);
                    alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar la justificación.");
                }, complete: function () {
                    hideModalLoader();
                }
                
            })
        }
    }
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar la justificación.");
    }
}

function drawTable(response){
    var target = "#lstJustificaciones";
    // Destruir cualquier instancia previa de DataTable en el elemento objetivo
    $(target).DataTable().clear().destroy();

    $(target).DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[25, 50, 100, 150, -1], [25, 50, 100, 150, "All"]],
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
        "order": [[1, "asc"]],
        data: response,
        columns: [
            {
                'data': 'dFechaRegistro',
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

            { 'data': 'sEstado' },
            {
                'data': 'sDesCurso',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        // Limitar el ancho y hacer que el texto se ajuste
                        return `<div style="max-width: 200px; word-wrap: break-word; white-space: normal;">${data}</div>`;
                    }
                    return data; // En otros modos, mantener el valor original
                }
            },
            {
                'data': 'sMotivo',
                'render': function (data, type, row) {
                    if (type === 'display') {
                        // Limitar el ancho y altura, y añadir un scrollbar vertical
                        return `<div style="max-width: 200px; max-height: 80px; word-wrap: break-word; white-space: normal; overflow-y: auto;">${data}</div>`;
                    }
                    return data; // En otros modos, mantener el valor original
                }
            },

            { 'data': 'sAula' },
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
            

        ]
    })
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
        //console.log(item);
        // Verificar si la entrada es "00:00:00" y mostrar "-"
        var entrada = item.dHoraEnt && item.dHoraEnt !== '00:00:00' ?
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: ' + item.dHoraEnt :
            '<i class="fas fa-sign-in-alt" style="color: #107f10;"></i>Entrada: -';

        // Verificar si la salida es "00:00:00" y mostrar "-"
        var salida = item.dHoraSal && item.dHoraSal !== '00:00:00' ?
            '<br><i class="fas fa-sign-out-alt" style="color: #d11e1e;"></i>Salida: ' + item.dHoraSal :
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
                    <strong>Horario Justificado:</strong>
                    <span class="marcacion"><br>${entrada}${salida}</span>
                </div>

                <div>
                    <strong>Estado:</strong>
                    <span>${item.sEstado}</span>
                </div>

                <!-- Botón de Mostrar/Ocultar detalles -->
                <button class="btn btn-sm btn-secondary mt-2" onclick="toggleDetails(this)">Mostrar más</button>
                <div class="hidden-details" style="display: none;">
                    <p><strong>Curso:</strong> ${item.sDesCurso}</p>
                    <p><strong>Aula:</strong> ${item.sAula}</p>
                    <p><strong>Motivo:</strong> ${item.sMotivo}</p>
                </div>
            </div>
        `;
        $(contentContainer).append(card);
    });
}

function descargarExcel() {
    console.log('requestDescargarExcel:', requestDescargarExcel);
    var checkDate = $('#checkDate').val();
    var section = $('#cboSecciones').val();
    var course = $('#cboCursos').val();

    if (checkDate === '' /*|| section === '-1' || course === '-1'*/) {
        alerta_center("warning", "Advertencia", "Por favor seleccione una fecha válida.")
        return;
    }

    section = !isNaN(parseInt(section)) && parseInt(section) > 0 ? section : '';
    course = !isNaN(parseInt(course)) && parseInt(course) > 0 ? course : '';

    const url = requestDescargarExcel + '?fecha=' + checkDate + '&seccion=' + (section || '') + '&curso=' + (course || '');
    window.open(url, '_blank');
}