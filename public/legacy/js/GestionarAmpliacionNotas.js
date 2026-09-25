
$(document).ready(function () {
   
    $("#idDocente").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: $('#inputListarDocentes').val(), // Cambia la URL al nuevo endpoint
                method: "GET",
                data: { filter: request.term },
                success: function (data) {
                    response($.map(data.resultado, function (item) {
                        return {
                            label: item.sNombreDocente, // Se muestra en el input
                            value: item.sCodDocente, // Se almacena internamente
                            nombre: item.sNombreDocente // Se usará para mostrar en el input
                        };
                    }));
                },
                error: function () {
                    console.error("Error al obtener la lista de docentes");
                }
            });
        },
        minLength: 2,
        select: function (event, ui) {
            event.preventDefault();
            $("#idDocente").val(ui.item.nombre); // Muestra el nombre en el input
            $("#idDocente").attr("data-docente-id", ui.item.value); // Guarda sCodDocente en un atributo oculto
        }
    });

    $('#idTablaGestJustificaciones').DataTable({

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
    });

});
function mostrarSeccionesHijas(identificador, secciones) {
    // Convertir el string JSON de secciones a un array de objetos
    //console.log("Secciones", secciones);
    let seccionesArray = JSON.parse(secciones);

    // Limpiar la tabla antes de llenarla
    $("#tablaSeccionesHijas").empty();

    // Llenar la tabla con las secciones hijas
    seccionesArray.forEach(function (seccion) {
        let fila = `<tr>
                        <td>${seccion.section}</td>
                        <td>${seccion.event_id}</td>
                    </tr>`;
        $("#tablaSeccionesHijas").append(fila);
    });

    // Mostrar el modal
    $("#modalSeccionesHijas").modal("show");
}

function consultarJustificaciones() {

    $("#global-loader").css("display", "revert");

    let idEstado = $('#selectEstado').val();
    let idPeriodo = $('#selectPeriodo').val();
    let idDocente = $("#idDocente").val();

    var formData = new FormData();
    formData.append('Estado', idEstado);
    formData.append('Periodo', idPeriodo);
    formData.append('Docente', idDocente);

    // Imprimir valores de formData en consola
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    $.ajax({
        url: $('#inputListaJustificaciones').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {
                console.log(data1.data);
                if (idEstado === "P" && data1.data.length>0) {
                    $("#btnAprobar, #btnDenegar").removeAttr("hidden"); // Quita el atributo hidden
                } else {
                    $("#btnAprobar, #btnDenegar").attr("hidden", true); // Vuelve a ocultar los botones si no es "P"
                }

                // Limpia el contenido de tbody para evitar filas residuales
                $('#idTablaGestJustificaciones tbody').empty();

                // Destruye la tabla si ya está inicializada
                if ($.fn.DataTable.isDataTable('#idTablaGestJustificaciones')) {
                    $('#idTablaGestJustificaciones').DataTable().destroy();
                }


                $('#idTablaGestJustificaciones').DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "lengthMenu": [[50, 100, 150, -1], [50, 100, 150, "All"]],
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    //"autoWidth": false,
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
                    data: data1.data,
                    columns: [
                        {
                            'data': null,
                            'orderable': false,
                            'className': 'dt-center',
                            'render': function (data, type, row) {
                                return `<input type="checkbox" class="select-checkbox" 
                                          data-id="${row.idsAmp}" data-identificador="${row.identificadorSecciones_Fusionadas}">`;
                            }
                        },
                        { 'data': 'sfecha_creacion' },
                        { 'data': 'title_section_grading' },
                        { 'data': 'estado_evaluacion' },
                        {
                            'data': 'motivo',
                            'render': function (data, type, row) {
                                return `
                                <div style="max-height: 50px; overflow-y: auto; white-space: normal;">
                                    ${data}
                                </div>`;
                            }
                        },
                        { 'data': 'nombre_docente' },
                        { 'data': 'organizacion' },
                        { 'data': 'periodo' },
                        { 'data': 'academic_session' },
                        { 'data': 'filename_archivo' },
                        {
                            'data': 'sUrlArchivo',
                            'render': function (data, type, row) {
                                // Verifica que el URL no esté vacío
                                if (data) {
                                    return `<a href="${data}" target="_blank">
                                                <img src="../images/gallery.png" alt="Ver Archivo" style="width: 20px; height: 20px;">
                                            </a>`;
                                }
                                return 'Sin archivo';
                            }
                        },
                        {
                            'data': 'seccionesHijas',
                            'render': function (data, type, row) {
                                if (data && data.length > 0) {
                                    let jsonSecciones = JSON.stringify(data).replace(/"/g, '&quot;'); // Escapa comillas dobles
                                    return `<button class="btn btn-primary btn-sm" 
                        onclick="mostrarSeccionesHijas('${row.identificadorSecciones_Fusionadas}', '${jsonSecciones}')">
                        Ver Secciones
                    </button>`;
                                }
                                return 'Sin secciones';
                            }
                        }

                    ],

                });

                $("#global-loader").css("display", "none");
               
            } else {

                Swal.fire({
                    title: "Error",
                    text: data1.mensaje,
                    icon: "error",
                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        // Agregar evento de clic al botón de recarga
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true); // Recarga la página
                        });
                    }
                });


            }


        },
        error: function (error) {

            Swal.fire({
                title: "Error",
                text: error,
                icon: "error"
            });
        }

    });

}

function aprobarAmpliacionNotas() {
    let solicitudesAprobar = obtenerSolicitudesSeleccionadas("A");
    if (solicitudesAprobar.length === 0) {
        Swal.fire("Aviso", "Debe seleccionar al menos una solicitud", "warning");
        return;
    }
    enviarAmpliacionNotas(solicitudesAprobar, $('#inputAprobarAmpliacionNotas').val());
}

function denegarAmpliacionNotas() {
    let solicitudesDenegar = obtenerSolicitudesSeleccionadas("D");
    if (solicitudesDenegar.length === 0) {
        Swal.fire("Aviso", "Debe seleccionar al menos una solicitud", "warning");
        return;
    }
    enviarAmpliacionNotas(solicitudesDenegar, $('#inputDenegarAmpliacionNotas').val());
}

function obtenerSolicitudesSeleccionadas(estado) {
    let solicitudes = [];

    $('.select-checkbox:checked').each(function () {
        let ids = $(this).data('id').toString().split(',');

        ids.forEach(id => {
            solicitudes.push({
                idAmpNotas: parseInt(id.trim()),
                estado_evaluacion: estado,
            });
        });
    });

    return solicitudes;
}

function enviarAmpliacionNotas(solicitudes, url) {
    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(solicitudes),
        contentType: "application/json",
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    title: "Registro Exitoso",
                    text: response.mensaje,
                    icon: "success",
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        document.getElementById('reloadButton').addEventListener('click', function () {
                            location.reload(true);
                        });
                    }
                });
            } else {
                Swal.fire("Error", response.mensaje, "error");
            }
        },
        error: function () {
            Swal.fire("Error", "Ocurrió un problema al procesar la solicitud", "error");
        }
    });
}
