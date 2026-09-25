import { _url } from './utils/consts.js';//'/utils/consts.js';


//const _url = 'https://localhost:7054/';
//const _url = 'http://10.31.1.37/SADAgos/';

$(document).ready(function () {

    $("#btnExportarSesiones").click(function () {
        generarExcelSesiones();
    });

    $("#btnExportarJustificaciones").click(function () {
        generarExcelJustificaciones();
    });
});

function generarExcelSesiones() {

    let unidadNegocio = $("#cboUnidadNegocio").val();
    let fechaInicio = $("#txtFechaIni").val();
    let fechaFin = $("#txtFechaFin").val();


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


    $.ajax({
        url: $('#inputDescargarExcelSesiones').val(),
        type: 'POST',
        data: { unidad: unidadNegocio, fechaIni: fechaInicio, fechaFin: fechaFin },
        beforeSend: function () {
            $("#global-loader").css("display", "revert");
        },
        success: function (data) {
            $("#global-loader").css("display", "none");
            console.log(data);
            if (data.success) {

                // Crear un enlace temporal para descargar el archivo
                let link = document.createElement('a');
                link.href = data.ruta;
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


function generarExcelJustificaciones() {
   
    let unidadNegocio = $("#cboUnidadNegocio").val();
    let fechaInicio = $("#txtFechaIni").val();
    let fechaFin = $("#txtFechaFin").val();


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

    const url = $('#inputDescargarExcelJustificaciones').val() + '?unidad=' + unidadNegocio + '&fechaIni=' + fechaInicio + '&fechaFin=' + fechaFin;
    window.open(url, '_blank');

    //$.ajax({
    //    url: $('#inputDescargarExcelJustificaciones').val(),
    //    type: 'POST',
    //    data: { unidad: unidadNegocio, fechaIni: fechaInicio, fechaFin: fechaFin },
    //    beforeSend: function () {
    //        $("#global-loader").css("display", "revert");
    //    },
    //    success: function (data) {
    //        $("#global-loader").css("display", "none");
    //        if (data.success) {
    //            // Crear un enlace temporal para descargar el archivo
    //            let link = document.createElement('a');
    //            link.href = data.ruta;
    //            link.download = data.archivo;
    //            document.body.appendChild(link);
    //            link.click();
    //        } else {
    //            mostrarToast("error", "Error!", data.message, "top-end");
    //        }
    //    },
    //    error: function (error) {
    //        $("#global-loader").css("display", "none");
    //        console.error("Error en la solicitud:", error);
    //    }
    //});
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