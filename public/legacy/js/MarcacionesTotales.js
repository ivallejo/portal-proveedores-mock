import { _url } from './utils/consts.js';//'/utils/consts.js';


//const _url = 'https://localhost:7054/';
//const _url = 'http://10.31.1.37/SADAgos/';

$(document).ready(function () {

    $("#btnConsultar").click(function () {
        consultarMarcacionesConTarifa();
    });


    $("#btnExportarMarcaciones").click(function () {
        generarExcelMarcacionesConTarifa();
    });
    $('#idTablaMarcacionesTotales').DataTable({

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
});

function generarExcelMarcacionesConTarifa() {
    let unidadNegocio = $("#cboUnidadNegocio").val();
    let fechaInicio = $("#txtFechaIni").val();
    let fechaFin = $("#txtFechaFin").val();
    let tipoTarifa = $("#cboTipoTarifa").val();

    if (validarCampo(unidadNegocio)) {
        mostrarToast("warning", "Advertencia!", "Seleccione una unidad de Negocio", "top-end");
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
    if (validarCampo(tipoTarifa)) {
        mostrarToast("warning", "Advertencia!", "Seleccione un tipo de tarifa.", "top-end");
        return;
    }

    $.ajax({
        url: $('#inputDescargarExcelMarcaciones').val(),
        type: 'POST',
        data: {
            unidad: unidadNegocio,
            fechaIni: fechaInicio,
            fechaFin: fechaFin,
            tipoTarifa: tipoTarifa
        },
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (data) {
            $("#global-loader").css("display", "none");

            if (data.success) {
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

function consultarMarcacionesConTarifa() {
    let unidadNegocio = $("#cboUnidadNegocio").val();
    let fechaInicio = $("#txtFechaIni").val();
    let fechaFin = $("#txtFechaFin").val();
    let tipoTarifa = $("#cboTipoTarifa").val();

    if (validarCampo(unidadNegocio)) {
        mostrarToast("warning", "Advertencia!", "Seleccione una unidad de Negocio", "top-end");
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

    if (validarCampo(tipoTarifa)) {
        mostrarToast("warning", "Advertencia!", "Seleccione un tipo de tarifa.", "top-end");
        return;
    }

    $("#global-loader").css("display", "revert");

    $.ajax({
        url: $('#inputConsultarMarcaciones').val(),
        type: "POST",
        data: {
            unidad: unidadNegocio,
            fechaIni: fechaInicio,
            fechaFin: fechaFin,
            tipoTarifa: tipoTarifa
        },
        success: function (response) {
            $("#global-loader").css("display", "none");

            if (response.success) {
                console.log(response.data);
                if ($.fn.DataTable.isDataTable('#idTablaMarcacionesTotales')) {
                    $('#idTablaMarcacionesTotales').DataTable().destroy();
                }

                $('#idTablaMarcacionesTotales tbody').empty();

                $('#idTablaMarcacionesTotales').DataTable({
                    data: response.data,
                    columns: [
                        { data: "sIdSesion" },
                        {
                            data: "fechaSesion"
                        },
                        { data: "codDocente" },
                        { data: "dniDocente" },
                        { data: "apellidosNombresDocente" },
                        { data: "codCurso" },
                        { data: "curso" },
                        { data: "seccion" },
                        { data: "aula" },
                        { data: "sede" },
                        { data: "horaIngreso" },
                        { data: "horaSalida" },
                        { data: "totalHorasDictadas" },
                        { data: "horasProgramadas" },
                        { data: "marcacionIngreso" },
                        { data: "marcacionSalida" },
                        { data: "horasMarcadas" },
                        { data: "minutosTardanza" },
                        { data: "tarifaHora" },
                        { data: "centroCostos" },
                        { data: "descripcionCentroCostos" },
                        { data: "semestre" },
                        { data: "anio" },
                        { data: "estadoSesion" },
                        { data: "mensajeSesion" },
                        { data: "fuente" },
                        { data: "tipoSeccion" },
                        { data: "anioMaestro" },
                        { data: "semestreMaestro" },
                        { data: "turnoMaestro" },
                        { data: "totalMinutosMarcados" },
                        { data: "minutosDescuentoBreak" },
                        { data: "horasContadas" },
                        { data: "tarifaFinal" },
                        { data: "factorUsado" },
                        { data: "montoCalculadoDecimal" }
                    ],
                    scrollX: true,
                    paging: true,
                    lengthChange: true,
                    lengthMenu: [[50, 100, 150, -1], [50, 100, 150, "Todos"]],
                    searching: true,
                    ordering: true,
                    info: true,
                    responsive: true,
                    language: {
                        url: "//cdn.datatables.net/plug-ins/1.11.3/i18n/es_es.json",
                        searchPlaceholder: "Buscar"
                    }
                });
            } else {
                mostrarToast("error", "Error", response.mensaje, "top-end");
            }
        },
        error: function (error) {
            $("#global-loader").css("display", "none");
            console.error("Error:", error);
            mostrarToast("error", "Error", "Hubo un error al consultar los datos", "top-end");
        }
    });
}


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