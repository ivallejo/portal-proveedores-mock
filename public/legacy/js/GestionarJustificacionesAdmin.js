
$(document).ready(function () {
   
    $("#idDocente").autocomplete({
        source: function (request, response) {
            // Realiza una petición AJAX con el término de búsqueda ingresado
            $.ajax({
                url: $('#inputListarDocentes').val(),
                method: "GET",
                data: { filter: request.term },
                success: function (data) {
                    response(data.resultado); // Pasa los datos devueltos por la petición a la función de respuesta
                },
                error: function () {
                    // Maneja errores aquí si es necesario
                }
            });
        },
        minLength: 2
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

function consultarJustificaciones() {

    $("#global-loader").css("display", "revert");

    let idEstado = $('#selectEstado').val();
    let idPeriodo = $('#selectPeriodo').val();
    let idDocente = $('#idDocente').val();

    var formData = new FormData();
    formData.append('Estado', idEstado);
    formData.append('Periodo', idPeriodo);
    formData.append('Docente', idDocente);

    $.ajax({
        url: $('#inputListaJustificaciones').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                if (idEstado === "A") {

                    // Deshabilitar / Habilitar el botón antes de enviar la solicitud
                    $('#btnAprobar').prop('disabled', true);

                    $('#btnDenegar').prop('disabled', false);

                } else if (idEstado === "D") {

                    // Deshabilitar / Habilitar el botón antes de enviar la solicitud
                    $('#btnAprobar').prop('disabled', false);

                    $('#btnDenegar').prop('disabled', true);

                } else {
                    // Habilitar el botón antes de enviar la solicitud
                    $('#btnAprobar').prop('disabled', false);

                    $('#btnDenegar').prop('disabled', false);
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
                                          data-id="${row.nIdJustificacion}" 
                                          data-identificador="${row.sIdentificador}" 
                                          data-motivo="${row.sMotivo}">`;
                            }
                        },
                        { 'data': 'nIdJustificacion' },
                        { 'data': 'dFechaRegistro' },
                        { 'data': 'dFechaSesion' },
                        { 'data': 'sEstado' },
                        { 'data': 'sIdentificador' },
                        {
                            'data': 'sMotivo',
                            'render': function (data, type, row) {
                                return `
                                <div style="max-height: 50px; overflow-y: auto; white-space: normal;">
                                    ${data}
                                </div>`;
                            }
                        },
                        { 'data': 'sApellidosNombresDocente' },
                        { 'data': 'sDesCurso' },
                        { 'data': 'sSeccion' },
                        { 'data': 'sAula' },
                        { 'data': 'dHoraInicio' },
                        { 'data': 'dHoraFin' },
                        { 'data': 'dHoraEntJust' },
                        { 'data': 'dHoraSalJust' },
                        { 'data': 'sNombreArchivo' },
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


function aprobarJustificaciones() {

    // Array para almacenar los valores seleccionados
    let valoresSeleccionadosAprobar = [];

    // Recorre todos los checkboxes seleccionados
    $('.select-checkbox:checked').each(function () {
        // Obtén los valores de los atributos `data-`
        let id = $(this).data('id');
        let identificador = $(this).data('identificador');
        let motivo = $(this).data('motivo').toString();

        // Agrega un objeto con los valores al array `valoresSeleccionados`
        valoresSeleccionadosAprobar.push({
            nIdJustificacion: id,
            sIdentificador: identificador,
            sMotivo: motivo
        });
    });


    $.ajax({
        url: $('#inputAprobarJustificaciones').val(),
        type: "POST",
        data: JSON.stringify(valoresSeleccionadosAprobar),
        contentType: "application/json",
        success: function (data1) {

            if (data1.success) {

                Swal.fire({
                    title: "Registro Exitoso",
                    text: data1.mensaje,
                    icon: "success",
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



function denegarJustificaciones() {

    // Array para almacenar los valores seleccionados
    let valoresSeleccionadosDenegar = [];

    // Recorre todos los checkboxes seleccionados
    $('.select-checkbox:checked').each(function () {
        // Obtén los valores de los atributos `data-`
        let id = $(this).data('id');
        let identificador = $(this).data('identificador');
        let motivo = $(this).data('motivo');

        // Agrega un objeto con los valores al array `valoresSeleccionados`
        valoresSeleccionadosDenegar.push({
            nIdJustificacion: id,
            sIdentificador: identificador,
            sMotivo: motivo
        });
    });

    console.log(valoresSeleccionadosDenegar);

    $.ajax({
        url: $('#inputDenegarJustificaciones').val(),
        type: "POST",
        data: JSON.stringify(valoresSeleccionadosDenegar),
        contentType: "application/json",
        success: function (data1) {

            if (data1.success) {

                Swal.fire({
                    title: "Registro Exitoso",
                    text: data1.mensaje,
                    icon: "success",
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