
function listarSesionesAmpliacionNota() {
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
                    requestJson.sort((a, b) => {
                        return parseInt(a.idAmpNotas) - parseInt(b.idAmpNotas);
                    });

                    construirTableSesiones(response.data)

                    //SECCION PARA CONSTRUIR CARDS MOBILE
                    var currentPage = 1;
                    var totalPages = Math.ceil(requestJson.length / 10);
                    var maxVisibleButtons = 5; // N�mero m�ximo de botones visibles a la vez

                    // Mostrar la primera p�gina
                    displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-justificarAsitencia');

                    // Manejador de clic en la paginaci�n
                    $(document).on('click', '.pagination a', function (e) {
                        e.preventDefault();

                        if ($(this).hasClass('prev-page')) {
                            currentPage = Math.max(currentPage - 1, 1);
                        } else if ($(this).hasClass('next-page')) {
                            currentPage = Math.min(currentPage + 1, totalPages);
                        } else {
                            currentPage = $(this).data('page');
                        }
                        displayPage(currentPage, requestJson, maxVisibleButtons, totalPages, '#contentCards-justificarAsitencia');
                    });

                    //ok_alert("info", "�Informaci�n importante!", response.mensajeTolerancia)

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

function construirTableSesiones(response) {
    console.log(response)
    let target = '#lstAmpliacionNota';
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
        //columnDefs: [
        //    {
        //        targets: 0,    // �ndice de la columna que quieres ocultar (0 = primera columna)
        //        visible: false // Ocultar la columna
        //    }
        //],
        columns: [
            { 'data': 'organizacion' },
            //{ 'data': 'academic_year' },
            {
                // AQUÍ COMBINAMOS DOS VARIABLES
                'data': null,
                'render': function (data, type, row) {
                    return row.academic_year + ' - ' + row.academic_term;
                }
            },
            { 'data': 'academic_session' },
            { 'data': 'section' },
            { 'data': 'event_id' },
            { 'data': 'title_section_grading' },
           // { 'data': 'fecha_creacion' },
            {
                'data': 'fecha_creacion',
                'render': function (data, type, row) {
                    if (!data) return '';
                    var fecha = new Date(data);
                    return fecha.toLocaleString('es-PE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }).replace(',', ''); // Quito la coma que pone toLocaleString por defecto
                }
            },
            { 'data': 'estado_evaluacion' },
            //{ 'data': 'fecha_evaluacion' }
            {
                'data': 'fecha_evaluacion',
                'render': function (data, type, row) {
                    if (!data) return '';
                    var fecha = new Date(data);
                    return fecha.toLocaleString('es-PE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }).replace(',', '');
                }
            }


        ]
    });
}
function formatDateManual(isoDate) {
    let parts = isoDate.split("T")[0].split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
function construirCards(data, contentContainer) {
    // Limpiar el contenedor antes de agregar nuevas tarjetas
    $(contentContainer).html('');
    if (data.length === 0) {
        // Mostrar un mensaje si no hay datos
        $(contentContainer).html('<div class="text-center">No hay datos disponibles para mostrar.</div>');
        return; // Salir de la funci�n si no hay datos
    }
    // Crear las tarjetas
    data.forEach(function (item) {

        var empty = "";
        // Estructura de la tarjeta con el bot�n de mostrar/ocultar
        var card = `
					<div class="mobile-card">
						<h5> <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i> ${transformDateFormat(extractDate(item.fecha_creacion))} </h5>
                
						<!-- Contenedor de Marcaci�n -->
						<div class="marcacion-container">
                            <strong>Estado:</strong>
							<span class="marcacion" style="font-weight:bold;color: ` + (item.estado_evaluacion.toUpperCase() === "DENEGADA" ? "#d11e1e" : item.estado_evaluacion.toUpperCase() === "APROBADA" ? "#107f10" : "inherit") + `;">
    ` + item.estado_evaluacion.toUpperCase() + `
</span><br>
${(item.estado_evaluacion.toUpperCase() === "APROBADA" ? `
    <strong>Fecha Aprobación:</strong>
    <span class="marcacion"><br>` + formatDateManual(item.fecha_evaluacion) + `</span><br>
` : "")
}
							<strong>Descripción:</strong>
							<span class="marcacion"><br>`+ item.title_section_grading + `</span>
                            <p><strong>Periodo:</strong> ${item.periodo ?? empty}</p>
						</div>
                
						<button class="btn btn-sm btn-secondary" onclick="toggleDetails(this)">Mostrar más</button>
						<div class="hidden-details" style="display: none;">
							
							<p><strong>Sección:</strong> ${item.section}</p>
                            <p><strong>Codigo Curso:</strong> ${item.event_id ?? empty}</p>
						</div>
					</div>
				`;
        $(contentContainer).append(card);
    });
}

function listarFiltrosOrganizacion(identificador) {

    let organizacion = $("#SlcOrganizacion").val();
    let periodo = $("#SlPeriodo").val();
    let turno = $("#SlTurno").val();
    let seccion = $("#SlSeccion").val();
    let curso = $("#SlCurso").val();

    //alerta_center('error','error','error')
    try {

        var formDataJ = new FormData();
        formDataJ.append("organizacion", organizacion);
        formDataJ.append("periodo", periodo);
        formDataJ.append("turno", turno);
        formDataJ.append("seccion", seccion);
        formDataJ.append("curso", curso);
        formDataJ.append("identificador", identificador);

        $.ajax({
            url: listarFiltrosAmpliacion,
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

                    if (identificador === 1) {

                        // Limpia el combo de semestres antes de llenarlo
                        $('#SlPeriodo').empty();
                        $('#SlTurno').empty();
                        $('#SlSeccion').empty();
                        $('#SlCurso').empty();
                        $('#SlEvaluacionContinua').empty();


                        $('#SlPeriodo').append('<option value="">Seleccione un periodo</option>');
                        $('#SlTurno').append('<option value="">Seleccione un turno</option>');
                        $('#SlSeccion').append('<option value="">Seleccione una sección</option>');
                        $('#SlCurso').append('<option value="">Seleccione un curso</option>');
                        $('#SlEvaluacionContinua').append('<option value="">Seleccione una evaluación continua</option>');


                        // Recorre los datos devueltos y agr�galos como opciones al select
                        $.each(response.periodo, function (index, item) {
                            $('#SlPeriodo').append('<option value="' + item.academic_year + '-' + item.academic_term + '">' + item.academic_year + '-' + item.academic_term + '</option>');
                        });


                    } else if (identificador === 2) {


                        // Limpia el combo de semestres antes de llenarlo
                        $('#SlTurno').empty();
                        $('#SlSeccion').empty();
                        $('#SlCurso').empty();
                        $('#SlEvaluacionContinua').empty();

                        $('#SlTurno').append('<option value="">Seleccione un turno</option>');
                        $('#SlSeccion').append('<option value="">Seleccione una sección</option>');
                        $('#SlCurso').append('<option value="">Seleccione un curso</option>');
                        $('#SlEvaluacionContinua').append('<option value="">Seleccione una evaluación continua</option>');


                        // Recorre los datos devueltos y agr�galos como opciones al select
                        $.each(response.turno, function (index, item) {
                            $('#SlTurno').append('<option value="' + item.academic_session + '">' + item.academic_session + '</option>');
                        });

                    } else if (identificador === 3) {


                        // Limpia el combo de semestres antes de llenarlo
                        $('#SlSeccion').empty();
                        $('#SlCurso').empty();
                        $('#SlEvaluacionContinua').empty();

                        $('#SlSeccion').append('<option value="">Seleccione una sección</option>');
                        $('#SlCurso').append('<option value="">Seleccione un curso</option>');
                        $('#SlEvaluacionContinua').append('<option value="">Seleccione una evaluación continua</option>');


                        // Recorre los datos devueltos y agr�galos como opciones al select
                        $.each(response.section, function (index, item) {
                            $('#SlSeccion').append('<option value="' + item.section + '">' + item.section + '</option>');
                        });


                    } else if (identificador === 4) {

                        // Limpia el combo de semestres antes de llenarlo
                        $('#SlCurso').empty();
                        $('#SlEvaluacionContinua').empty();


                        $('#SlCurso').append('<option value="">Seleccione un curso</option>');
                        $('#SlEvaluacionContinua').append('<option value="">Seleccione una evaluación continua</option>');

                        // Recorre los datos devueltos y agr�galos como opciones al select
                        $.each(response.event_id, function (index, item) {
                            $('#SlCurso').append('<option value="' + item.event_id + '">' + item.event_id + '</option>');
                        });

                    } else if (identificador === 5) {

                        // Limpia el combo de semestres antes de llenarlo
                        $('#SlEvaluacionContinua').empty();

                        $('#SlEvaluacionContinua').append('<option value="">Seleccione una evaluación continua</option>');


                        // Recorre los datos devueltos y agr�galos como opciones al select
                        $.each(response.evaluacionContinua, function (index, item) {
                            $('#SlEvaluacionContinua').append('<option value="' + item.record_number + '">' + item.titulo + ' - ' + item.due_date + '</option>');
                        });


                    }

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

        alerta_center("error", "Excepci�n encontrada", "Ocurrió un error inesperado al cargar los filtros");
    }

}

function registroAmpliacionNotas() {
    try {

        let organizacion = $("#SlcOrganizacion").val();
        let periodo = $("#SlPeriodo").val();
        let turno = $("#SlTurno").val();
        let seccion = $("#SlSeccion").val();
        let curso = $("#SlCurso").val();
        let evaluacionContinua = $("#SlEvaluacionContinua").val();
        let motivo = $("#idMotivo").val();
        let uploadFile = $("#formFile")[0].files[0]; // Obtener el archivo seleccionado

        if (organizacion.trim() === '' || organizacion === undefined) {
            alerta_center("warning", "Datos insuficientes", "La organización es requerido");
            return;
        }
        else if (periodo.trim() === '' || periodo === undefined) {
            alerta_center("warning", "Datos insuficientes", "El periodo es requerido")
            return;
        }
        else if (turno.trim() === '' || turno === undefined) {
            alerta_center("warning", "Datos insuficientes", "El turno es requerido")
            return;
        }
        else if (seccion.trim() === '' || seccion === undefined) {
            alerta_center("warning", "Datos insuficientes", "La sección es requerido")
            return;
        }
        else if (curso.trim() === '' || curso === undefined) {
            alerta_center("warning", "Datos insuficientes", "El curso es requerido")
            return;
        }
        else if (evaluacionContinua.trim() === '' || evaluacionContinua === undefined) {
            alerta_center("warning", "Datos insuficientes", "La evaluación continua es requerido")
            return;
        }
        else if (motivo.trim() === '' || motivo === undefined) {
            alerta_center("warning", "Datos insuficientes", "El motivo es requerido")
            return;
        }
        //file Opcional
        else if (uploadFile === undefined) {
            alerta_center("warning", "Datos insuficientes", "Por favor adjunte un documento para la registrar la solicitud");
            return;
        }

        else {
            var formDataJ = new FormData();
            formDataJ.append("organizacion", organizacion);
            formDataJ.append("periodo", periodo);
            formDataJ.append("turno", turno);
            formDataJ.append("seccion", seccion);
            formDataJ.append("curso", curso);
            formDataJ.append("evaluacionContinua", evaluacionContinua);
            formDataJ.append("motivo", motivo);
            formDataJ.append("fileInput", uploadFile);

            $.ajax({
                url: registroAmpliacion,
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
                        listarSesionesAmpliacionNota();

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

    $('#btnSend_j').removeAttr("disabled");
}
