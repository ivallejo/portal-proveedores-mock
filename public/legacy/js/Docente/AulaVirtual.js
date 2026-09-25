function getRowDataByIdSesion(sIdSesion) {
    // Obtener todas las filas del DataTable
    var allData = $('#lstClasesVirtuales').DataTable().rows().data().toArray();

    // Filtrar las filas para encontrar la que tiene el sIdSesion especificado
    var filteredData = allData.filter(function (row) {
        return row.sIdSesion == sIdSesion;
    });

    // Convertir el resultado a JSON
    var jsonResult = JSON.stringify(filteredData);

    return jsonResult;

}

function filterVirtualClass() {
    try {
        var section = $('#cboSection').val();
        var startDate = $('#txtStartDate').val();
        var endDate = $('#txtEndDate').val();

        if (section === '-1') {
            alerta_center("warning", "Advertencia", "Por favor seleccione una sección.")
        }
        else {
            startDate = startDate === '' ? "" : transformDateFormat(startDate);
            endDate = endDate === '' ? "" : transformDateFormat(endDate);


            var formdaty = new FormData();
            formdaty.append("sSeccion", section);
            formdaty.append("sFechaInicio", startDate);
            formdaty.append("sFechaFinal", endDate);

            $.ajax({
                url: requestList,
                type: 'POST',
                data : formdaty,
                contentType: false,
                processData: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {
                    let status = response.success;

                    if (status) {
                        //alerta_center(response.swal, "", response.mensaje)
                        //console.log(response.jsonResult);

                        var data = JSON.parse(response.jsonResult);

                        drawTable(data);
                        migrateData(section, startDate, endDate);
                    }
                    else {
                        alerta_center(response.swal, "Advertencia", response.mensaje);
                    }
                },
                error: function (error) {
                    console.error("Error en la peticion  --> " + error.responseText);
                    alerta_center("error", "Error en la petición", "Ocurrió un error inesperado al cargar las sesiones.");

                }, complete: function () {
                    hideModalLoader();
                }
            })
        }
    }
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al cargar las sesiones: "+error.message);
    }
}


function drawTable(response) {
    //console.log(response);
    var target = "#lstClasesVirtuales";

    // Destruir cualquier instancia previa de DataTable en el elemento objetivo
    $(target).DataTable().clear().destroy();

    $(target).DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[10,50, 100, 150, -1], [10,50, 100, 150, "All"]],
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
        "order": [[1, "desc"]],
        data: response,
        columns: [
            { 'data': 'sIdSesion' }, 
            { 'data': 'sAnio' },

            { 'data': 'sSemestre' },
            { 'data': 'dFechaSesion'},
            { 'data': 'dHoraInicio' },

            { 'data': 'dHoraFin' },
            { 'data': 'sIdCurso' },
            { 'data': 'sDesCurso' },

            { 'data': 'sSeccion' },
            { 'data': 'sTema' },
            { 'data': 'Link' },

            { 'data': 'Validado'},
            {
                'data': 'sIdSesion', //button editar
                'render': function (data, type, row) {
                    if (type === 'display') {

                        /*
                        let buttonBegin = '<button class="btn btn-primary" onclick="updateSession(' + data + '); formContext(this,1)">Editar'
                        let iconBegin = '<i class="fa fa-pencil">';
                        let iconEnd = '</i>';
                        let buttonEnd = '</button>';


                        let buttonCancelBegin = '<button class="btn btn-warning" onclick="denyUpdate(' + data + '); formContext(this,0)">Cancelar';
                        let buttonCancelEnd = '</button>';

                        let buttonCommitBegin = '<button class="btn btn-success" onclick="confirmChanges(' + data + ')">Guardar';
                        let buttonCommitEnd = '</button>';

                        var buttonsCommit = "<div class='buttonsCommit'>" + `${buttonBegin} ${buttonEnd}` + "</div>";

                        var buttonsSendRefuse = "<div class='buttonsSendRefuse' hidden>" +
                            `${buttonCancelBegin} ${buttonCancelEnd}` +
                            `${buttonCommitBegin} ${buttonCommitEnd}` + "</div>";

                        var allbuttons = '<div class="buttonsContainer">' + buttonsCommit + buttonsSendRefuse + '</div>';

                        */
                        var action_button = '<button class="btn btn-primary" onclick="pass_data('+data+')" >Acciones'  +'</button>';
                        var mailButton = '<button class="btn btn-success m-1" onclick="sendMail('+data+')" >Mailing'+'</button>'

                        return action_button + mailButton;
                    }

                    return data;
                }
            },

        ]
    })
}
    
function sin_uso_formContext(context,number) {
    try {

        var divContextPattern = context.closest(".buttonsContainer");
        var contextShow = divContextPattern.querySelector(".buttonsSendRefuse");
        var contextHide = divContextPattern.querySelector(".buttonsCommit");

        var rowContext = context.closest(".odd"); //para obtener el contexto de 
        //var inputContext = rowContext.querySelector(".linkZoom")


        //number: 1 --> activate
        //number: 0 --> denny
        switch (number) {
            case 1:
                contextHide.setAttribute("hidden", true)
                contextShow.removeAttribute("hidden")

                //inputContext.focus();

                break;
            case 0:
                contextShow.setAttribute("hidden", true)
                contextHide.removeAttribute("hidden")

                //inputContext.blur();

                break;
            default:
                alerta_center("error","Advertencia", "Contexto de búsqueda inválido");
        }
    }
    catch (error) {
        console.error("Excepcion encontrada al establecer listeners." + error.message)
    }
}
function sin_uso_updateSession(data) {
    var response = JSON.parse(getRowDataByIdSesion(data));
    //console.log(response[0]);
}

function sin_uso_denyUpdate(data) {
    //console.log(data)
}

function pass_data(data) {
    var item = JSON.parse(getRowDataByIdSesion(data))[0];
    //console.log(item)

    //muestro el modal e imprimo los valores del json obtenido
    showModal();

    $('#sIdSesion').val(item.sIdSesion);

    //defino los valores obtenidos del json para setearlos en fx a un ternario pare evitar valores nulos
    var linkedClass = item.Link;
    var checking = item.Validado;

    linkedClass =(linkedClass === null || linkedClass === '') ? '' : linkedClass;
    checking =(linkedClass === null || linkedClass ==='') ? false : checking;

    //console.log(linkedClass, checking);

    $('#txtLink').val(linkedClass);
    $('#validate').prop("checked", checking)

    $('#txtLink').trigger('focus')
    $('#txtLink').select()

}

function migrateData(section, start_date, end_date) {
        //paso los datos a los inputs hidden para realizar una busqueda posterior a la actualizacion, asi la data es reactiva al hacer update;
    try {
        section = (section === null || section === undefined || section === '') ? '' : section;
        start_date = (start_date === null || start_date === undefined || start_date === '') ? '' : start_date;
        end_date = (end_date === null || end_date === undefined || end_date === '') ? '' : end_date;


        $('#modal_text-section').val(section)
        $('#modal_text-startDate').val(start_date)
        $('#modal_text-endDate').val(end_date)
    }
    catch (error) {
        alerta_center("error", "Excepción encontrada", ex.message);
    }
}

function intermedia_save() {
    try {
        hideModal();
        saveLink();
    }
    catch (error) {
        console.error("Error en la intermedia de guardado el link --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al actualizar el link: " + error.message);

    }
}

function saveLink() {
    try {
        let sesion = $('#sIdSesion').val();
        let link = $('#txtLink').val();

        if (link === '' || link === null) {
            alerta_center("question", "Campos faltantes", "Por favor ingrese un enlace válido.");
        }
        else {
            var formDatty = new FormData();
            formDatty.append("idSesion", sesion);
            formDatty.append("link", link);

            $.ajax({
                url: requestsaveLink,
                type: 'POST',
                data: formDatty,
                processData: false,
                contentType: false,
                beforeSend: function () {
                    showModalLoader();
                },
                success: function (response) {
                    let status = response.success;

                    if (status) {
                        alerta_center(response.swal, "Correcto", response.mensaje);

                        //seteo los inputs y realizo nuevamente la busqueda para refrescar la tabla con los campos
                        //aplicados
                        //setTimeout(function () {

                        //},1000)

                        $('#cboSection').val($('#modal_text-section').val());
                        $('#txtStartDate').val($('#modal_text-startDate').val());
                        $('#txtEndDate').val($('#modal_text-endDate').val());

                        filterVirtualClass();

                    }
                    else {
                        alerta_center(response.swal, "advertencia", response.mensaje);
                    }

                },
                error: function (error) {
                    console.error("Error en la peticion  --> " + error.message);
                    alerta_center("error", "Error en la petición", "Ocurrió un error inesperado al guardar el link.");

                }, complete: function () {
                    hideModalLoader();
                }
            })

        }
    }
    catch (error) {
        console.error("Error al guardar el link --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al guardar el link: " + error.message);
    }
}

function sendMail(data) {
    try {
        var requestElement = JSON.parse(getRowDataByIdSesion(data))[0];
        //console.log(JSON.stringify(requestElement))
        $.ajax({
            url: send_Mail,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestElement),
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status = response.success;
                if (status) {
                    alerta_center(response.swal, "Éxito", response.mensaje);
                }
                else {
                    alerta_center(response.swal, "advertencia", response.mensaje);
                }
            },
            error: function (error) {
                console.error("Error en la peticion  --> " + error.message);
                alerta_center("error", "Error en la petición", "Ocurrió un error inesperado al enviar correo.");
            }, complete: function () {
                hideModalLoader();
            }


        })
    }
    catch (error) {
        console.error("Error al cargar justificacion --> " + error.message);
        alerta_center("error", "Excepción encontrada", "Ocurrió un error inesperado al enviar el correo: " + error.message);
    }
}

function showModal() {
    $('#actions_modal').modal("show")
}

function hideModal() {
    $('#actions_modal').modal("hide")
}