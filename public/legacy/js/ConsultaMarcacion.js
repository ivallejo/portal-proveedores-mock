import { _url } from './utils/consts.js' ;//'/utils/consts.js';


$(document).ready(function () {

    $('#tbMarcaciones').DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[10, 50, 100, 150, -1], [10, 50, 100, 150, "Todos"]],
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
    });
    $('#tbHistorialCambios').DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[10, 50, 100, 150, -1], [10, 50, 100, 150, "Todos"]],
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
    });

    consultarSesionesMarcaciones(0);

    $("#txtDocente").autocomplete({
        source: function (request, response) {
            // Realiza una petición AJAX con el término de búsqueda ingresado
            $.ajax({
                url: _url + 'Administrador/ListarDocentes',
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



    $("#btnConsultar").click(function () {
        consultarSesionesMarcaciones(1);
    });


    $("#btnGenerarExcel").click(function () {
        generarExcel();
    });

    $("#btnGuardarMarcacion").click(function () {
        guardarEditarMarcacion();
    });

    $(document).on('click', '.modal-effect', function () {

        let idSesion = $(this).text();

        console.log('Valor de sIdSesion:', idSesion);
        consultarSesionMarcacion(parseInt(idSesion));
        consultarMarcionLogs(parseInt(idSesion));
    });
});

function validarCampo(campo) {


    return campo === null || campo === undefined || campo.trim() === "";
}

function mostrarToast(icon, title, text, position, timer = 5000) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        toast: true,
        position: position,
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
    });
}

function configurarTabla(valor, resp ,data, columns) {

    // Ordenar por la columna que contiene el valor de ordenFecha
    const orderColumnIndex = columns.findIndex(column => column.data === 'ordenFecha');

    // Configurar DataTables para ordenar por la columna de ordenFecha
    const dataTable = $(valor).DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[10, 50, 100, 150, -1], [10, 50, 100, 150, "Todos"]],
        "searching": true,
        "ordering": true,
        "order": [[orderColumnIndex, 'asc']], // Ordenar por la columna "ordenFecha"
        "info": true,
        "autoWidth": false,
        "responsive": resp,
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
        data: data,
        columns: columns,
    });

    let sortOrder = 'asc';

    dataTable.on('click', 'th', function () {
        if ($(this).text() === 'Fecha de Sesión') {
            // Cambiar el orden de clasificación en función de la columna "Orden Fecha"
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            dataTable.order([orderColumnIndex, sortOrder]).draw();
        }
    });


}

function validarEliminarTabla(valor) {
    if ($(valor).length > 0) {
        $(valor).DataTable().destroy();
    }

}

function consultarSesionesMarcaciones(validacion) {
    //let val = validarSesion();
    //if (val.success) {
    //    window.open(val.resultado, '_self');
    //    return false;
    //}


    let docente = $("#txtDocente").val();
    let fechaInicio = $("#txtFechaIni").val();
    let fechaFin = $("#txtFechaFin").val();

    if (validacion === 1) {
        if (validarCampo(docente)) {
            mostrarToast("warning", "Advertencia!", "Ingrese un nombre de Docente válido.", "top-end");
            return;
        }

        if (validarCampo(fechaInicio)) {
            mostrarToast("warning", "Advertencia!", "Fecha Inicio no es válida.", "top-end");
            return;
        }

        if (validarCampo(fechaFin)) {
            mostrarToast("warning", "Advertencia!", "Fecha Fin no es válida.", "top-end");
            return;
        }
    } else {

        return;
    }

    const obj = {
        nomDocente: docente,
        fechaIni: fechaInicio,
        fechaFin: fechaFin,
        condicion: validacion
    }

    $.ajax({
        url: _url + 'Administrador/ConsultaMarcacionDocente',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (result) {
            console.log(result);
            $("#global-loader").css("display", "none");
            if (result.success) {
                    validarEliminarTabla('#tbMarcaciones');
                    let columnDefs = [
                        {
                            data: 'sIdSesion',
                            title: 'Id Sesión', // Título de la columna
                            render: function (data, type, row) {
                                if (type === 'display' || type === 'sort') {
                                    // Construye el enlace HTML con el valor de sIdSesion
                                    return '<a class="modal-effect" data-bs-effect="effect-sign" data-bs-toggle="modal" href="#modalEditarMarcacion">' + data + '</a>';
                                }
                                return data;
                            }
                        },
                        {
                            data: 'dFechaSesion',
                            title: 'Fecha de Sesión',
                            render: function (data, type, row) {
                                // Si se está representando para ordenar o mostrar, muestra solo la parte de la fecha
                                if (type === 'display' || type === 'sort') {
                                    return data.split(' ')[0]; // Suponiendo que la fecha está en el formato "dd/mm/yyyy hh:mm:ss"
                                }
                                return data; // De lo contrario, muestra la fecha completa
                            },
                            targets: 1, // Especifica la clase de la columna de fecha
                            type: 'date-eu',       // Indica el formato de fecha dd/mm/yyyy
                        }, { data: 'apellidosyNombresdeldocente', title: 'Apellidos y Nombres del docente' },
                        { data: 'sDesCurso', title: 'Curso' },
                        { data: 'sTema', title: 'Tema' },
                        { data: 'sSeccion', title: 'Aula' },
                        { data: 'dHoraInicio', title: 'Hora inicio' },
                        { data: 'dHoraFin', title: 'Hora fin' },
                        { data: 'dHoraEnt', title: 'Marcación entrada' },
                        { data: 'dHoraSal', title: 'Marcación salida' },
                        { data: 'minutostardanza', title: 'Minutos de tardanza' },
                        { data: 'ordenFecha', title: 'Orden Fecha', visible: false } // Esta columna estará oculta

                    ];

                    configurarTabla('#tbMarcaciones',true,result.resultado, columnDefs)
                if (result.resultado.length === 0) {
                    mostrarToast("info", "Información", "No se encontro información en la consulta.", "top-end");
                }

            } else {
                mostrarToast("error", "Error!", result.resultado, "top-end");
            }
        },
        error: function (error) {
            $("#global-loader").css("display", "none");
            // Construir el mensaje de error con salto de línea y mensaje adicional en formato de texto
            let errorMessage = error.responseText + "\n\n Si el error persiste, contactar con servicedesk.ti@adexperu.org.pe";

            mostrarToast("error", "Error en la solicitud!", errorMessage, "top-end");


        },
    });
}

function generarExcel() {
    //let val = validarSesion();
    //if (val.success) {
    //    window.open(val.resultado, '_self');
    //    return false;
    //}

    let docente = $("#txtDocente").val();
    let fechaInicio = $("#txtFechaIni").val();
    let fechaFin = $("#txtFechaFin").val();


    if (validarCampo(docente)) {
        mostrarToast("warning", "Advertencia!", "Ingrese un nombre de Docente válido.", "top-end");
        return;
    }

    if (validarCampo(fechaInicio)) {
        mostrarToast("warning", "Advertencia!", "Fecha Inicio no es válida.", "top-end");
        return;
    }

    if (validarCampo(fechaFin)) {
        mostrarToast("warning", "Advertencia!", "Fecha Fin no es válida.", "top-end");
        return;
    }


    $.ajax({
        url: _url + 'Administrador/DescargarExcel',
        type: 'POST',
        data: { nomDocente: docente, fechaIni: fechaInicio, fechaFin: fechaFin },
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (data) {
            $("#global-loader").css("display", "none");
            console.log(data);
            if (data.success) {
                // Crear un enlace temporal para descargar el archivo
                let link = document.createElement('a');
                link.href = _url + data.ruta;
                link.download = data.archivo;
                document.body.appendChild(link);
                link.click();
            } else {
                mostrarToast("error", "Error!", data.message, "top-end");
            }
        },
        error: function (error) {
            $("#global-loader").css("display", "none");
            console.error("Error en la solicitud:", error);
        }
    });
}

function consultarSesionMarcacion(idSesion) {

    //let val = validarSesion();
    //if (val.success) {
    //    window.open(val.resultado, '_self');
    //    return false;
    //}

    const obj = {
        idSesion: idSesion
    }

    $.ajax({
        url: _url + 'Administrador/ConsultaMarcacionSesion',
        type: "POST",
        data: obj,
        success: function (result) {
            console.log(result.resultado);
            console.log(result.resultado[0]);
            console.log(result.resultado[0].sIdSesion);
            $("#lblSesionId").text(result.resultado[0].sIdSesion);
            $("#lblCurso").text(result.resultado[0].sDesCurso);
            $("#lblFecha").text(formatearFecha(result.resultado[0].dFechaSesion));
            $("#lblHoraInicio").text(result.resultado[0].dHoraInicio);
            $("#lblHoraFinal").text(result.resultado[0].dHoraFin);
            $("#lblSeccion").text(result.resultado[0].sSeccion);

            $("#lblTema").text(result.resultado[0].sTema);
            $("#lblEntrada").text(result.resultado[0].dHoraEnt === "00:00:00" ? '' : result.resultado[0].dHoraEnt);
            $("#lblSalida").text(result.resultado[0].dHoraSal === "00:00:00" ? '' : result.resultado[0].dHoraSal);

        },
        error: function (error) {
            // Construir el mensaje de error con salto de línea y mensaje adicional en formato de texto
            let errorMessage = error.responseText + "\n\n Si el error persiste, contactar con servicedesk.ti@adexperu.org.pe";

            mostrarToast("error", "Error en la solicitud!", errorMessage, "top-end");


        },
    });
}

function consultarMarcionLogs(idSesion) {

    //let val = validarSesion();
    //if (val.success) {
    //    window.open(val.resultado, '_self');
    //    return false;
    //}

    const obj = {
        idSesion: idSesion
    }

    $.ajax({
        url: _url + 'Administrador/ConsultaMarcacionLogs',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader-modal").css("display", "revert");
        },
        success: function (result) {
            $("#global-loader-modal").css("display", "none");

            if (result.success) {
                validarEliminarTabla('#tbHistorialCambios');
                let columnDefs = [
                    {
                        data: 'nIdLogMarcaciones',
                        title: 'ID'
                    },
                    {
                        data: 'dFechaSesion',
                        title: 'Fecha de Sesión'
                    }, { data: 'dHoraEnt', title: 'Marcación de Entrada' },
                    { data: 'dHoraSal', title: 'Marcación de Salida' },
                    { data: 'sTema', title: 'Tema' },
                    { data: 'sEstado', title: 'Estado' },
                    { data: 'sMotivo', title: 'Motivo' },
                    { data: 'dFechaRegistro', title: 'Fecha de Modificación' },
                    { data: 'sUsuarioRegistro', title: 'Usuario' },
                    { data: 'ordenFecha', title: 'Orden Fecha', visible: false } // Esta columna estará oculta

                ];

                configurarTabla('#tbHistorialCambios',true, result.resultado, columnDefs)

            } else {
                mostrarToast("error", "Error!", result.resultado, "top-end");
            }
           
        },
        error: function (error) {
            $("#global-loader-modal").css("display", "none");

            // Construir el mensaje de error con salto de línea y mensaje adicional en formato de texto
            let errorMessage = error.responseText + "\n\n Si el error persiste, contactar con servicedesk.ti@adexperu.org.pe";

            mostrarToast("error", "Error en la solicitud!", errorMessage, "top-end");


        },
    });
}

function guardarEditarMarcacion() {
    let tema = $("#txtTema").val();
    let entrada = $("#txtEntrada").val();
    let salida = $("#txtSalida").val();
    let motivo = $("#txtMotivo").val();

    if (validarCampo(motivo)) {
        mostrarToast("warning", "Advertencia!", "Debe registrar el motivo de la actualización", "top-end");

        return;
    }

    if (!validarFormatoHora(entrada)) {
        mostrarToast("warning", "Advertencia!", "Debe ingresar un formato de hora valido", "top-end");

        return;
    }
    if (!validarFormatoHora(salida)) {
        mostrarToast("warning", "Advertencia!", "Debe ingresar un formato de hora valido", "top-end");

        return;
    }

    const obj = {
        tema: tema,
        entrada: entrada,
        salida: salida,
        motivo: motivo
    }
    console.log(obj);

    $.ajax({
        url: _url + 'Administrador/ActualizarMarcacion',
        type: "POST",
        data: obj,
        success: function (result) {
            console.log(result);
            if (result.success) {
                window.location.href = _url + 'Administrador/ConsultaMarcacion';
            } else {
                mostrarToast("error", "Error!", result.resultado, "top-end");

            }

        },
        error: function (error) {
            // Construir el mensaje de error con salto de línea y mensaje adicional en formato de texto
            let errorMessage = error.responseText + "\n\n Si el error persiste, contactar con servicedesk.ti@adexperu.org.pe";

            mostrarToast("error", "Error en la solicitud!", errorMessage, "top-end");


        },
    });
}

//function validarSesion() {
//    let ent = [];
//    $.ajax({
//        type: 'POST',
//        async: false,
//        dataType: 'json',
//        url: _url + 'Administrador/ValidarSesion',
//        contentType: 'application/json; charset=utf-8',
//        success: function (result) {
//            ent = result;
//        },
//        error: function (result) {

//        }
//    });
//    return ent;
//}

function formatearFecha(cadenaFecha) {
    if (!cadenaFecha) return ''; // Manejar casos en los que la cadena de fecha es nula o vacía

    const partes = cadenaFecha.split(' ');
    if (partes.length < 1) return ''; // Manejar casos en los que la cadena de fecha no es válida

    const fechaPartes = partes[0].split('/');
    if (fechaPartes.length !== 3) return ''; // Manejar casos en los que la cadena de fecha no es válida

    const dia = fechaPartes[0];
    const mes = fechaPartes[1];
    const año = fechaPartes[2];

    // Asegúrate de que tengas un día, mes y año válidos (puedes agregar más validaciones si es necesario)

    return `${dia}/${mes}/${año}`;
}

function validarFormatoHora(input) {
    if (input === '' || /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(input)) {
        return true;
    } else {
        return false;
    }
}
