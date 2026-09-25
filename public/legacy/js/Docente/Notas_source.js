//codigo orientado a auxiliar la logica previa de secciones estandar
//con la de secciones fusionadas ;v
//se obtendrá el origen de la informacion aqui, bajo una nueva perspectiva
const tokenResponseSF = 'tknResponse_SF';
const notas_table = "#lstNotas";

//funciones de envio de EC
function sendNotasSF() {
    try {
        let isTableResponsiveHidden = $('.table-responsive-docente').css('display') === 'none';

        let inputmap = 'nota';
        if (isTableResponsiveHidden) {
            var existeNotaVacia = existeInputVacioCards(inputmap, "notas", notas_table);

            if (existeNotaVacia) {
                alerta_center("warning", "Notas faltantes", "Por favor ingrese todas las notas correspondientes.")
                return;
            }
            //recupero la informacion seteandolo en un sessionStorage;
            var request = getJsonChangesCards();
        } else {
            var existeNotaVacia = existeInputVacio(inputmap, "notas", notas_table);

            if (existeNotaVacia) {
                alerta_center("warning", "Notas faltantes", "Por favor ingrese todas las notas correspondientes.")
                return;
            }
            //recupero la informacion seteandolo en un sessionStorage;
            var request = getJsonChangesSF();
        }

        var fechaLimite = $('#txtLimite').html(); //Fecha Limite By Pavo28
        var frmdt = new FormData();
        frmdt.append("notas", request);
        frmdt.append("fechaLimite", fechaLimite);


        $.ajax({
            url: rq_carga_notas,
            type: 'POST',
            data: frmdt,
            contentType: false,
            processData: false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status =response.success;

                if (status) {
                    alerta_center(response.swal, "Éxito", response.mensaje);
                    //reconstruyo los botones
                    construirButtonsEC();
                }
                else {
                    //alerta_center(response.swal, 'Advertencia', response.mensaje);

                    //valido que  response.codigosError contenga mas de un elemento
                    var errores = response.codigosError;
                    //console.log(errores)
                    var mensaje = "";
                    if (errores.length > 0) {
                        mensaje = `<h5><strong>${response.mensaje}</strong></h5>`;
                        errores.forEach(function (item) {
                            mensaje += `<p>Estudiante: ${item.personId} - Nota: ${item.grade}</p>`
                        })
                    }
                    else {
                        mensaje = response.mensaje;
                    }

                    api_result_alert(response.swal, "Advertencia", mensaje);

                }
            },
            error: function (error) {
                alerta_center("error", "Error", "Ocurrió un error al registrar las notas: " + error.responseText);
                console.error("Error al registrar las notas:", error);
            },
            complete: function () {
                hideModalLoader();
                var record_number = $('#record_number');
                searchAssistants(record_number.val());

                
            }
        })
    }
    catch (error) {
        hideModalLoader();
        console.error(error.responseText);
        alerta_center("error", "Excepción encontrada", "Ocurrió una excepción al recopilar la información de notas: " + error.message);

    }
}

function getJsonChangesSF() {
    var table = $(notas_table).DataTable();
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        var notaInput = $('input', this.node()).val();
        data.nota = notaInput;
        this.data(data)
    });

    var updateData = table.rows().data().toArray();

    var jsonData = JSON.stringify(updateData);

    console.log("jsonData:" + jsonData);

    return jsonData;
}
function getJsonChangesCards() {
    // Array para almacenar los datos de cada tarjeta
    var cardDataArray = [];

    // Iterar sobre cada tarjeta dentro del contenedor especificado
    $("#marcacionesCard").find('.mobile-card').each(function () {
        // Extraer datos básicos de cada tarjeta
        var fullName = $(this).find('.fullName').text();
        var peopleCodeId = $(this).data('people-code-id');
        var personId = $(this).find('input[name="personId"]').val();
        var recordNumber = $(this).find('input[name="recordNumber"]').val();
        // Obtener el valor de la nota ingresada
        var notaValue = $(this).find('input[name="nota"]').val();

        // Obtener detalles adicionales de la tarjeta
        var detailsGrading = JSON.parse($(this).attr('data-details-grading'));
        var revisionDate = $(this).find('.revision_date').text();

        // Construir el objeto de la tarjeta con los valores extraídos
        cardDataArray.push({
            fullName: fullName,
            people_code_id: peopleCodeId,
            nota: notaValue,
            detailsGrading: detailsGrading,
            revision_date: revisionDate,
            personId: personId,
            record_number: recordNumber
        });
    });

    //console.log(cardDataArray);
    // Convertir el array a JSON
    var jsonData = JSON.stringify(cardDataArray);
    //console.log(jsonData);
    return jsonData;
}


//promedios finales
function sendPromediosSF() {
    try {
        let isTableResponsiveHidden = $('.table-responsive').css('display') === 'none';

        // Verificar si la tabla está oculta para decidir la fuente de los datos
        let body;
        if (isTableResponsiveHidden) {
            // Obtener datos de los cards cuando la tabla está oculta
            body = getNotasCardsRequest('#contentCards-notasFinales');

            let existeNotaVaciaCards = existeInputVacioCards("nota", "#contentCards-notasFinales");

            if (existeNotaVaciaCards) {
                alerta_center("warning", "Notas faltantes", "Por favor ingrese todos los promedios correspondientes.");
                return;
            }
        } else {
            // Obtener datos de la tabla generada
            body = getNotasFinalesRequest();

            let inputmap = 'promedio_bd';
            var existeNotaVacia = existeInputVacio(inputmap, "pf", notas_table);

            if (existeNotaVacia) {
                alerta_center("warning", "Notas faltantes", "Por favor ingrese todos los promedios correspondientes.")
                return;
            }
        }

        // Obtener la fecha de vencimiento
        var vencimiento = $('#txtLimite_Fecha').html();
        //console.log(JSON.stringify(body));



        // Configuración del formulario de solicitud
        var rq = new FormData();
        rq.append("request", JSON.stringify(body));
        rq.append("due_Date", vencimiento);

        $.ajax({
            url: rq_carga_notas_finales,
            type: 'POST',
            data: rq,
            contentType: false,
            processData: false,
            beforeSend: function () {
                showModalLoader();
            },
            success: function (response) {
                let status = response.success;

                if (status) {
                    sendEC_prom(); // Realizo nuevamente la consulta para visualizar los cambios
                    alerta_center(response.swal, "Exito", response.mensaje);
                } else {
                    // Validar que response.codigosError contenga más de un elemento
                    var errores = response.codigosError;
                    //console.log(errores);
                    var mensaje = "";
                    if (errores.length > 0) {
                        mensaje = `<h5><strong>${response.mensaje}</strong></h5>`;
                        errores.forEach(function (item) {
                            mensaje += `<p>Estudiante: ${item.people_code_id} - Promedio: ${item.grade}</p>`;
                        });
                    } else {
                        mensaje = response.mensaje;
                    }

                    api_result_alert(response.swal, "Advertencia", mensaje);
                }
            },
            error: function (error) {
                alerta_center("error", "Error",
                    `Ocurrió un error al registrar las notas: ${error.responseText}`);
                console.error("Error en el registro de notas: " + error);
            },
            complete: function () {
                hideModalLoader();
            }
        });

    } catch (error) {
        hideModalLoader();
        alerta_center("error", "Excepción encontrada", `No se ha podido registrar los promedios: ${error}`);
    }
}

// Función para obtener los datos desde los cards
function getNotasCardsRequest(contentContainer) {
    let data = [];
    $(`${contentContainer} .mobile-card`).each(function () {
        let peopleCodeId = $(this).data('people-code-id');
        let detailsGrading = $(this).data('details-grading');
        let notaIngresada = $(this).find('.nota').val();

        // Crear objeto de datos para cada tarjeta
        let itemData = {
            people_code_id: peopleCodeId,
            promedios: {
                promedio_ingresado: notaIngresada
            },
            detailsGrading: detailsGrading
        };

        data.push(itemData);
    });

    return JSON.stringify(data);
}

function getNotasFinalesRequest() {
    var table = $(notas_table).DataTable();
    table.rows().every(function (rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        var notaInput = $('input', this.node()).val();
        data.promedios.promedio_ingresado = notaInput;
        this.data(data)
    });

    var updateData = table.rows().data().toArray();
    var jsonData = JSON.stringify(updateData);

    return jsonData;
}

