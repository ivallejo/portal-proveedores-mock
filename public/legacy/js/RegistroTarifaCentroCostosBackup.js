

function MostrarOrganizacion() {

    let idOrganizacion = $('#selectOrganizacion').val();

    if (idOrganizacion === "ESC") {

        $("#divAnio").hide();
        $("#divSemestre").hide();
        $("#divNombre").hide();
        $("#divProgramaGL").show();
        //$("#btnConsultarCostos").hide();
        //$("#btnConsultarCostosGL").show();

        $("#idTablaRegistrarCentroCostosGL").show();
        $("#idTablaRegistrarCentroCostos").hide();

        // Limpia el contenido de tbody para evitar filas residuales
        $('#idTablaRegistrarCentroCostos tbody').empty();

        // Destruye la tabla si ya está inicializada
        if ($.fn.DataTable.isDataTable('#idTablaRegistrarCentroCostos')) {
            $('#idTablaRegistrarCentroCostos').DataTable().destroy();
        }

        // Limpia el contenido de tbody para evitar filas residuales
        $('#idTablaRegistrarCentroCostosGL tbody').empty();

        // Destruye la tabla si ya está inicializada
        if ($.fn.DataTable.isDataTable('#idTablaRegistrarCentroCostosGL')) {
            $('#idTablaRegistrarCentroCostosGL').DataTable().destroy();
        }

        $('#idTablaRegistrarCentroCostosGL').DataTable({

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

    } else {

        
        llenarComboSemestre(idOrganizacion);

        $("#divAnio").show();
        $("#divSemestre").show();
        $("#divNombre").show();
        $("#divProgramaGL").hide();
        //$("#btnConsultarCostos").show();
        //$("#btnConsultarCostosGL").hide();

        $("#idTablaRegistrarCentroCostosGL").hide();
        $("#idTablaRegistrarCentroCostos").show();

        // Limpia el contenido de tbody para evitar filas residuales
        $('#idTablaRegistrarCentroCostos tbody').empty();

        // Destruye la tabla si ya está inicializada
        if ($.fn.DataTable.isDataTable('#idTablaRegistrarCentroCostos')) {
            $('#idTablaRegistrarCentroCostos').DataTable().destroy();
        }

        // Limpia el contenido de tbody para evitar filas residuales
        $('#idTablaRegistrarCentroCostosGL tbody').empty();

        // Destruye la tabla si ya está inicializada
        if ($.fn.DataTable.isDataTable('#idTablaRegistrarCentroCostosGL')) {
            $('#idTablaRegistrarCentroCostosGL').DataTable().destroy();
        }


        $('#idTablaRegistrarCentroCostos').DataTable({

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





    }



}

function llenarComboSemestre(idOrganizacionSem) {


    var formData = new FormData();
    formData.append('organizacion', idOrganizacionSem);
   
    $.ajax({
        url: $('#inputListarSemestres').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                // Obtener el select por su id
                let SemestreSelect = document.getElementById("selectSemestre");
                let SemestreSelectTarifa = document.getElementById("SemestreAgregarTarifa");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                SemestreSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
                SemestreSelectTarifa.innerHTML = '<option value="">Seleccione un semestre</option>';

                // Recorrer las opciones de nSemestreIns y agregarlas al select
                data1.data.forEach(semestre => {

                    console.log(semestre);

                    let option = document.createElement("option");
                    option.text = semestre.nSemestreIns;  // Texto que se muestra en el combo
                    option.value = semestre.nSemestreIns;     // Valor de la opción
                    SemestreSelect.add(option);     // Añadir la opción al select
                    //SemestreSelectTarifa.add(option);     // Añadir la opción al select



                });



                // Recorrer las opciones de nSemestreIns y agregarlas al select
                data1.data.forEach(semestre => {

                    console.log(semestre);

                    let option = document.createElement("option");
                    option.text = semestre.nSemestreIns;  // Texto que se muestra en el combo
                    option.value = semestre.nSemestreIns;     // Valor de la opción
                    SemestreSelectTarifa.add(option);     // Añadir la opción al select
                    //SemestreSelectTarifa.add(option);     // Añadir la opción al select



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


function consultarCostos() {

 

    $("#global-loader").css("display", "revert");

    let idOrganizacion = $('#selectOrganizacion').val();
    let idAnio = $('#selectAnio').val();
    let idSemestre = $('#selectSemestre').val();
    let idNombre = $('#idNombre').val();
    let idPrograma = $('#selectProgramaGL').val();

    if (idOrganizacion === "") {

        $("#global-loader").css("display", "none");

        Swal.fire({
            title: "Informaci\u00F3n",
            text: 'Por favor, seleccione una organizaci\u00F3n',
            icon: "info"
        });

        return;
    }

    if (idOrganizacion !== "ESC" && ((idNombre === "" || !idNombre) || idAnio === "" || idSemestre == "")) {

        $("#global-loader").css("display", "none");

        Swal.fire({
            title: "Informaci\u00F3n",
            text: 'Por favor, ingrese todos los datos',
            icon: "info"
        });

        return;
    }



    if (idOrganizacion === "ESC" && (idPrograma === "" || !idPrograma)) {

        $("#global-loader").css("display", "none");

        Swal.fire({
            title: "Informaci\u00F3n",
            text: 'Por favor, seleccione un programa',
            icon: "info"
        });

        return;
    }


        var formData = new FormData();
        formData.append('docente', idNombre);
        formData.append('organizacion', idOrganizacion);
        formData.append('Programa', idPrograma);
        formData.append('sAnio', idAnio);
        formData.append('sSemestre', idSemestre);

        $.ajax({
            url: $('#inputConsultarTarifa').val(),
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data1) {

                if (data1.success) {


                    if (idOrganizacion !== "ESC") {

                        // Limpia el contenido de tbody para evitar filas residuales
                        $('#idTablaRegistrarCentroCostos tbody').empty();

                        // Destruye la tabla si ya está inicializada
                        if ($.fn.DataTable.isDataTable('#idTablaRegistrarCentroCostos')) {
                            $('#idTablaRegistrarCentroCostos').DataTable().destroy();
                        }


                        $('#idTablaRegistrarCentroCostos').DataTable({
                            "paging": true,
                            "lengthChange": true,
                            "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
                            "searching": true,
                            "ordering": true,
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
                            data: data1.data,
                            columns: [

                                { 'data': 'sCodigoDocente' },
                                { 'data': 'sIdPrograma' },
                                { 'data': 'sNombreDocente' },
                                {
                                    // Agregamos una columna para los botones
                                    data: null,
                                    render: function (data, type, row) {
                                        return `
                                    <button class="btn btn-primary consultar-tarifa" data-bs-toggle="modal" data-bs-target="#modalConsultarTarifa" onclick="ConsultarTarifa('${row.sCodigoDocente}','${row.sNombreDocente}')" >Consultar Tarifa</button>
                                `;
                                    },
                                    orderable: false // Desactivar ordenación en esta columna
                                },
                                {
                                    // Agregamos una columna para los botones
                                    data: null,
                                    render: function (data, type, row) {
                                        return `
                                    <button class="btn btn-primary asignar-tarifa" data-bs-toggle="modal" data-bs-target="#modalAgregarTarifa" onclick="ModalTarifa('${row.sCodigoDocente}','${row.sNombreDocente}')" >Asignar Tarifa</button>
                                `;
                                    },
                                    orderable: false // Desactivar ordenación en esta columna
                                }
                            ],

                        });

                    } else {

                        // Limpia el contenido de tbody para evitar filas residuales
                        $('#idTablaRegistrarCentroCostosGL tbody').empty();

                        // Destruye la tabla si ya está inicializada
                        if ($.fn.DataTable.isDataTable('#idTablaRegistrarCentroCostosGL')) {
                            $('#idTablaRegistrarCentroCostosGL').DataTable().destroy();
                        }


                        $('#idTablaRegistrarCentroCostosGL').DataTable({
                            "paging": true,
                            "lengthChange": true,
                            "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
                            "searching": true,
                            "ordering": true,
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
                            data: data1.data,
                            columns: [

                                { 'data': 'sIdCurso' },
                                { 'data': 'sPrograma' },
                                { 'data': 'sDescripcionCentroCostos' },
                                { 'data': 'nTarifa' },
                                {
                                    // Agregamos una columna para los botones
                                    data: null,
                                    render: function (data, type, row) {
                                        return `
                                    <button class="btn btn-primary asignar-tarifa" data-bs-toggle="modal" data-bs-target="#modalAgregarTarifaGL" onclick="ModalTarifaGL('${row.sIdCurso}')" >Asignar Tarifa</button>
                                        `;
                                    },
                                    orderable: false // Desactivar ordenación en esta columna
                                },
                                {
                                    // Agregamos una columna para los botones
                                    data: null,
                                    render: function (data, type, row) {
                                        return `
                                    <button class="btn btn-primary asignar-tarifa" data-bs-toggle="modal" data-bs-target="#modalVerDocentes" onclick="VerDocentes('${row.sIdCurso}')" >Docentes</button>
                                        `;
                                    },
                                    orderable: false // Desactivar ordenación en esta columna
                                }
                            ],

                        });

                    }

                  

                    $("#global-loader").css("display", "none");

                } else {

                    $("#global-loader").css("display", "none");

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


function ModalTarifa(codigoDocente, nombreDocente) {

    $('#idNombreDocente').text(nombreDocente);

    $('#codigoDocenteAgregarTarifa').val(codigoDocente);
    $('#nombreDocenteAgregarTarifa').val(nombreDocente);

}

function LlenarCombo(identificador) {

    let anio = $('#AnioAgregarTarifa').val();
    let semestre = $('#SemestreAgregarTarifa').val();
    let carrera = $('#CarreraAgregarTarifa').val();
    let centroCosto = $('#CentroCostoAgregarTarifa').val();
    let programa = $('#ProgramaAgregarTarifa').val();

    // Si identificador es 1, establece carrera como cadena vacía
    if (identificador === 1) {
        carrera = "";  // Puedes usar null si prefieres carrera = null;
    }

    var formData = new FormData();
    formData.append('anio', anio);
    formData.append('semestre', semestre);
    formData.append('carrera', carrera);
    formData.append('centroCosto', centroCosto);
    formData.append('programa', programa);
  

    $.ajax({
        url: $('#inputLlenarCombosTarifas').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                if (identificador == 1) {

                    // Obtener el select por su id
                    let carreraSelect = document.getElementById("CarreraAgregarTarifa");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    carreraSelect.innerHTML = '<option value="">Seleccione una carrera</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataMalla.forEach(carrera => {
                        let option = document.createElement("option");
                        option.text = carrera;  // Texto que se muestra en el combo
                        option.value = carrera;     // Valor de la opción
                        carreraSelect.add(option);     // Añadir la opción al select
                    });

                    // Obtener el select por su id
                    let programaSelect = document.getElementById("ProgramaAgregarTarifa");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    programaSelect.innerHTML = '<option value="">Seleccione programa</option>';

                    // Recorrer las opciones de programa y agregarlas al select
                    data1.dataPrograma.forEach(programa => {
                        let option2 = document.createElement("option");
                        option2.text = programa;  // Texto que se muestra en el combo
                        option2.value = programa;     // Valor de la opción
                        programaSelect.add(option2);     // Añadir la opción al select
                    });


                   


                } else {

                    // Obtener el select por su id
                    let programaSelect = document.getElementById("ProgramaAgregarTarifa");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    programaSelect.innerHTML = '<option value="">Seleccione programa</option>';

                    // Recorrer las opciones de programa y agregarlas al select
                    data1.dataPrograma.forEach(programa => {
                        let option2 = document.createElement("option");
                        option2.text = programa;  // Texto que se muestra en el combo
                        option2.value = programa;     // Valor de la opción
                        programaSelect.add(option2);     // Añadir la opción al select
                    });

                }

                
                

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

function AsignarCentroCosto() {

    let anio = $('#AnioAgregarTarifa').val();
    let semestre = $('#SemestreAgregarTarifa').val();
    let carrera = $('#CarreraAgregarTarifa').val();
    let centroCosto = $('#CentroCostoAgregarTarifa').val();
    let centroCostoDesc = $('#CentroCostoAgregarTarifa option:selected').text();
    let programa = $('#ProgramaAgregarTarifa').val();
    let nTarifa = $('#HoraAgregarTarifa').val();
    let codigoDocente = $('#codigoDocenteAgregarTarifa').val();
    let nombreDocente = $('#nombreDocenteAgregarTarifa').val();

    let AsignarCentroCosto = {
        sCodigoDocente: codigoDocente,
        sNombreDocente: nombreDocente,
        nTarifa: nTarifa,
        nCentroCostos: centroCosto,
        sDescripcionCentroCostos: centroCostoDesc,
        nAnio: anio,
        nSemestreIns: semestre,
        sPrograma: programa,
        sMalla: carrera
    };

 
    $.ajax({
        url: $('#inputAsignarTarifa').val(),
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(AsignarCentroCosto),
        success: function (data1) {

            $('#modalAgregarTarifa').modal('hide'); // Usando jQuery

            if (data1.success) {

                Swal.fire({
                    title: "Registro Exitoso!!",
                    text: data1.mensaje,
                    icon: "success",
                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        // Agregar evento de clic al botón de recarga
                        document.getElementById('reloadButton').addEventListener('click', function () {

                            $('#AnioAgregarTarifa').val('');
                            $('#SemestreAgregarTarifa').val('');
                            $('#CarreraAgregarTarifa').val('');
                            $('#CentroCostoAgregarTarifa').val('');
                            $('#ProgramaAgregarTarifa').val('');
                            $('#HoraAgregarTarifa').val('');
                            $('#codigoDocenteAgregarTarifa').val('');
                            $('#nombreDocenteAgregarTarifa').val('');

                            Swal.close();

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

function ConsultarTarifa(codigoDocente, nombreDocente) {

    $('#idConsultarNombreDocente').text(nombreDocente);

    $('#codigoDocenteConsultarTarifa').val(codigoDocente);
    $('#nombreDocenteConsultarTarifa').val(nombreDocente);


    var formData = new FormData();
    formData.append('codigoDocente', codigoDocente);
  

    $.ajax({
        url: $('#inputConsultarTarifaDocente').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                // Limpia el contenido de tbody para evitar filas residuales
                $('#idTablaTarifarioDocente tbody').empty();

                // Destruye la tabla si ya está inicializada
                if ($.fn.DataTable.isDataTable('#idTablaTarifarioDocente')) {
                    $('#idTablaTarifarioDocente').DataTable().destroy();
                }


                $('#idTablaTarifarioDocente').DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": false,
                    //"responsive": true,
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
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <input type="number" class="form-control" value="${row.nTarifa}" id="HoraTarifaActualizar${row.nIdRegistro}">
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        },
              /*          { 'data': 'nTarifa' },*/
                        { 'data': 'sDescripcionCentroCostos' },
                        { 'data': 'nAnio' },
                        { 'data': 'nSemestreIns' },
                        { 'data': 'sPrograma' },
                        {
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-primary" onclick="EditarTarifa('${row.nIdRegistro}','${row.sDescripcionCentroCostos}','${row.nAnio}','${row.nSemestreIns}')" >Editar</button>
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        },
                        {
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-primary" onclick="DesactivarTarifa('${row.nIdRegistro}')" >Eliminar</button>
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        }
                    ],

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

function DesactivarTarifa(nIdRegistro) {


    let codigoDocente =  $('#codigoDocenteConsultarTarifa').val();

    var formData = new FormData();
    formData.append('codigoDocente', codigoDocente);
    formData.append('nIdRegistro', nIdRegistro);

    $.ajax({
        url: $('#inputDesactivarTarifaDocente').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                // Limpia el contenido de tbody para evitar filas residuales
                $('#idTablaTarifarioDocente tbody').empty();

                // Destruye la tabla si ya está inicializada
                if ($.fn.DataTable.isDataTable('#idTablaTarifarioDocente')) {
                    $('#idTablaTarifarioDocente').DataTable().destroy();
                }


                $('#idTablaTarifarioDocente').DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": false,
                    //"responsive": true,
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
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <input type="number" class="form-control" value="${row.nTarifa}" id="HoraTarifaActualizar${row.nIdRegistro}">
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        },
                        /*          { 'data': 'nTarifa' },*/
                        { 'data': 'sDescripcionCentroCostos' },
                        { 'data': 'nAnio' },
                        { 'data': 'nSemestreIns' },
                        { 'data': 'sPrograma' },
                        {
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-primary" onclick="EditarTarifa('${row.nIdRegistro}','${row.sDescripcionCentroCostos}','${row.nAnio}','${row.nSemestreIns}')" >Editar</button>
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        },
                        {
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-primary" onclick="DesactivarTarifa('${row.nIdRegistro}')" >Eliminar</button>
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        }
                    ],

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


function EditarTarifa(nIdRegistro, descripcionCentroCosto, anio, semestre) {


    let codigoDocente = $('#codigoDocenteConsultarTarifa').val();
    let nuevaTarifa = $('#HoraTarifaActualizar' + nIdRegistro).val();


    var formData = new FormData();
    formData.append('codigoDocente', codigoDocente);
    formData.append('nuevaTarifa', nuevaTarifa);
    formData.append('centroCosto', descripcionCentroCosto);
    formData.append('anio', anio);
    formData.append('semestre', semestre);


    $.ajax({
        url: $('#inputEditarTarifaDocente').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                // Limpia el contenido de tbody para evitar filas residuales
                $('#idTablaTarifarioDocente tbody').empty();

                // Destruye la tabla si ya está inicializada
                if ($.fn.DataTable.isDataTable('#idTablaTarifarioDocente')) {
                    $('#idTablaTarifarioDocente').DataTable().destroy();
                }


                $('#idTablaTarifarioDocente').DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": false,
                    //"responsive": true,
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
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <input type="number" class="form-control" value="${row.nTarifa}" id="HoraTarifaActualizar${row.nIdRegistro}">
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        },
                        /*          { 'data': 'nTarifa' },*/
                        { 'data': 'sDescripcionCentroCostos' },
                        { 'data': 'nAnio' },
                        { 'data': 'nSemestreIns' },
                        { 'data': 'sPrograma' },
                        {
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-primary" onclick="EditarTarifa('${row.nIdRegistro}')" >Editar</button>
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        },
                        {
                            // Agregamos una columna para los botones
                            data: null,
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-primary" onclick="DesactivarTarifa('${row.nIdRegistro}')" >Eliminar</button>
                                `;
                            },
                            orderable: false // Desactivar ordenación en esta columna
                        }
                    ],

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


function VerDocentes(idCurso) {

    //$('#idConsultarNombreDocente').text(nombreDocente);

    //$('#codigoDocenteConsultarTarifa').val(codigoDocente);
    //$('#nombreDocenteConsultarTarifa').val(nombreDocente);


    var formData = new FormData();
    formData.append('programa', idCurso);


    $.ajax({
        url: $('#inputVerDocente').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                // Limpia el contenido de tbody para evitar filas residuales
                $('#idTablaDocente tbody').empty();

                // Destruye la tabla si ya está inicializada
                if ($.fn.DataTable.isDataTable('#idTablaDocente')) {
                    $('#idTablaDocente').DataTable().destroy();
                }


                $('#idTablaDocente').DataTable({
                    "paging": true,
                    "lengthChange": true,
                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
                    "searching": true,
                    "ordering": true,
                    "info": true,
                    "autoWidth": false,
                    //"responsive": true,
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
                        
                        { 'data': 'sCodigoDocente' },
                        { 'data': 'sNombreDocente' }
                        
                    ],

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

function mostrarSegundaTarifa() {
    // Selecciona el div de la segunda tarifa
    const segundaTarifaDiv = document.getElementById("idSegundaHora");

    // Cambia entre 'none' y 'block'
    if (segundaTarifaDiv.style.display === "none") {
        segundaTarifaDiv.style.display = "block";
    } else {
        segundaTarifaDiv.style.display = "none";
    }
}

function ModalTarifaGL(codigoPrograma) {

    $('#codigoProgramaAgregarTarifaGL').val(codigoPrograma);

}

function AsignarCentroCostoGL() {

    let anio = $('#AnioAgregarTarifaGL').val();
    let semestre = $('#SemestreAgregarTarifaGL').val();
    let programa = $('#codigoProgramaAgregarTarifaGL').val();
    let centroCosto = $('#CentroCostoAgregarTarifaGL').val();
    let centroCostoDesc = $('#CentroCostoAgregarTarifaGL option:selected').text();
    let nTarifa1 = $('#HoraAgregarTarifaGL').val();
    let nTarifa2 = $('#segundaHoraAgregarTarifaGL').val();
   

    let AsignarCentroCostoGL = {
        nPrograma: programa,
        mesNuevo: semestre,
        nTarifa: nTarifa1,
        nTarifa2: nTarifa2,
        nCodCentroCostos: centroCosto,
        sDescripcionCentroCostos: centroCostoDesc,
        nAnio: anio,
        nSemestreIns: ""
    };


    $.ajax({
        url: $('#inputAsignarTarifaGL').val(),
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(AsignarCentroCostoGL),
        success: function (data1) {

            $('#modalAgregarTarifaGL').modal('hide'); // Usando jQuery

            if (data1.success) {

                Swal.fire({
                    title: "Registro Exitoso!!",
                    text: data1.mensaje,
                    icon: "success",
                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
                    didRender: function () {
                        // Agregar evento de clic al botón de recarga
                        document.getElementById('reloadButton').addEventListener('click', function () {

                            $('#codigoProgramaAgregarTarifaGL').val('');
                            $('#HoraAgregarTarifaGL').val('');
                            $('#segundaHoraAgregarTarifaGL').val('');
                            $('#AnioAgregarTarifaGL').val('');
                            $('#SemestreAgregarTarifaGL').val('');
                            $('#CentroCostoAgregarTarifaGL').val('');
                           

                            Swal.close();
                            consultarCostos();



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