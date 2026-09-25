$(document).ready(function () {

    $('#selectPrograma').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectCodigoCurso').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectCentroCosto').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectConceptoCursoImporte').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectConceptoCursoHoras').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalAgregarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });


    $('#selectConceptoCursoImporteActualizar').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalEditarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectConceptoCursoHorasActualizar').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalEditarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectCentroCostoActualizar').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalEditarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectCodigoCursoActualizar').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalEditarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });

    $('#selectProgramaActualizar').select2({
        theme: 'bootstrap-5',
        dropdownParent: $('#modalEditarTarifa'),  // Especifica el modal como contenedor
        allowClear: true
    });
});

function MostrarOrganizacion() {

    let idOrganizacion = $('#selectOrganizacion').val();

    llenarComboSemestre(idOrganizacion);

    $("#divAnio").show();
    $("#divSemestre").show();


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
                let SemestreSelect = document.getElementById("selectPeriodo");
/*                let SemestreSelectTarifa = document.getElementById("SemestreAgregarTarifa");*/

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                SemestreSelect.innerHTML = '<option value="">Seleccione un semestre</option>';
                //SemestreSelectTarifa.innerHTML = '<option value="">Seleccione un semestre</option>';

                // Recorrer las opciones de nSemestreIns y agregarlas al select
                data1.data.forEach(semestre => {

                    console.log(semestre);

                    let option = document.createElement("option");
                    option.text = semestre.nSemestreIns;  // Texto que se muestra en el combo
                    option.value = semestre.nSemestreIns;     // Valor de la opción
                    SemestreSelect.add(option);     // Añadir la opción al select
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

function ConsultarCostos() {


    $("#global-loader").css("display", "revert");

    let idOrganizacion = $('#selectOrganizacion').val();
    let idAnio = $('#selectAnio').val();
    let idSemestre = $('#selectPeriodo').val();

    if (idOrganizacion === "") {

        $("#global-loader").css("display", "none");

        Swal.fire({
            title: "Informaci\u00F3n",
            text: 'Por favor, seleccione una organizaci\u00F3n',
            icon: "info"
        });

        return;
    }

    if (idAnio === "" || idSemestre == "") {

        $("#global-loader").css("display", "none");

        Swal.fire({
            title: "Informaci\u00F3n",
            text: 'Por favor, ingrese todos los datos',
            icon: "info"
        });

        return;
    }

        var formData = new FormData();
        formData.append('organizacion', idOrganizacion);
        formData.append('sAnio', idAnio);
        formData.append('sPeriodo', idSemestre);

        $.ajax({
            url: $('#inputConsultarTarifa').val(),
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data1) {

                if (data1.success) {

                    $("#idTablaRegistrarCentroCostos").show();

                    $('#btnAsignarCostos').prop('disabled', false);

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

                                { 'data': 'anio' },
                                { 'data': 'periodo' },
                                { 'data': 'code_curriculum' },
                                { 'data': 'event_id' },
                                { 'data': 'nCodCentroCostos' },
                                { 'data': 'sDescripcionCentroCostos' },
                                {
                                    data: 'estado',
                                    render: function (data, type, row) {
                                        return data ? 'ACTIVO' : 'INACTIVO';
                                    }
                                },
                                {
                                    // Agregamos una columna para los botones
                                    data: null,
                                    render: function (data, type, row) {
                                        return `
                                    <button class="btn btn-primary consultar-tarifa" data-bs-toggle="modal" data-bs-target="#modalConsultarTarifa" onclick="ConsultarTarifa('${row.id_tarifa_centro_costo}')" ><i class="fas fa-edit"></i></button>
                                `;
                                    },
                                    orderable: false // Desactivar ordenación en esta columna
                                }
                            
                            ]
                           
                        });

                    } else {

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

                                { 'data': 'anio' },
                                { 'data': 'periodo' },
                                { 'data': 'code_curriculum' },
                                { 'data': 'event_id' },
                                { 'data': 'nCodCentroCostos' },
                                { 'data': 'sDescripcionCentroCostos' },
                                {
                                    data: 'estado',
                                    render: function (data, type, row) {
                                        return data ? 'ACTIVO' : 'INACTIVO';
                                    }
                                },
                                {
                                    // Agregamos una columna para los botones
                                    data: null,
                                    render: function (data, type, row) {
                                        return `
                                    <button class="btn btn-primary consultar-tarifa" data-bs-toggle="modal" data-bs-target="#modalConsultarTarifa" onclick="ConsultarTarifa('${row.id_tarifa_centro_costo}')" ><i class="fas fa-edit"></i></button>
                                `;
                                    },
                                    orderable: false // Desactivar ordenación en esta columna
                                }
                            ],
                             columnDefs: [
                                {
                                    targets: [3], // índice de la columna que deseas ocultar
                                    visible: false,
                                    searchable: false
                                }
                            ]


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

function LlenarCombo(identificador) {

    let idOrganizacion = $('#selectOrganizacion').val();
    let idAnio = $('#selectAnio').val();
    let idSemestre = $('#selectPeriodo').val();
    let idPrograma = $('#selectPrograma').val();

  
    var formData = new FormData();
    formData.append('organizacion', idOrganizacion);
    formData.append('anio', idAnio);
    formData.append('periodo', idSemestre);
    formData.append('programa', idPrograma);


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
                    let programaSelect = document.getElementById("selectPrograma");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    programaSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataPrograma.forEach(programa => {
                        let option = document.createElement("option");
                        option.text = programa.sIdCarrera + "-" + programa.sDesCarrera;  // Texto que se muestra en el combo
                        option.value = programa.sIdCarrera;     // Valor de la opción
                        programaSelect.add(option);     // Añadir la opción al select
                    });

                    // Obtener el select por su id
                    let centrocostoSelect = document.getElementById("selectCentroCosto");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    centrocostoSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataCentroCosto.forEach(centrocosto => {
                        let option = document.createElement("option");
                        option.text = centrocosto.nCodCentroCostos + "-" + centrocosto.sDescripcionCentroCostos;  // Texto que se muestra en el combo
                        option.value = centrocosto.nIdRegistro;     // Valor de la opción
                        centrocostoSelect.add(option);     // Añadir la opción al select
                    });

                    // Obtener el select por su id
                    let conceptoCursoImporteSelect = document.getElementById("selectConceptoCursoImporte");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    conceptoCursoImporteSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataConceptoCodigoImporte.forEach(conceptocodigo => {
                        let option = document.createElement("option");
                        option.text = conceptocodigo.codigo + "-" + conceptocodigo.nombre_boleta;  // Texto que se muestra en el combo
                        option.value = conceptocodigo.id;     // Valor de la opción
                        conceptoCursoImporteSelect.add(option);     // Añadir la opción al select
                    });

                    // Obtener el select por su id
                    let conceptoCursoHorasSelect = document.getElementById("selectConceptoCursoHoras");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    conceptoCursoHorasSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataConceptoCodigoHoras.forEach(conceptocodigo => {
                        let option = document.createElement("option");
                        option.text = conceptocodigo.codigo + "-" + conceptocodigo.nombre_boleta;  // Texto que se muestra en el combo
                        option.value = conceptocodigo.id;     // Valor de la opción
                        conceptoCursoHorasSelect.add(option);     // Añadir la opción al select
                    });


                } else {

                    // Obtener el select por su id
                    let cursoSelect = document.getElementById("selectCodigoCurso");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    cursoSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de programa y agregarlas al select
                    data1.dataCurso.forEach(curso => {
                        let option2 = document.createElement("option");
                        option2.text = curso.sIdCurso + "-" + curso.sDesCurso;  // Texto que se muestra en el combo
                        option2.value = curso.sIdCurso;     // Valor de la opción
                        cursoSelect.add(option2);     // Añadir la opción al select
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

function ModalAsignarTarifa() {

    let idOrganizacion = $('#selectOrganizacion').val();
    let idAnio = $('#selectAnio').val();
    let idSemestre = $('#selectPeriodo').val();

    $('#idOrganizacion').val(idOrganizacion);
    $('#idAnio').val(idAnio);
    $('#idPeriodo').val(idSemestre);

    LlenarCombo(1);

    if (idOrganizacion == "ESC") {
        $('#divCodigoCursoRegistrar').hide();
        $('#tipoSesionPago').show();
    } else {
        $('#divCodigoCursoRegistrar').show();
        $('#tipoSesionPago').hide();
    }



    $('#modalAgregarTarifa').modal('show'); // Usando jQuery

   

}

function AsignarCentroCosto(identificador) {

    let idOrganizacion;
    let idAnio;
    let idPeriodo;
    let idprograma;
    let idcodigoCurso;
    let idcentroCosto;
    let idestado;
    let idConceptoCursoImporte;
    let idConceptoCursoHoras;
    let esSincrono;
    let esAsincrono;
    let tipo_sesion_pago;
    if (identificador == 1) {
        //Crear
        id_tarifa_centro_costo = 0
        idOrganizacion = $('#selectOrganizacion').val();
        idAnio = $('#selectAnio').val();
        idPeriodo = $('#selectPeriodo').val();
        idprograma = $('#selectPrograma').val();
        idcodigoCurso = $('#selectCodigoCurso').val();
        idcentroCosto = $('#selectCentroCosto').val();
        idestado = true;
        idConceptoCursoImporte = $('#selectConceptoCursoImporte').val();
        idConceptoCursoHoras = $('#selectConceptoCursoHoras').val();
        if (idOrganizacion == "ESC") {
            esSincrono = $("#switchSincrono").is(':checked');
            esAsincrono = $("#switchAsincrono").is(':checked');
        } else {
            esSincrono = true;
            esAsincrono = true;
        }
    } else {
        //Actualizar
        id_tarifa_centro_costo = $('#inputid_tarifa_centro_costo').val()
        idOrganizacion = $('#selectOrganizacionActualizar').val();
        idAnio = $('#selectAnioActualizar').val();
        idPeriodo = $('#selectPeriodoActualizar').val();
        idprograma = $('#selectProgramaActualizar').val();
        idcodigoCurso = $('#selectCodigoCursoActualizar').val();
        idcentroCosto = $('#selectCentroCostoActualizar').val();
        idestado = $('#selectEstadoActualizar').val() == 1 ? true : false;
        idConceptoCursoImporte = $('#selectConceptoCursoImporteActualizar').val();
        idConceptoCursoHoras = $('#selectConceptoCursoHorasActualizar').val();
        if (idOrganizacion == "ESC") {
            esSincrono = $("#switchSincronoAct").is(':checked');
            esAsincrono = $("#switchAsincronoAct").is(':checked');
        } else {
            esSincrono = true;
            esAsincrono = true;
        }
    }

    if (esSincrono == false && esAsincrono == false) {
        Swal.fire({
            title: "Error",
            text: "Seleccione Sincrono, Asincrono o ambos!",
            icon: "error",
            showConfirmButton: true, // Oculta el botón de confirmación predeterminado
            allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
            allowEscapeKey: false, // Evita que se cierre con la tecla Escape
            //footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
            //didRender: function () {
            //    // Agregar evento de clic al botón de recarga
            //    document.getElementById('reloadButton').addEventListener('click', function () {
            //        location.reload(true); // Recarga la página
            //    });
            //}
        });
        return;
    }

    if (esSincrono && esAsincrono) {
        tipo_sesion_pago = "Ambos";
    } else if (esSincrono) {
        tipo_sesion_pago = "Sin";
    } else {
        tipo_sesion_pago = "Asin";
    }

    let AsignarCentroCosto = {
        id_tarifa_centro_costo: id_tarifa_centro_costo,
        id_registro_centro_costo: idcentroCosto,
        organizacion: idOrganizacion,
        anio: idAnio,
        periodo: idPeriodo,
        code_curriculum: idprograma,
        event_id: idcodigoCurso,
        estado: idestado,
        id_conceptoImporte: idConceptoCursoImporte,
        id_conceptoHoras: idConceptoCursoHoras,
        tipo_sesion_pago: tipo_sesion_pago
    };

    $.ajax({
        url: $('#inputAsignarTarifa').val(),
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(AsignarCentroCosto),
        success: function (data1) {

            if (identificador == 1) {
                $('#modalAgregarTarifa').modal('hide'); // Usando jQuery
            } else {
                $('#modalEditarTarifa').modal('hide'); // Usando jQuery
            }

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

                            $('#idOrganizacion').val('');
                            $('#idAnio').val('');
                            $('#idPeriodo').val('');
                            $('#selectPrograma').val('');
                            $('#selectCodigoCurso').val('');
                            $('#selectCentroCosto').val('');
                            $('#selectOrganizacionActualizar').val('');
                            $('#selectAnioActualizar').val('');
                            $('#selectPeriodoActualizar').val('');
                            $('#selectProgramaActualizar').val('');
                            $('#selectCodigoCursoActualizar').val('');
                            $('#selectCentroCostoActualizar').val('');
                            $('#selectEstadoActualizar').val('');

                            ConsultarCostos();

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

function ConsultarTarifa(idRegistro) {

  
    var formData = new FormData();
    formData.append('idRegistro', idRegistro);
    let idOrganizacion = $('#selectOrganizacion').val();
    if (idOrganizacion == "ESC") {
        $('#switchSincronoAct').show();
        $('#switchAsincronoAct').show();
    } else {
        $('#switchSincronoAct').hide();
        $('#switchAsincronoAct').hide();
    }

    ConsultarTarifa

    $.ajax({
        url: $('#inputConsultarTarifaRegistrar').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success) {

                // Obtener el select por su id
                let periodoSelect = document.getElementById("selectPeriodoActualizar");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                periodoSelect.innerHTML = '<option value="">Seleccione</option>';

                // Recorrer las opciones de carrera y agregarlas al select
                data1.dataSemestre.forEach(periodo => {
                    let option = document.createElement("option");
                    option.text = periodo.nSemestreIns;  // Texto que se muestra en el combo
                    option.value = periodo.nSemestreIns;     // Valor de la opción
                    periodoSelect.add(option);     // Añadir la opción al select
                });

                // Obtener el select por su id
                let programaSelect = document.getElementById("selectProgramaActualizar");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                programaSelect.innerHTML = '<option value="">Seleccione</option>';

                // Recorrer las opciones de carrera y agregarlas al select
                data1.dataPrograma.forEach(programa => {
                    let option = document.createElement("option");
                    option.text = programa.sIdCarrera + "-" + programa.sDesCarrera;  // Texto que se muestra en el combo
                    option.value = programa.sIdCarrera;     // Valor de la opción
                    programaSelect.add(option);     // Añadir la opción al select
                });
                
                // Obtener el select por su id
                let centrocostoSelect = document.getElementById("selectCentroCostoActualizar");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                centrocostoSelect.innerHTML = '<option value="">Seleccione</option>';

                // Recorrer las opciones de carrera y agregarlas al select
                data1.dataCentroCosto.forEach(centrocosto => {
                    let option = document.createElement("option");
                    option.text = centrocosto.nCodCentroCostos + "-" + centrocosto.sDescripcionCentroCostos;  // Texto que se muestra en el combo
                    option.value = centrocosto.nIdRegistro;     // Valor de la opción
                    centrocostoSelect.add(option);     // Añadir la opción al select
                });

                // Obtener el select por su id
                let cursoSelect = document.getElementById("selectCodigoCursoActualizar");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                cursoSelect.innerHTML = '<option value="">Seleccione</option>';

                // Recorrer las opciones de programa y agregarlas al select
                data1.dataCurso.forEach(curso => {
                    let option2 = document.createElement("option");
                    option2.text = curso.sIdCurso + "-" + curso.sDesCurso;  // Texto que se muestra en el combo
                    option2.value = curso.sIdCurso;     // Valor de la opción
                    cursoSelect.add(option2);     // Añadir la opción al select
                });

                // Obtener el select por su id
                let conceptoCursoImporteSelect = document.getElementById("selectConceptoCursoImporteActualizar");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                conceptoCursoImporteSelect.innerHTML = '<option value="">Seleccione</option>';

                // Recorrer las opciones de carrera y agregarlas al select
                data1.dataConceptoCodigoImporte.forEach(conceptocodigoImporte => {
                    let option = document.createElement("option");
                    option.text = conceptocodigoImporte.codigo + "-" + conceptocodigoImporte.nombre_boleta;  // Texto que se muestra en el combo
                    option.value = conceptocodigoImporte.id;     // Valor de la opción
                    conceptoCursoImporteSelect.add(option);     // Añadir la opción al select
                });

                // Obtener el select por su id
                let conceptoCursoHorasSelect = document.getElementById("selectConceptoCursoHorasActualizar");

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                conceptoCursoHorasSelect.innerHTML = '<option value="">Seleccione</option>';

                // Recorrer las opciones de carrera y agregarlas al select
                data1.dataConceptoCodigoHoras.forEach(conceptocodigoHoras => {
                    let option = document.createElement("option");
                    option.text = conceptocodigoHoras.codigo + "-" + conceptocodigoHoras.nombre_boleta;  // Texto que se muestra en el combo
                    option.value = conceptocodigoHoras.id;     // Valor de la opción
                    conceptoCursoHorasSelect.add(option);     // Añadir la opción al select
                });

                console.log(data1.data);

                $('#inputid_tarifa_centro_costo').val(data1.data.id_tarifa_centro_costo)
                $('#selectOrganizacionActualizar').val(data1.data.organizacion);
                $('#selectAnioActualizar').val(data1.data.anio);
                $('#selectPeriodoActualizar').val(data1.data.periodo);
                $('#selectProgramaActualizar').val(data1.data.code_curriculum);
                $('#selectCodigoCursoActualizar').val(data1.data.event_id);
                $('#selectCentroCostoActualizar').val(data1.data.id_registro_centro_costo);
                $('#selectEstadoActualizar').val(data1.data.estado ? 1 : 0);
                $('#selectConceptoCursoImporteActualizar').val(data1.data.id_conceptoImporte);
                $('#selectConceptoCursoHorasActualizar').val(data1.data.id_conceptoHoras);


                if (data1.data.organizacion == "ESC") {
                    $('#divCodigoCursoActualizar').hide();
                    $('#tipoSesionPagoAct').show();
                    var esSincrono = false;
                    var esAsincrono = false;
                    if (data1.data.tipo_sesion_pago == 'Ambos') {
                        esSincrono = true;
                        esAsincrono = true;
                    } else if (data1.data.tipo_sesion_pago == 'Sin') {
                        esSincrono = true;
                        esAsincrono = false;
                    } else {
                        esSincrono = false;
                        esAsincrono = true;
                    }

                    $('#switchSincronoAct').prop('checked', esSincrono);
                    $('#switchAsincronoAct').prop('checked', esAsincrono);
                    $('#labelSwitchSincronoAct').text(esSincrono ? 'Sí' : 'No');
                    $('#labelSwitchAsincronoAct').text(esAsincrono ? 'Sí' : 'No');
                } else {
                    $('#divCodigoCursoActualizar').show();
                    $('#tipoSesionPagoAct').hide();
                }


                $('#modalEditarTarifa').modal('show'); // Usando jQuery




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

function MostrarOrganizacionActualizar() {

    let idOrganizacion = $('#selectOrganizacionActualizar').val();

    $('#selectAnioActualizar').val("");
    $('#selectPeriodoActualizar').val("");
    $('#selectEstadoActualizar').val("");

    // Obtener el select por su id
    let programaSelect = document.getElementById("selectProgramaActualizar");

    // Limpiar todas las opciones del select (excepto la opción por defecto)
    programaSelect.innerHTML = '<option value="">Seleccione</option>';


    // Obtener el select por su id
    let centrocostoSelect = document.getElementById("selectCentroCostoActualizar");

    // Limpiar todas las opciones del select (excepto la opción por defecto)
    centrocostoSelect.innerHTML = '<option value="">Seleccione</option>';


    // Obtener el select por su id
    let cursoSelect = document.getElementById("selectCodigoCursoActualizar");

    // Limpiar todas las opciones del select (excepto la opción por defecto)
    cursoSelect.innerHTML = '<option value="">Seleccione</option>';

    if (idOrganizacion == "ESC") {
        $('#divCodigoCursoActualizar').hide();
    } else {
        $('#divCodigoCursoActualizar').show();
    }

    llenarComboSemestreActualizar(idOrganizacion);


}
function llenarComboSemestreActualizar(idOrganizacionSem) {


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
                let SemestreSelect = document.getElementById("selectPeriodoActualizar");
                /*                let SemestreSelectTarifa = document.getElementById("SemestreAgregarTarifa");*/

                // Limpiar todas las opciones del select (excepto la opción por defecto)
                SemestreSelect.innerHTML = '<option value="">Seleccione</option>';
                //SemestreSelectTarifa.innerHTML = '<option value="">Seleccione un semestre</option>';

                // Recorrer las opciones de nSemestreIns y agregarlas al select
                data1.data.forEach(semestre => {

                    console.log(semestre);

                    let option = document.createElement("option");
                    option.text = semestre.nSemestreIns;  // Texto que se muestra en el combo
                    option.value = semestre.nSemestreIns;     // Valor de la opción
                    SemestreSelect.add(option);     // Añadir la opción al select
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

function LlenarComboActualizar(identificador) {

    let idOrganizacion = $('#selectOrganizacionActualizar').val();
    let idAnio = $('#selectAnioActualizar').val();
    let idSemestre = $('#selectPeriodoActualizar').val();
    let idPrograma = $('#selectProgramaActualizar').val();


    var formData = new FormData();
    formData.append('organizacion', idOrganizacion);
    formData.append('anio', idAnio);
    formData.append('periodo', idSemestre);
    formData.append('programa', idPrograma);


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
                    let programaSelect = document.getElementById("selectProgramaActualizar");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    programaSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataPrograma.forEach(programa => {
                        let option = document.createElement("option");
                        option.text = programa.sIdCarrera + "-" + programa.sDesCarrera;  // Texto que se muestra en el combo
                        option.value = programa.sIdCarrera;     // Valor de la opción
                        programaSelect.add(option);     // Añadir la opción al select
                    });

                    // Obtener el select por su id
                    let centrocostoSelect = document.getElementById("selectCentroCostoActualizar");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    centrocostoSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de carrera y agregarlas al select
                    data1.dataCentroCosto.forEach(centrocosto => {
                        let option = document.createElement("option");
                        option.text = centrocosto.nCodCentroCostos + "-" + centrocosto.sDescripcionCentroCostos;  // Texto que se muestra en el combo
                        option.value = centrocosto.nIdRegistro;     // Valor de la opción
                        centrocostoSelect.add(option);     // Añadir la opción al select
                    });

                } else {

                    // Obtener el select por su id
                    let cursoSelect = document.getElementById("selectCodigoCursoActualizar");

                    // Limpiar todas las opciones del select (excepto la opción por defecto)
                    cursoSelect.innerHTML = '<option value="">Seleccione</option>';

                    // Recorrer las opciones de programa y agregarlas al select
                    data1.dataCurso.forEach(curso => {
                        let option2 = document.createElement("option");
                        option2.text = curso.sIdCurso + "-" + curso.sDesCurso;  // Texto que se muestra en el combo
                        option2.value = curso.sIdCurso;     // Valor de la opción
                        cursoSelect.add(option2);     // Añadir la opción al select
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

//function DesactivarTarifa(nIdRegistro) {


//    let codigoDocente =  $('#codigoDocenteConsultarTarifa').val();

//    var formData = new FormData();
//    formData.append('codigoDocente', codigoDocente);
//    formData.append('nIdRegistro', nIdRegistro);

//    $.ajax({
//        url: $('#inputDesactivarTarifaDocente').val(),
//        type: "POST",
//        data: formData,
//        processData: false,
//        contentType: false,
//        success: function (data1) {

//            if (data1.success) {

//                // Limpia el contenido de tbody para evitar filas residuales
//                $('#idTablaTarifarioDocente tbody').empty();

//                // Destruye la tabla si ya está inicializada
//                if ($.fn.DataTable.isDataTable('#idTablaTarifarioDocente')) {
//                    $('#idTablaTarifarioDocente').DataTable().destroy();
//                }


//                $('#idTablaTarifarioDocente').DataTable({
//                    "paging": true,
//                    "lengthChange": true,
//                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
//                    "searching": true,
//                    "ordering": true,
//                    "info": true,
//                    "autoWidth": false,
//                    //"responsive": true,
//                    "language": {
//                        url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
//                        searchPlaceholder: "Buscar"
//                    },
//                    "initComplete": function (settings, json) {
//                        // Cambiar el texto de "Buscar:" en el label
//                        $('.dataTables_filter label').contents().filter(function () {
//                            return this.nodeType === 3;  // Filtra los nodos de texto
//                        }).first().replaceWith('');  // Reemplaza con el nuevo texto
//                    },
//                    data: data1.data,
//                    columns: [
//                        {
//                            // Agregamos una columna para los botones
//                            data: null,
//                            render: function (data, type, row) {
//                                return `
//                                    <input type="number" class="form-control" value="${row.nTarifa}" id="HoraTarifaActualizar${row.nIdRegistro}">
//                                `;
//                            },
//                            orderable: false // Desactivar ordenación en esta columna
//                        },
//                        /*          { 'data': 'nTarifa' },*/
//                        { 'data': 'sDescripcionCentroCostos' },
//                        { 'data': 'nAnio' },
//                        { 'data': 'nSemestreIns' },
//                        { 'data': 'sPrograma' },
//                        {
//                            // Agregamos una columna para los botones
//                            data: null,
//                            render: function (data, type, row) {
//                                return `
//                                    <button class="btn btn-primary" onclick="EditarTarifa('${row.nIdRegistro}','${row.sDescripcionCentroCostos}','${row.nAnio}','${row.nSemestreIns}')" >Editar</button>
//                                `;
//                            },
//                            orderable: false // Desactivar ordenación en esta columna
//                        },
//                        {
//                            // Agregamos una columna para los botones
//                            data: null,
//                            render: function (data, type, row) {
//                                return `
//                                    <button class="btn btn-primary" onclick="DesactivarTarifa('${row.nIdRegistro}')" >Eliminar</button>
//                                `;
//                            },
//                            orderable: false // Desactivar ordenación en esta columna
//                        }
//                    ],

//                });

//            } else {

//                Swal.fire({
//                    title: "Error",
//                    text: data1.mensaje,
//                    icon: "error",
//                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
//                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
//                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
//                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
//                    didRender: function () {
//                        // Agregar evento de clic al botón de recarga
//                        document.getElementById('reloadButton').addEventListener('click', function () {
//                            location.reload(true); // Recarga la página
//                        });
//                    }
//                });


//            }


//        },
//        error: function (error) {

//            Swal.fire({
//                title: "Error",
//                text: error,
//                icon: "error"
//            });
//        }

//    });


//}


//function EditarTarifa(nIdRegistro, descripcionCentroCosto, anio, semestre) {


//    let codigoDocente = $('#codigoDocenteConsultarTarifa').val();
//    let nuevaTarifa = $('#HoraTarifaActualizar' + nIdRegistro).val();


//    var formData = new FormData();
//    formData.append('codigoDocente', codigoDocente);
//    formData.append('nuevaTarifa', nuevaTarifa);
//    formData.append('centroCosto', descripcionCentroCosto);
//    formData.append('anio', anio);
//    formData.append('semestre', semestre);


//    $.ajax({
//        url: $('#inputEditarTarifaDocente').val(),
//        type: "POST",
//        data: formData,
//        processData: false,
//        contentType: false,
//        success: function (data1) {

//            if (data1.success) {

//                // Limpia el contenido de tbody para evitar filas residuales
//                $('#idTablaTarifarioDocente tbody').empty();

//                // Destruye la tabla si ya está inicializada
//                if ($.fn.DataTable.isDataTable('#idTablaTarifarioDocente')) {
//                    $('#idTablaTarifarioDocente').DataTable().destroy();
//                }


//                $('#idTablaTarifarioDocente').DataTable({
//                    "paging": true,
//                    "lengthChange": true,
//                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
//                    "searching": true,
//                    "ordering": true,
//                    "info": true,
//                    "autoWidth": false,
//                    //"responsive": true,
//                    "language": {
//                        url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
//                        searchPlaceholder: "Buscar"
//                    },
//                    "initComplete": function (settings, json) {
//                        // Cambiar el texto de "Buscar:" en el label
//                        $('.dataTables_filter label').contents().filter(function () {
//                            return this.nodeType === 3;  // Filtra los nodos de texto
//                        }).first().replaceWith('');  // Reemplaza con el nuevo texto
//                    },
//                    data: data1.data,
//                    columns: [
//                        {
//                            // Agregamos una columna para los botones
//                            data: null,
//                            render: function (data, type, row) {
//                                return `
//                                    <input type="number" class="form-control" value="${row.nTarifa}" id="HoraTarifaActualizar${row.nIdRegistro}">
//                                `;
//                            },
//                            orderable: false // Desactivar ordenación en esta columna
//                        },
//                        /*          { 'data': 'nTarifa' },*/
//                        { 'data': 'sDescripcionCentroCostos' },
//                        { 'data': 'nAnio' },
//                        { 'data': 'nSemestreIns' },
//                        { 'data': 'sPrograma' },
//                        {
//                            // Agregamos una columna para los botones
//                            data: null,
//                            render: function (data, type, row) {
//                                return `
//                                    <button class="btn btn-primary" onclick="EditarTarifa('${row.nIdRegistro}')" >Editar</button>
//                                `;
//                            },
//                            orderable: false // Desactivar ordenación en esta columna
//                        },
//                        {
//                            // Agregamos una columna para los botones
//                            data: null,
//                            render: function (data, type, row) {
//                                return `
//                                    <button class="btn btn-primary" onclick="DesactivarTarifa('${row.nIdRegistro}')" >Eliminar</button>
//                                `;
//                            },
//                            orderable: false // Desactivar ordenación en esta columna
//                        }
//                    ],

//                });

//            } else {

//                Swal.fire({
//                    title: "Error",
//                    text: data1.mensaje,
//                    icon: "error",
//                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
//                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
//                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
//                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
//                    didRender: function () {
//                        // Agregar evento de clic al botón de recarga
//                        document.getElementById('reloadButton').addEventListener('click', function () {
//                            location.reload(true); // Recarga la página
//                        });
//                    }
//                });


//            }


//        },
//        error: function (error) {

//            Swal.fire({
//                title: "Error",
//                text: error,
//                icon: "error"
//            });
//        }

//    });


//}


//function VerDocentes(idCurso) {

//    //$('#idConsultarNombreDocente').text(nombreDocente);

//    //$('#codigoDocenteConsultarTarifa').val(codigoDocente);
//    //$('#nombreDocenteConsultarTarifa').val(nombreDocente);


//    var formData = new FormData();
//    formData.append('programa', idCurso);


//    $.ajax({
//        url: $('#inputVerDocente').val(),
//        type: "POST",
//        data: formData,
//        processData: false,
//        contentType: false,
//        success: function (data1) {

//            if (data1.success) {

//                // Limpia el contenido de tbody para evitar filas residuales
//                $('#idTablaDocente tbody').empty();

//                // Destruye la tabla si ya está inicializada
//                if ($.fn.DataTable.isDataTable('#idTablaDocente')) {
//                    $('#idTablaDocente').DataTable().destroy();
//                }


//                $('#idTablaDocente').DataTable({
//                    "paging": true,
//                    "lengthChange": true,
//                    "lengthMenu": [[10, 100, 150, -1], [10, 100, 150, "All"]],
//                    "searching": true,
//                    "ordering": true,
//                    "info": true,
//                    "autoWidth": false,
//                    //"responsive": true,
//                    "language": {
//                        url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
//                        searchPlaceholder: "Buscar"
//                    },
//                    "initComplete": function (settings, json) {
//                        // Cambiar el texto de "Buscar:" en el label
//                        $('.dataTables_filter label').contents().filter(function () {
//                            return this.nodeType === 3;  // Filtra los nodos de texto
//                        }).first().replaceWith('');  // Reemplaza con el nuevo texto
//                    },
//                    data: data1.data,
//                    columns: [
                        
//                        { 'data': 'sCodigoDocente' },
//                        { 'data': 'sNombreDocente' }
                        
//                    ],

//                });



//            } else {

//                Swal.fire({
//                    title: "Error",
//                    text: data1.mensaje,
//                    icon: "error",
//                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
//                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
//                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
//                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
//                    didRender: function () {
//                        // Agregar evento de clic al botón de recarga
//                        document.getElementById('reloadButton').addEventListener('click', function () {
//                            location.reload(true); // Recarga la página
//                        });
//                    }
//                });


//            }


//        },
//        error: function (error) {

//            Swal.fire({
//                title: "Error",
//                text: error,
//                icon: "error"
//            });
//        }

//    });

//}

//function mostrarSegundaTarifa() {
//    // Selecciona el div de la segunda tarifa
//    const segundaTarifaDiv = document.getElementById("idSegundaHora");

//    // Cambia entre 'none' y 'block'
//    if (segundaTarifaDiv.style.display === "none") {
//        segundaTarifaDiv.style.display = "block";
//    } else {
//        segundaTarifaDiv.style.display = "none";
//    }
//}

//function ModalTarifaGL(codigoPrograma) {

//    $('#codigoProgramaAgregarTarifaGL').val(codigoPrograma);

//}

//function AsignarCentroCostoGL() {

//    let anio = $('#AnioAgregarTarifaGL').val();
//    let semestre = $('#SemestreAgregarTarifaGL').val();
//    let programa = $('#codigoProgramaAgregarTarifaGL').val();
//    let centroCosto = $('#CentroCostoAgregarTarifaGL').val();
//    let centroCostoDesc = $('#CentroCostoAgregarTarifaGL option:selected').text();
//    let nTarifa1 = $('#HoraAgregarTarifaGL').val();
//    let nTarifa2 = $('#segundaHoraAgregarTarifaGL').val();
   

//    let AsignarCentroCostoGL = {
//        nPrograma: programa,
//        mesNuevo: semestre,
//        nTarifa: nTarifa1,
//        nTarifa2: nTarifa2,
//        nCodCentroCostos: centroCosto,
//        sDescripcionCentroCostos: centroCostoDesc,
//        nAnio: anio,
//        nSemestreIns: ""
//    };


//    $.ajax({
//        url: $('#inputAsignarTarifaGL').val(),
//        type: "POST",
//        contentType: "application/json",
//        data: JSON.stringify(AsignarCentroCostoGL),
//        success: function (data1) {

//            $('#modalAgregarTarifaGL').modal('hide'); // Usando jQuery

//            if (data1.success) {

//                Swal.fire({
//                    title: "Registro Exitoso!!",
//                    text: data1.mensaje,
//                    icon: "success",
//                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
//                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
//                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
//                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
//                    didRender: function () {
//                        // Agregar evento de clic al botón de recarga
//                        document.getElementById('reloadButton').addEventListener('click', function () {

//                            $('#codigoProgramaAgregarTarifaGL').val('');
//                            $('#HoraAgregarTarifaGL').val('');
//                            $('#segundaHoraAgregarTarifaGL').val('');
//                            $('#AnioAgregarTarifaGL').val('');
//                            $('#SemestreAgregarTarifaGL').val('');
//                            $('#CentroCostoAgregarTarifaGL').val('');
                           

//                            Swal.close();
//                            consultarCostos();



//                        });
//                    }
//                });

//            } else {

//                Swal.fire({
//                    title: "Error",
//                    text: data1.mensaje,
//                    icon: "error",
//                    showConfirmButton: false, // Oculta el botón de confirmación predeterminado
//                    allowOutsideClick: false, // Evita que se cierre al hacer clic fuera del cuadro
//                    allowEscapeKey: false, // Evita que se cierre con la tecla Escape
//                    footer: '<button type="button" id="reloadButton" class="swal2-confirm swal2-styled">Cerrar</button>',
//                    didRender: function () {
//                        // Agregar evento de clic al botón de recarga
//                        document.getElementById('reloadButton').addEventListener('click', function () {
//                            location.reload(true); // Recarga la página
//                        });
//                    }
//                });


//            }


//        },
//        error: function (error) {

//            Swal.fire({
//                title: "Error",
//                text: error,
//                icon: "error"
//            });
//        }

//    });


//}