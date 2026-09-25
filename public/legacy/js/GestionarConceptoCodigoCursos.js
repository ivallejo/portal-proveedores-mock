
function listarConceptoCodigos() {
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
                    var requestJson = response.data;

                    construirTable(response.data)

                }


                else {
                    alerta_center(response.swal, "Advertencia", response.mensaje)
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
        console.error("Error en b�squeda --> " + error.message);

        alerta_center("error", "Excepci�n encontrada", "Ocurrió un error inesperado al cargar las sesiones justificables.");
    }
}

function construirTable(response) {

    console.log(response);

    let target = '#idTablaConcepto';
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
            url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
            searchPlaceholder: "Buscar"
        },
        "initComplete": function (settings, json) {
            // Cambiar el texto de "Buscar:" en el label
            $('.dataTables_filter label').contents().filter(function () {
                return this.nodeType === 3;  // Filtra los nodos de texto
            }).first().replaceWith('');  // Reemplaza con el nuevo texto
        },
        data: response,

        columns: [
            { 'data': 'codigo' },
            { 'data': 'nombre_largo' },
            { 'data': 'unidad_medida' },
            { 'data': 'nombre_boleta' },
            {
                data: 'estado',
                render: function (data, type, row) {
                    return data ? 'ACTIVO' : 'INACTIVO';
                }
            },
            {
                'data': null,
                'render': function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary" onclick="traerDatosConceptoCodigo('${row.id}')">Editar</button>
                      `;
                },
            }

        ]
    });
}

function registroConceptoCodigos() {
    try {
        let inputConcepto = document.getElementById('idFileConceptoCodigoCurso');

        let archivoConcepto = inputConcepto.files[0];

        if (!archivoConcepto) {
            alerta_center("warning", "Datos insuficientes", "El archivo es requerido");
            return;
        }
        else {
            var formDataJ = new FormData();
            formDataJ.append("archivoConcepto", archivoConcepto);
            
            $.ajax({
                url: registrarConceptoCodigoCurso,
                type: 'POST',
                data: formDataJ,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {

                    let status = response.success;
                    if (status) {


                        alerta_center_sin_timer(response.swal, "Éxito", response.mensaje);
                        listarConceptoCodigos();

                    }
                    else {
                        alerta_center_sin_timer(response.swal, "Advertencia", response.mensaje);

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
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepci�n encontrada", "Ocurrió un error inesperado al cargar la justificaci�n.");
    }
}

function registroConceptoCodigosIndividual() {

    try {

        let idCodigoRegistrar = $("#idCodigoRegistrar").val();
        let idNombreLargoRegistrar = $("#idNombreLargoRegistrar").val();
        let idUnidadMedidaRegistrar = $("#idUnidadMedidaRegistrar").val();
        let idNombreBoletaRegistrar = $("#idNombreBoletaRegistrar").val();
 
        if (idCodigoRegistrar.trim() === '' || idCodigoRegistrar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El codigo es requerido");
            return;
        }
        else if (idNombreLargoRegistrar.trim() === '' || idNombreLargoRegistrar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El nombre largo es requerido");
            return;
        }
        else if (idUnidadMedidaRegistrar.trim() === '' || idUnidadMedidaRegistrar === undefined) {
            alerta_center("warning", "Datos insuficientes", "La unidad de medida es requerido");
            return;
        }
        else if (idNombreBoletaRegistrar.trim() === '' || idNombreBoletaRegistrar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El nombre boleta es requerido")
            return;
        }
        else {

            var formDataJ = new FormData();
            formDataJ.append("id", 0);
            formDataJ.append("codigo", idCodigoRegistrar);
            formDataJ.append("nombre_largo", idNombreLargoRegistrar);
            formDataJ.append("unidad_medida", idUnidadMedidaRegistrar);
            formDataJ.append("nombre_boleta", idNombreBoletaRegistrar);
            formDataJ.append("estado", true);

            $.ajax({
                url: registrarConceptoCodigoCursoIndividual,
                type: 'POST',
                data: formDataJ,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {

                    let status = response.success;
                    if (status) {


                        alerta_center(response.swal, "Éxito", response.mensaje);
                        listarConceptoCodigos();;

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
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepci�n encontrada", "Ocurrió un error inesperado al cargar la justificaci�n.");
    }
}


function traerDatosConceptoCodigo(idConcepto) {


    //alerta_center('error','error','error')
    try {
        $.ajax({
            url: datosConceptoCodigo,
            type: 'GET',
            data: { idConcepto: idConcepto },
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {

                console.log(response);

                let status = response.success;
                if (status) {
                    var requestJson = response.data;

                    $("#idCodigoInternoActualizar").val(requestJson.id);
                    $("#idCodigoActualizar").val(requestJson.codigo);
                    $("#idNombreLargoActualizar").val(requestJson.nombre_largo);
                    $("#idUnidadMedidaActualizar").val(requestJson.unidad_medida);
                    $("#idNombreBoletaActualizar").val(requestJson.nombre_boleta);
                    $("#idEstadoActualizar").val(requestJson.estado ? "1" : "0");
              

                    $('#modalActualizarConceptoCodigo').modal('show');


                    console.log(requestJson);
                }
                else {
                    alerta_center(response.swal, "Advertencia", response.mensaje)
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
        console.error("Error en b�squeda --> " + error.message);

        alerta_center("error", "Excepci�n encontrada", "Ocurrió un error inesperado al cargar las sesiones justificables.");
    }


}


function actualizarConceptoCodigo() {
    try {

        let idCodigoInternoActualizar = $("#idCodigoInternoActualizar").val();
        let idCodigoActualizar = $("#idCodigoActualizar").val();
        let idNombreLargoActualizar = $("#idNombreLargoActualizar").val();
        let idUnidadMedidaActualizar = $("#idUnidadMedidaActualizar").val();
        let idNombreBoletaActualizar = $("#idNombreBoletaActualizar").val();
        let idEstadoActualizar = $("#idEstadoActualizar").val();


        if (idCodigoInternoActualizar.trim() === '' || idCodigoInternoActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El codigo interno es requerido");
            return;
        }
        else if (idCodigoActualizar.trim() === '' || idCodigoActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El codigo es requerido");
            return;
        }
        else if (idNombreLargoActualizar.trim() === '' || idNombreLargoActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El nombre largo es requerido");
            return;
        }
        else if (idUnidadMedidaActualizar.trim() === '' || idUnidadMedidaActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "La unidad de medida es requerido");
            return;
        }
        else if (idNombreBoletaActualizar.trim() === '' || idNombreBoletaActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El nombre boleta es requerido")
            return;
        }
        else if (idEstadoActualizar.trim() === '' || idEstadoActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El nombre boleta es requerido")
            return;
        }
        else {
            var formDataJ = new FormData();
            formDataJ.append("id", idCodigoInternoActualizar);
            formDataJ.append("codigo", idCodigoActualizar);
            formDataJ.append("nombre_largo", idNombreLargoActualizar);
            formDataJ.append("unidad_medida", idUnidadMedidaActualizar);
            formDataJ.append("nombre_boleta", idNombreBoletaActualizar);
            formDataJ.append("estado", idEstadoActualizar == 1 ? true : false);

            $.ajax({
                url: registrarConceptoCodigoCursoIndividual,
                type: 'POST',
                data: formDataJ,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {

                    let status = response.success;
                    if (status) {


                        $('#modalActualizarConceptoCodigo').modal('hide');

                        alerta_center(response.swal, "Éxito", response.mensaje);
                        listarConceptoCodigos();
                        

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
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepci�n encontrada", "Ocurrió un error inesperado al actualizar el concepto de codigo de curso");
    }
}