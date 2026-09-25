import { _url } from './utils/consts.js';//'/utils/consts.js';

//const _url = 'https://localhost:7054/';
//const _url = 'http://10.31.1.37/SADAgos/';

$(document).ready(function () {
    llenarSelectPeriodo();

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
        consultaJustificacion();
        
    });

   
   
});

function consultaJustificacion() {
    let val = validarSesion();
    if (val.success) {
        window.open(val.resultado, '_self');
        return false;
    }

    let estado = $("#cboEstado").val();
    let periodo = $("#cboPeriodo").val();
    let docente = $("#txtDocente").val();

    if (validarCampo(estado)) {
        mostrarToast("warning", "Advertencia!", "Seleccione un estado valido.", "top-end");
        return;
    }
    if (validarCampo(periodo)) {
        mostrarToast("warning", "Advertencia!", "Seleccione un periodo valido.", "top-end");
        return;
    }

    const obj = {
        sEstado: estado,
        sAnioSemestre: periodo,
        sDocente: docente
    }

    $.ajax({
        url: _url + 'Administrador/ConsultaJustificaciones',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (result) {
            console.log(result);
            $("#global-loader").css("display", "none");
            if (result.success) {
               
                // Verifica si los botones existen
                if ($("#btnAprobar").length > 0 || $("#btnDenegar").length > 0) {
                    // Los botones existen, entonces los eliminamos
                    $("#btnAprobar, #btnDenegar").remove();
                }

                clearHtml($('.table-responsive'));

                if (result.resultado.length === 0) {
                    mostrarToast("info", "Información", "No se encontro información en la consulta.", "top-end");
                } else {

                    $('#btnConsultar').after(crearButtons(estado));

                    $('.table-responsive').append(crearTabla(result));

                    configurarTabla('#tbJustificaciones', true);

                    $("#btnAprobar").click(function () {

                        const checksActivos = obtenerChecksActivos();
                        console.log(checksActivos); // Esto mostrará un array con los números de los checks activos
                        AprobarJustificaciones(checksActivos);

                    });

                    $("#btnDenegar").click(function () {

                        const checksActivos = obtenerChecksActivos();
                        console.log(checksActivos); // Esto mostrará un array con los números de los checks activos
              
                    });

                    

                }

            } else {
                mostrarToast("error", "Error!", result.resultado, "top-end");
            }
        },
        error: function (error) {
            console.log(error);
            $("#global-loader").css("display", "none");
            // Construir el mensaje de error con salto de línea y mensaje adicional en formato de texto
            let errorMessage = error.responseText + "\n\n Si el error persiste, contactar con servicedesk.ti@adexperu.org.pe";

            mostrarToast("error", "Error en la solicitud!", errorMessage, "top-end");


        },
    });

}


function llenarSelectPeriodo() {
    let val = validarSesion();
    if (val.success) {
        window.open(val.resultado, '_self');
        return false;
    }

    let selectPeriodo = $("#cboPeriodo");

    // Realizar la petición GET
    $.ajax({
        url: _url + 'Administrador/ListarAnioSemestres',
        method: "GET",
        success: function (result) {
            // Limpiar el select
            selectPeriodo.empty();

            // Agregar la opción "Seleccione" al inicio
            selectPeriodo.append('<option value="-1">Seleccione un Periodo</option>');

            // Llenar el select con los datos obtenidos
            result.resultado.forEach(function (periodo) {
                selectPeriodo.append(
                    '<option value="' + periodo + '">' + periodo + '</option>'
                );
            });

        },
        error: function (error) {
            console.error("Error en la solicitud: " + error);
        }
    });
}


function AprobarJustificaciones(checksActivos) {

    let val = validarSesion();
    if (val.success) {
        window.open(val.resultado, '_self');
        return false;
    }


    const obj = {
        justificaciones: checksActivos,
    }

    $.ajax({
        url: _url + 'Administrador/AprobarJustificacion',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (result) {
            console.log(result);
            $("#global-loader").css("display", "none");
            if (result.success) {
                

                mostrarToast('success', 'Exito!', result.resultado, 'top-end');

            } else {
                mostrarToast("error", "Error!", result.resultado, "top-end");
            }
        },
        error: function (error) {
            console.log(error);
            $("#global-loader").css("display", "none");
            // Construir el mensaje de error con salto de línea y mensaje adicional en formato de texto
            let errorMessage = error.responseText + "\n\n Si el error persiste, contactar con servicedesk.ti@adexperu.org.pe";

            mostrarToast("error", "Error en la solicitud!", errorMessage, "top-end");

        },
    });
}

function obtenerChecksActivos() {
    const checksActivos = [];
    // Selecciona todos los elementos de tipo checkbox cuyo id comienza con 'check_item_'
    $('input[type="checkbox"][id^="check_item_"]').each(function () {
        // Verifica si el checkbox está marcado
        if ($(this).prop("checked")) {
            // Obtiene el ID y extrae el número
            const id = $(this).attr("id");
            const numero = parseInt(id.split("_")[2]);
            // Agrega el número al array
            checksActivos.push(numero);
        }
    });
    return checksActivos;
}

function validarCampo(campo) {
    return campo === null || campo === undefined || campo.trim() === "" || campo === "-1";
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

function validarSesion() {
    let ent = [];
    $.ajax({
        type: 'POST',
        async: false,
        dataType: 'json',
        url: _url + 'Administrador/ValidarSesion',
        contentType: 'application/json; charset=utf-8',
        success: function (result) {
            ent = result;
        },
        error: function (result) {

        }
    });
    return ent;
}

function clearHtml(element) {
    element.empty();
}

function configurarTabla(valor, resp) {
    // Obtén la tabla como objeto jQuery
    const $tabla = $(valor);

    // Obtén los encabezados de la tabla
    const headers = $tabla.find('thead th');

    // Encuentra la posición de la columna con el título "Orden Fecha"
    let posicionOrdenFecha = -1;
    headers.each(function (index) {
        if ($(this).text() === 'Orden Fecha') {
            posicionOrdenFecha = index;
            return false; // Detiene el bucle cuando se encuentra la posición
        }
    });
    console.log('Posicion Orden Fecha', posicionOrdenFecha);
    // Agrega un manejador de evento para el evento "draw" de DataTables
    $('#tbJustificaciones').on('draw.dt', function () {
        // Agregar un manejador de clic a los botones con ID que comienza con "btnArchivo"
        $("button[id^='btnArchivo']").on("click", function () {
            // Extraer el ID del botón
            const buttonId = $(this).attr("id");
            const idPart = buttonId.split("_")[1];
            console.log("ID: " + idPart);
        });
    });


    const dataTable = $tabla.DataTable({
        "paging": true,
        "lengthChange": true,
        "lengthMenu": [[10, 50, 100, 150, -1], [10, 50, 100, 150, "Todos"]],
        "searching": true,
        "ordering": true,
        "order": [[posicionOrdenFecha, 'asc']], // Usa la posición encontrada
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
        "columnDefs": [
            {
                "type": "num", // Especifica que los datos son de tipo numérico
                "targets": posicionOrdenFecha, // Aplica esta configuración solo a la columna "Orden Fecha"
                "visible": false // Oculta la columna
            },
            {
                "orderable": false, // Esta columna no será ordenable
                "targets": 'no-sort' // Excluye las columnas con la clase 'no-sort' de la ordenación
            }
        ],
        "responsive": {
            details: {
                type: 'column',
                target: 1 // Aquí especificamos la columna a partir de la cual será "responsive"
            }
        }
    });
    let sortOrder = 'asc';

    dataTable.on('click', 'th', function () {
        if ($(this).text() === 'Fecha de Sesión') {
            // Cambiar el orden de clasificación en función de la columna "Orden Fecha"
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            dataTable.order([posicionOrdenFecha, sortOrder]).draw();
        }
    });
    dataTable.on('click', 'button', function () {
        // Verificar si el botón tiene el id que estás buscando
        const button = $(this);
        const buttonId = button.attr('id');

        if (buttonId && buttonId.startsWith('btnArchivo_')) {
            // Extraer el ID de la fila desde el id del botón
            const id = buttonId.split("_")[1];

            // Realiza las acciones que necesites con el ID
            console.log("ID del botón 'Archivo Adjunto': " + id);

            // Aquí puedes abrir el archivo adjunto u realizar otras acciones
        }
    });
   
}

function crearTabla(data) {
    let tabla = `
        <table class="table table-sm table-bordered text-nowrap border-bottom" id="tbJustificaciones">
            <thead>
                <tr>
                    <th class="no-sort"><div class="form-check"><input type="checkbox" class="form-check-input" id="checkAll" onclick="selectAll(this)"></div></th>
                    <th>Id Justificación</th>
                    <th>Fecha de Justificación</th>
                    <th>Fecha de Sesión</th>
                    <th>Estado</th>
                    <th>Marcación Justificada</th>
                    <th>Motivo</th>
                    <th>Apellidos y Nombres del docente</th>
                    <th>Curso</th>
                    <th>Sección</th>
                    <th>Aula</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Justificación Entrada</th>
                    <th>Nombre Archivo</th>
                    <th>Archivo Adjunto</th>
                    <th style="display: none;">Orden Fecha</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.resultado.forEach(function (item) {

        let archivoButtonHTML = "";
        if (item.sNombreArchivo !== "") {
            archivoButtonHTML = `<button class="btn btn-outline-info" data-bs-placement="bottom" data-bs-toggle="tooltip-secondary" title="Descargar Archivo" id="btnArchivo_${item.nIdJustificacion}"><i class="fa-regular fa-file-lines"></i></button>`;
        }

        tabla += `
            <tr>
                <td><div class="form-check"><input type="checkbox" class="select-checkbox form-check-input" id="check_item_${item.nIdJustificacion}"></div></td>
                <td>
                    <a class="btn btn-primary">
                        <i class="fa-solid fa-circle-plus fa-beat"></i> ${item.nIdJustificacion}
                    </a>
                </td>
                <td>${item.dFechaRegistro.split(' ')[0]}</td>
                <td>${item.dFechaSesion.split(' ')[0]}</td>
                <td>${item.sEstado}</td>
                <td>${item.sIdentificador}</td>
                <td>${item.sMotivo}</td>
                <td>${item.apellidosyNombresdeldocente}</td>
                <td>${item.sDesCurso}</td>
                <td>${item.sSeccion}</td>
                <td>${item.sAula}</td>
                <td>${item.dHoraInicio}</td>
                <td>${item.dHoraFin}</td>
                <td>${item.dHoraEntJust}</td>
                <td>${item.sNombreArchivo}</td>
                <td>${archivoButtonHTML}</td>
                <td style="display: none;">${item.ordenFecha}</td>
            </tr>
        `;
    });

    tabla += `
            </tbody>
        </table>
    `;

    return tabla;
}

function crearButtons(estado) {
    // Crea los botones adicionales
    let buttons = `
                        <button class="btn btn-primary mt-4 mb-4" id="btnAprobar">Aprobar</button>
                        <button class="btn btn-primary mt-4 mb-4" id="btnDenegar">Denegar</button>
                    `;
    if (estado === 'D') {
        buttons = `
            <button class="btn btn-primary mt-4 mb-4" id="btnAprobar">Aprobar</button>  
        `;
        return buttons;
    }

    if (estado === 'A') {
        buttons = `
            <button class="btn btn-primary mt-4 mb-4" id="btnDenegar">Denegar</button>  
        `;
        return buttons;
    }

    return buttons;
}

function selectAll(source) {
    // Encuentra todas las casillas de verificación en la tabla, independientemente de la paginación
    const checkboxes = $('#tbJustificaciones').find('.select-checkbox');

    // Marca o desmarca todas las casillas de verificación según el valor de la casilla "Seleccionar todo"
    checkboxes.prop('checked', source.checked);


    //const $tabla = $('#tbJustificaciones');
    //const dataTable = $tabla.DataTable();
    //const data = dataTable.rows().data().toArray();
    //console.log(data);
    //const tablaHtml = dataTable.table().container().outerHTML;
    //console.log(tablaHtml);
}
