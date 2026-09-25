
function listarCentrosCostos() {
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
    let target = '#lstCentrosCostosRRHH';
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
        //"order": [[5, "asc"]],
        //"order": [[5, "asc"]],
        data: response,

        columns: [
            { 'data': 'sIdCentroCosto' },
            { 'data': 'nCodCentroCostos' },
            { 'data': 'sDescripcionCentroCostos' },
            { 'data': 'sTipoCentroCostos' },
            {
                data: 'bEstadoCentroCostos',
                render: function (data, type, row) {
                    return data ? 'ACTIVO' : 'INACTIVO';
                }
            },
            {
                'data': null,
                'render': function (data, type, row) {
                    return `
                        <button class="btn btn-sm btn-primary" onclick="traerDatosCentroCosto('${row.nIdRegistro}')">Editar</button>
                      `;
                },
            }

        ]
    });
}
function registroCentroCostos() {
    try {
        let organizacion = $("#SlcOrganizacion").val();
        let internoCentroCosto = $("#idintcentrocosto").val();
        let codigoCentroCosto = $("#idcodigocentrocosto").val();
        let descCentroCosto = $("#iddesccentrocosto").val();
       

        if (organizacion.trim() === '' || organizacion === undefined) {
            alerta_center("warning", "Datos insuficientes", "La organización es requerido");
            return;
        }
        else if (internoCentroCosto.trim() === '' || internoCentroCosto === undefined) {
            alerta_center("warning", "Datos insuficientes", "El código interno es requerido")
            return;
        }
        else if (codigoCentroCosto.trim() === '' || codigoCentroCosto === undefined) {
            alerta_center("warning", "Datos insuficientes", "El código es requerido")
            return;
        }
        else if (descCentroCosto.trim() === '' || descCentroCosto === undefined) {
            alerta_center("warning", "Datos insuficientes", "La descripción es requerido")
            return;
        }
        else {
            var formDataJ = new FormData();
            formDataJ.append("organizacion", organizacion);
            formDataJ.append("internoCentroCosto", internoCentroCosto);
            formDataJ.append("codigoCentroCosto", codigoCentroCosto);
            formDataJ.append("descCentroCosto", descCentroCosto);
            
            $.ajax({
                url: registrarCentroCostos,
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
                        listarCentrosCostos();

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

function traerDatosCentroCosto(idCentroCosto) {


    //alerta_center('error','error','error')
    try {
        $.ajax({
            url: datosCentroCostos,
            type: 'GET',
            data: { idCentroCosto: idCentroCosto },
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {

                let status = response.success;
                if (status) {
                    var requestJson = response.data;

                    $("#idnIdRegistroActualizar").val(idCentroCosto);
                    $("#idOrganizacionActualizar").val(requestJson.sTipoCentroCostos);
                    $("#idCodigoInternoActualizar").val(requestJson.sIdCentroCosto);
                    $("#idCodigoCentroCostoActualizar").val(requestJson.nCodCentroCostos);
                    $("#idDescCentroCostoActualizar").val(requestJson.sDescripcionCentroCostos);
                    $("#idEstadoActualizar").val(requestJson.bEstadoCentroCostos ? "1" : "0");
              

                    $('#modalActualizarCentroCosto').modal('show');


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


function editarCentroCostos() {
    try {

        let idnIdRegistroActualizar = $("#idnIdRegistroActualizar").val();
        let organizacion = $("#idOrganizacionActualizar").val();
        let internoCentroCosto = $("#idCodigoInternoActualizar").val();
        let codigoCentroCosto = $("#idCodigoCentroCostoActualizar").val();
        let descCentroCosto = $("#idDescCentroCostoActualizar").val();
        let estadoActualizar = $("#idEstadoActualizar").val();


        if (idnIdRegistroActualizar.trim() === '' || idnIdRegistroActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El id es requerido");
            return;
        }
        else if (estadoActualizar.trim() === '' || estadoActualizar === undefined) {
            alerta_center("warning", "Datos insuficientes", "El estado es requerido");
            return;
        }
        else if (organizacion.trim() === '' || organizacion === undefined) {
            alerta_center("warning", "Datos insuficientes", "La organización es requerido");
            return;
        }
        else if (internoCentroCosto.trim() === '' || internoCentroCosto === undefined) {
            alerta_center("warning", "Datos insuficientes", "El código interno es requerido")
            return;
        }
        else if (codigoCentroCosto.trim() === '' || codigoCentroCosto === undefined) {
            alerta_center("warning", "Datos insuficientes", "El código es requerido")
            return;
        }
        else if (descCentroCosto.trim() === '' || descCentroCosto === undefined) {
            alerta_center("warning", "Datos insuficientes", "La descripción es requerido")
            return;
        }
        else {
            var formDataJ = new FormData();
            formDataJ.append("idnIdRegistroActualizar", idnIdRegistroActualizar);
            formDataJ.append("organizacion", organizacion);
            formDataJ.append("internoCentroCosto", internoCentroCosto);
            formDataJ.append("codigoCentroCosto", codigoCentroCosto);
            formDataJ.append("descCentroCosto", descCentroCosto);
            formDataJ.append("estadoActualizar", estadoActualizar);

            $.ajax({
                url: actualizarCentroCostos,
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
                        listarCentrosCostos();

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