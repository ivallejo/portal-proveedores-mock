$(document).ready(function () {

    var table = $('#tbSeccionesFusionadas').DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[10, 50, 100, 150, -1], [10, 50, 100, 150, "Todos"]],
        "searching": true,
        "ordering": false,
        "info": true,
        "autoWidth": false,
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

    // Vincular los inputs externos a las columnas específicas
    $('#filterId').on('keyup change', function () {
        table.column(0).search(this.value).draw(); // Columna Id
    });

    $('#filterYear').on('keyup change', function () {
        table.column(1).search(this.value).draw(); // Columna Año
    });

    $('#filterSemestre').on('keyup change', function () {
        table.column(2).search(this.value).draw(); // Columna Semestre
    });

    $('#filterTurno').on('keyup change', function () {
        table.column(3).search(this.value).draw(); // Columna Turno
    });

    $('#filterCodigoCurso').on('keyup change', function () {
        table.column(4).search(this.value).draw(); // Columna Código del curso
    });

    $('#filterSeccion').on('keyup change', function () {
        table.column(5).search(this.value).draw(); // Columna Sección
    });

    $('#filterEstado').on('keyup change', function () {
        table.column(6).search(this.value).draw(); // Columna Estado
    });

    $('#selectanios').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    $('#selectSemestres').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    $('#selectTurnos').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    $('#selectSeccion').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    $('#selectCodigoCurso').select2({
        theme: 'bootstrap-5',
        allowClear: true
    });

    $('#selectaniosModal').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarSeccionHija'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectSemestresModal').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarSeccionHija'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectTurnosModal').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarSeccionHija'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectSeccionModal').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarSeccionHija'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectCodigoCursoModal').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarSeccionHija'),  // Especifica el modal como contenedor
        allowClear: true
    });

});


function BuscarSemestre() {
    let valorSeleccionado = $('#selectanios').val(); // Verifica que el id 'selectanios' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionado);

    $.ajax({
        url: $('#inputSemestre').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectSemestres').empty();
            $('#selectSemestres').append('<option value="">Seleccione un semestre</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectSemestres').append('<option value="' + item + '">' + item + '</option>');
            });

            $('#selectTurnos').empty();
            $('#selectTurnos').append('<option value="">Seleccione un turno</option>');
            $('#selectCodigoCurso').empty();
            $('#selectCodigoCurso').append('<option value="">Seleccione un curso</option>');
            $('#selectSeccion').empty();
            $('#selectSeccion').append('<option value="">Seleccione una secci&oacute;n</option>');
           
        },
        error: function (error) {

        }

    });

}

function BuscarTurno() {
    let valorSeleccionadoAnio = $('#selectanios').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestres').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);

    $.ajax({
        url: $('#inputTurnos').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectTurnos').empty();
            $('#selectTurnos').append('<option value="">Seleccione un turno</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectTurnos').append('<option value="' + item + '">' + item + '</option>');
            });

            $('#selectCodigoCurso').empty();
            $('#selectCodigoCurso').append('<option value="">Seleccione un curso</option>');
            $('#selectSeccion').empty();
            $('#selectSeccion').append('<option value="">Seleccione una secci&oacute;n</option>');

        },
        error: function (error) {

        }

    });

}


function BuscarCurso() {
    let valorSeleccionadoAnio = $('#selectanios').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestres').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoTurno = $('#selectTurnos').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoSeccion = $('#selectSeccion').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);
    formData.append('turno', valorSeleccionadoTurno);
    formData.append('seccion', valorSeleccionadoSeccion);

    $.ajax({
        url: $('#inputCodigoCurso').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectCodigoCurso').empty();
            $('#selectCodigoCurso').append('<option value="">Seleccione un curso</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectCodigoCurso').append('<option value="' + item + '">' + item + '</option>');
            });

            //$('#selectSeccion').empty();
            //$('#selectSeccion').append('<option value="">Seleccione una secci&oacute;n</option>');

        },
        error: function (error) {

        }

    });

}


function BuscarSeccion() {
    let valorSeleccionadoAnio = $('#selectanios').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestres').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoTurno = $('#selectTurnos').val(); // Verifica que el id 'selectSemestres' exista
    //let valorSeleccionadoCodigoCurso = $('#selectCodigoCurso').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);
    formData.append('turno', valorSeleccionadoTurno);
    //formData.append('codCurso', valorSeleccionadoCodigoCurso);

    $.ajax({
        url: $('#inputSeccion').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectSeccion').empty();
            $('#selectSeccion').append('<option value="">Seleccione una secci&oacute;n</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectSeccion').append('<option value="' + item + '">' + item + '</option>');
            });

           

        },
        error: function (error) {

        }

    });

}



function AgregarSeccionPadre() {

  
    let valorSeleccionadoAnio = $('#selectanios').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestres').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoTurno = $('#selectTurnos').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoCodigoCurso = $('#selectCodigoCurso').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoSeccion = $('#selectSeccion').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);
    formData.append('turno', valorSeleccionadoTurno);
    formData.append('codCurso', valorSeleccionadoCodigoCurso);
    formData.append('seccion', valorSeleccionadoSeccion);

    $.ajax({
        url: $('#inputGuardarSeccionPadre').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
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
                    title: "Error al registrar",
                    html: data1.mensaje,
                    icon: "error"
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



function BuscarSemestreModal() {
    let valorSeleccionado = $('#selectaniosModal').val(); // Verifica que el id 'selectanios' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionado);

    $.ajax({
        url: $('#inputSemestre').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectSemestresModal').empty();
            $('#selectSemestresModal').append('<option value="">Seleccione un semestre</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectSemestresModal').append('<option value="' + item + '">' + item + '</option>');
            });

            $('#selectTurnosModal').empty();
            $('#selectTurnosModal').append('<option value="">Seleccione un turno</option>');
            $('#selectCodigoCursoModal').empty();
            $('#selectCodigoCursoModal').append('<option value="">Seleccione un curso</option>');
            $('#selectSeccionModal').empty();
            $('#selectSeccionModal').append('<option value="">Seleccione una secci&oacute;n</option>');

        },
        error: function (error) {

        }

    });

}

function BuscarTurnoModal() {
    let valorSeleccionadoAnio = $('#selectaniosModal').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestresModal').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);

    $.ajax({
        url: $('#inputTurnos').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectTurnosModal').empty();
            $('#selectTurnosModal').append('<option value="">Seleccione un turno</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectTurnosModal').append('<option value="' + item + '">' + item + '</option>');
            });

            $('#selectCodigoCursoModal').empty();
            $('#selectCodigoCursoModal').append('<option value="">Seleccione un curso</option>');
            $('#selectSeccionModal').empty();
            $('#selectSeccionModal').append('<option value="">Seleccione una secci&oacute;n</option>');

        },
        error: function (error) {

        }

    });

}


function BuscarCursoModal() {
    let valorSeleccionadoAnio = $('#selectaniosModal').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestresModal').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoTurno = $('#selectTurnosModal').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoSeccion = $('#selectSeccionModal').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);
    formData.append('turno', valorSeleccionadoTurno);
    formData.append('seccion', valorSeleccionadoSeccion);

    $.ajax({
        url: $('#inputCodigoCurso').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectCodigoCursoModal').empty();
            $('#selectCodigoCursoModal').append('<option value="">Seleccione un curso</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectCodigoCursoModal').append('<option value="' + item + '">' + item + '</option>');
            });

            //$('#selectSeccionModal').empty();
            //$('#selectSeccionModal').append('<option value="">Seleccione una secci&oacute;n</option>');

        },
        error: function (error) {

        }

    });

}


function BuscarSeccionModal() {
    let valorSeleccionadoAnio = $('#selectaniosModal').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestresModal').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoTurno = $('#selectTurnosModal').val(); // Verifica que el id 'selectSemestres' exista
    //let valorSeleccionadoCodigoCurso = $('#selectCodigoCursoModal').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);
    formData.append('turno', valorSeleccionadoTurno);
    //formData.append('codCurso', valorSeleccionadoCodigoCurso);

    $.ajax({
        url: $('#inputSeccion').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            // Limpia el combo de semestres antes de llenarlo
            $('#selectSeccionModal').empty();
            $('#selectSeccionModal').append('<option value="">Seleccione una secci&oacute;n</option>');

            // Recorre los datos devueltos y agrégalos como opciones al select
            $.each(data1.data, function (index, item) {
                $('#selectSeccionModal').append('<option value="' + item + '">' + item + '</option>');
            });



        },
        error: function (error) {

        }

    });

}

function SeccionesHijas(idPadre) {

    $('#idseccionPadre').val(idPadre); // Establece el valor "Nuevo Valor" en el input con id 'miInput'

    var formData = new FormData();
    formData.append('idPadre', idPadre);

    $.ajax({
        url: $('#inputListSeccionesHijas').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                console.log(data1);

                // Verificar si el DataTable ya está inicializado y destruirlo correctamente
                if ($.fn.DataTable.isDataTable('#tbSeccionesFusionadasHijas')) {
                    $('#tbSeccionesFusionadasHijas').DataTable().clear().destroy();
                }

                // Inicializar el DataTable nuevamente
                var table = $('#tbSeccionesFusionadasHijas').DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "lengthMenu": [[10, 50, 100, 150, -1], [10, 50, 100, 150, "Todos"]],
                    "searching": true,
                    "ordering": false,
                    "info": true,
                    "autoWidth": false,
                    "responsive": true,
                    "data": data1.data, // Utilizar los datos JSON que vienen del servidor
                    "columns": [
                        { "data": "id_seccion_hija" },  // Propiedad del objeto JSON a mostrar en esta columna
                        { "data": "academic_year" },
                        { "data": "academic_term" },
                        { "data": "academic_session" },
                        { "data": "event_id" },
                        { "data": "section" },
                        {
                            "data": null,  // No depende de ninguna propiedad del objeto
                            "render": function (data, type, row) {
                                // Agregar un botón con un ícono de Font Awesome
                                return '<button class="btn btn-danger btn-sm" onclick="DesactivarSeccionHija(' + row.id_seccion_hija + ')"><i class="fas fa-trash"></i></button>';
                            },
                            "orderable": false  // Desactivar el ordenamiento para esta columna
                        }
                    ],
                    "columnDefs": [
                        { "width": "5%", "targets": 0 },  // Ajusta el ancho según el contenido
                        { "width": "20%", "targets": 1 },
                        { "width": "15%", "targets": 2 },
                        { "width": "20%", "targets": 3 },
                        { "width": "10%", "targets": 4 },
                        { "width": "15%", "targets": 5 },
                        { "width": "15%", "targets": 6 }
                    ],
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
                    //initComplete: function () {
                    //    // Para cada columna en el pie de página
                    //    this.api().columns().every(function () {
                    //        var column = this;
                    //        // Agrega un input de búsqueda a cada columna
                    //        $('input', this.header()).on('keyup change clear', function () {
                    //            if (column.search() !== this.value) {
                    //                column.search(this.value).draw();
                    //            }
                    //        });
                    //    });
                    //}
                });


                // Vincular los inputs externos a las columnas específicas
                $('#filterIdHijo').on('keyup change', function () {
                    table.column(0).search(this.value).draw(); // Columna Id
                });

                $('#filterYearHijo').on('keyup change', function () {
                    table.column(1).search(this.value).draw(); // Columna Año
                });

                $('#filterSemestreHijo').on('keyup change', function () {
                    table.column(2).search(this.value).draw(); // Columna Semestre
                });

                $('#filterTurnoHijo').on('keyup change', function () {
                    table.column(3).search(this.value).draw(); // Columna Turno
                });

                $('#filterCodigoCursoHijo').on('keyup change', function () {
                    table.column(4).search(this.value).draw(); // Columna Código del curso
                });

                $('#filterSeccionHijo').on('keyup change', function () {
                    table.column(5).search(this.value).draw(); // Columna Sección
                });

                // Forzar ajuste de columnas
                table.columns.adjust().draw();


            } else {

            }


        },
        error: function (error) {

        }

    });

}


function registrarSeccionesHijas() {

    let idseccionPadre = $('#idseccionPadre').val();
    let valorSeleccionadoAnio = $('#selectaniosModal').val(); // Verifica que el id 'selectanios' exista
    let valorSeleccionadoSemestre = $('#selectSemestresModal').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoTurno = $('#selectTurnosModal').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoCodigoCurso = $('#selectCodigoCursoModal').val(); // Verifica que el id 'selectSemestres' exista
    let valorSeleccionadoSeccion = $('#selectSeccionModal').val(); // Verifica que el id 'selectSemestres' exista

    var formData = new FormData();
    formData.append('idSeccionPadre', idseccionPadre);
    formData.append('anio', valorSeleccionadoAnio);
    formData.append('semestre', valorSeleccionadoSemestre);
    formData.append('turno', valorSeleccionadoTurno);
    formData.append('codCurso', valorSeleccionadoCodigoCurso);
    formData.append('seccion', valorSeleccionadoSeccion);

    $.ajax({
        url: $('#inputGuardarSeccionHija').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {


                SeccionesHijas(idseccionPadre);

                //Swal.fire({
                //    title: "Registro Exitoso",
                //    text: data1.mensaje,
                //    icon: "success",
                //    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                //    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                //    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                //    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                //    didRender: function () {
                //        // Agregar evento de clic al botón de recarga
                //        document.getElementById('reloadButton').addEventListener('click', function () {
                //            location.reload(true); // Recarga la página
                //        });
                //    }
                //});

            } else {

                Swal.fire({
                    title: "Error en el registro de secciones Hijas",
                    html: data1.mensaje,
                    icon: "error"
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


function DesactivarSeccionPadre(idPadre) {


    Swal.fire({
        title: "Est\u00e1s seguro que deseas desactivar esta secci\u00f3n?",
        text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si"
    }).then((result) => {
        if (result.isConfirmed) {


            var formData = new FormData();
            formData.append('idPadre', idPadre);

            $.ajax({
                url: $('#inputDesactivarSeccionPadre').val(),
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (data1) {

                    if (data1.success) {

                        Swal.fire({
                            title: "Actualizaci&oacute;n Exitoso",
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
                            icon: "error"
                        });
                    }

                },
                error: function (error) {

                }

            });



        }
    });



    

}


function DesactivarSeccionHija(idHija) {


    Swal.fire({
        title: "Est\u00e1s seguro que deseas desactivar esta secci\u00f3n?",
        text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si"
    }).then((result) => {
        if (result.isConfirmed) {

            var formData = new FormData();
            formData.append('idHija', idHija);

            $.ajax({
                url: $('#inputDesactivarSeccionHija').val(),
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (data1) {

                    if (data1.success) {

                        Swal.fire({
                            title: "Actualizaci&oacute;n Exitoso",
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
                            icon: "error"
                        });
                    }

                },
                error: function (error) {

                }

            });


        }
    });

  
}
