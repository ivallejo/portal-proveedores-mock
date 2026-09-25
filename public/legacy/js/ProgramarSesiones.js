import { _url } from './utils/consts.js';//'/utils/consts.js';

//const _url = 'https://localhost:7054/';
//const _url = 'http://10.31.1.37/SADAgos/';

$(document).ready(function () {
    llenarSelectPeriodo();
    $("#btnConsultar").click(function () {
        consultarSesionesProgramadas();
    });
    $("#btnConsultarJefe").click(function () {
        consultarJefePractica();
    });
});

function llenarSelectPeriodo() {

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

function consultarSesionesProgramadas() {

    let periodo = $("#cboPeriodo").val();
    let seccion = $("#txtSeccion").val();
    let idcurso = $("#txtIdCurso").val();

    if (validarCampo(periodo)) {
        mostrarToast("warning", "Advertencia!", "Ingrese un perido válido.", "top-end");
        return;
    }

    if (validarCampo(seccion)) {
        mostrarToast("warning", "Advertencia!", "Ingrese un sección válido.", "top-end");
        return;
    }

    if (validarCampo(idcurso)) {
        mostrarToast("warning", "Advertencia!", "Ingrese un id curso válido.", "top-end");
        return;
    }

    const obj = {
        sAnioSemestre: periodo,
        sSeccion: seccion,
        sIdCurso: idcurso
    }

    $.ajax({
        url: _url + 'Administrador/ConsultaSesionesProgramadas',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (result) {
            console.log(result);
            $("#global-loader").css("display", "none");
            if (result.success) {
                clearHtml($('.contenedor-jefe'));
                clearHtml($('.table-responsive'));

                if (result.resultado.length === 0) {
                    mostrarToast("info", "Información", "No se encontro información en la consulta.", "top-end");
                } else {

                    $('.contenedor-jefe').append(contenedorJefePractica());

                    $('.table-responsive').append(crearTabla(result));

                    configurarTabla('#tbProgramaSesiones', false);

                   

                    $("#btnConsultarJefe").click(function () {
                        consultarJefePractica();
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

function consultarJefePractica() {
    

    let codigoJefe = $("#txtCodigoJefe").val();
    let regex = /^\d{9}$/; // Expresión regular para exactamente 9 dígitos del 0 al 9

    if (!regex.test(codigoJefe)) {
        mostrarToast("warning", "Advertencia!", "Valor no válido. Debe contener 9 dígitos numéricos del 0 al 9.", "top-end");
        return;
    }

    const obj = {
        codigo: codigoJefe
    }

    $.ajax({
        url: _url + 'Administrador/ConsultaJefePracitca',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (result) {
            console.log(result);
            $("#global-loader").css("display", "none");
            if (result.success) {
                $('#nombreJefe').text(result.resultado);
                $("#p-nombrejefe").css("display", "revert");


                // Selecciona el elemento con el ID "sesionespr"
                let sesionespr = $('#tbProgramaSesiones_wrapper');

                // Encuentra el primer elemento con la clase "col-sm-12 col-md-6" dentro de "sesionespr"
                let primerElemento = sesionespr.find('.col-sm-12.col-md-6').first();

                // Modifica el contenido HTML del primer elemento
                primerElemento.html(`
                    <button class="btn btn-primary my-2" id="btnAsignar">Asignar</button>
                `);

                $("#btnAsignar").click(function () {
                    const checksActivos = obtenerChecksActivos();
                    console.log(checksActivos); // Esto mostrará un array con los números de los checks activos
                    AsignarProgramaSesiones(checksActivos);
                });

                
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
function AsignarProgramaSesiones(checksActivos) {

    let codigoJefe = $("#txtCodigoJefe").val();
    let nomJefe = $("#nombreJefe").text();

    const obj = {
        sesiones: checksActivos,
        codJp: codigoJefe,
        nomJp: nomJefe
    }

    $.ajax({
        url: _url + 'Administrador/AsignarProgramaSesiones',
        type: "POST",
        data: obj,
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (result) {
            console.log(result);
            $("#global-loader").css("display", "none");
            if (result.success) {
                clearHtml($('.contenedor-jefe'));
                clearHtml($('.table-responsive'));
                $("#cboPeriodo").val("-1");
                $("#txtSeccion").val("");
                $("#txtIdCurso").val("");

                mostrarToast('success', 'Asignación Correcta!', result.resultado, 'top-end');

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
    const dataTable = $tabla.DataTable({
        "paging": false,
        "lengthChange": true,
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
        ]
    });
    let sortOrder = 'asc';

    dataTable.on('click', 'th', function () {
        if ($(this).text() === 'Fecha de Sesión') {
            // Cambiar el orden de clasificación en función de la columna "Orden Fecha"
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            dataTable.order([posicionOrdenFecha, sortOrder]).draw();
        }
    });
}
function contenedorJefePractica() {
    let div = `
            <div class="row">
                <div class="col-sm-4 form-group">
                    <label for="txtCodigoJefe" class="form-label">Código jefe de práctica:</label>
                    <input type="text" class="form-control" id="txtCodigoJefe" value="">
                </div>
                <div class="col-md-4 form-group d-flex align-items-end">
                    <button class="btn btn-primary mx-1" id="btnConsultarJefe">Consultar</button>
                </div>
            </div>
            <p id="p-nombrejefe" class="h6" style="display:none;">Nombre Jefe de practica: <strong id="nombreJefe"></strong> </p>
    `;
    return div;
}

// Función para crear la tabla
function crearTabla(data) {
    let tabla = `
        <table class="table table-sm table-bordered text-nowrap border-bottom" id="tbProgramaSesiones">
            <thead>
                <tr>
                    <th class="no-sort"><div class="form-check"><input type="checkbox" class="form-check-input" id="checkAll" onclick="selectAll(this)"></div></th>
                    <th>Id Sesión</th>
                    <th>Fecha de Sesión</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Año</th>
                    <th>Semestre</th>
                    <th>Turno</th>
                    <th>Id Curso</th>
                    <th>Docente</th>
                    <th style="display: none;">Orden Fecha</th>

                </tr>
            </thead>
            <tbody>
    `;

    data.resultado.forEach(function (item) {
        tabla += `
            <tr>
                <td><div class="form-check"><input type="checkbox" class="select-checkbox form-check-input" id="check_item_${item.sIdSesion}"></div></td>
                <td>${item.sIdSesion}</td>
                <td>${item.dFechaSesion.split(' ')[0]}</td>
                <td>${item.dHoraInicio}</td>
                <td>${item.dHoraFin}</td>
                <td>${item.sAnio}</td>
                <td>${item.sSemestre}</td>
                <td>${item.sTurno}</td>
                <td>${item.sIdCurso}</td>
                <td>${item.sNombreDocente}</td>
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

function selectAll(source) {
    // Encuentra todas las casillas de verificación en la tabla, independientemente de la paginación
    const checkboxes = $('#tbProgramaSesiones').find('.select-checkbox');

    // Marca o desmarca todas las casillas de verificación según el valor de la casilla "Seleccionar todo"
    checkboxes.prop('checked', source.checked);
}

