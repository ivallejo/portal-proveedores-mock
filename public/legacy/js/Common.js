function IniciarSimulacion(ParamUrl) {
    var programa = $("#slcPrograma").val();

    if (programa == null || programa == "--") {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(5000).html("Por favor selecione un programa destino.");
        $('#Div_MensajeError').focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                key: programa
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ResultadoSimulacion").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar simular el cambio de programa.');
            }
        });
    }
}

function LimpiarResultado(div) {
    $("#" + div).html("");
}

function BuscarDocenteAlu(ParamUrl) {

    if ($("#txtnombres").val().length < 3 && $("#txtapepat").val().length < 3 && $("#txtapemat").val().length < 3) {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(5000).html("Recuerde que los parámetros de búsqueda deben tener como mínimo 3 letras.");
        $('#Div_MensajeError').focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                nombres: $("#txtnombres").val(),
                apepat: $("#txtapepat").val(),
                apemat: $("#txtapemat").val()
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ResultadoBusqDoc").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar realizar la búsqueda de docentes con los parámetros ingresados.');
            }
        });
    }
    
}

function CargarDatosDocente(ParamUrl, id) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            id: id
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ResultadoBusqDoc").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información del docente seleccionado.');
        }
    });
}

function Semana(fecha, ParamUrl, id) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            fecha: fecha,
            id:id
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#HorariosSemanaDocente").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información del docente seleccionado.');
        }
    });
}

function verNotificacion(ParamUrl, id) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            id: id
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_NotModal").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información de la notificación.');
        }
    });
}

function BuscarDirectorio(ParamUrl) {
    var nombre = $("#txtnombres").val();
    var ap = $("#txtapepaterno").val();
    var am = $("#txtapematerno").val();
    var area = $("#slcarea").val();
    var puesto = $("#slcpuesto").val();

    if ((nombre == null || nombre == "") && (ap == null || ap == "") && (am == null || am == "") && (area == null || area == "") && (puesto == null || puesto == "")) {
        $("#div_error").show();
        $("#div_error").fadeOut(5000).html('Por favor debe ingresar o seleccionar al menos un criterio de búsqueda.');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                nombre: nombre,
                ap: ap,
                am: am,
                area: area,
                puesto: puesto
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_Resultado").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar buscar en el directorio con los criterios seleccionados.');
            }
        });
    }
}

function ValidarCodigoEmail(ParamUrl) {
    var idenvio = $("#hdfidvalidacion").val();
    var codigo = $("#txtcodigovalidacion").val();

    if (idenvio == null || idenvio == "") {
        $("#Div_MensajeJS").html("No se encontró el código de validación asociado al correo ingresado.");
        $('#ModalJS').modal('show');
    }
    else if (codigo == null || codigo == "" || codigo.length < 6) {
        $("#Div_MensajeJS").html("Por favor ingrese un código válido.");
        $('#ModalJS').modal('show');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: idenvio,
                codigo: codigo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                if (data.codigo == "KO") {
                    $("#Div_ResultadoValidacion").addClass("text-danger");
                    $("#Div_ResultadoValidacion").html(data.mensaje);
                    $("#Div_ResultadoValidacion").show();
                    $('#txtcodigovalidacion').focus();
                }
                else {
                    $("#Div_ResultadoValidacion").removeClass("text-danger");
                    $("#Div_ResultadoValidacion").hide();
                    $("#div_sendcode").hide();
                    $("#txtcorreopersonal").addClass("correovalidado");
                    $("#Div_MensajeJS").html(data.mensaje);
                    $('#ModalJS').modal('show');
                }
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeJS").html("Ocurrió un error al cargar la página con el resultado de la validación de correo.");
                $('#ModalJS').modal('show');
            }
        });
    }
}

function ValidarCodigoEmailWM(ParamUrl) {
    var idenvio = $("#hdfidvalidacion").val();
    var codigo = $("#txtcodigovalidacionWM").val();

    if (idenvio == null || idenvio == "") {
        $("#Div_MensajeJS").html("No se encontró el código de validación asociado al correo ingresado.");
        $('#ModalJS').modal('show');
    }
    else if (codigo == null || codigo == "" || codigo.length < 6) {
        $("#Div_MensajeJS").html("Por favor ingrese un código válido.");
        $('#ModalJS').modal('show');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: idenvio,
                codigo: codigo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                if (data.codigo == "KO") {
                    $("#Div_ResultadoValidacionWM").addClass("text-danger");
                    $("#Div_ResultadoValidacionWM").html(data.mensaje);
                    $("#Div_ResultadoValidacionWM").show();
                    $('#txtcodigovalidacionWM').focus();
                }
                else {
                    $("#Div_ResultadoValidacionWM").removeClass("text-danger");
                    $("#Div_ResultadoValidacionWM").hide();
                    $("#div_sendcodeWM").hide();
                    $("#txtcorreopersonalWM").addClass("correovalidado");
                    $("#Div_MensajeJS").html(data.mensaje);
                    $('#ModalJS').modal('show');
                }
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeJS").html("Ocurrió un error al cargar la página con el resultado de la validación de correo.");
                $('#ModalJS').modal('show');
            }
        });
    }
}

function MostrarHSemestre(ParamUrl, id) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            periodo: id
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#DivHorario").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información de horarios.');
        }
    });
}

function HorarioSemanal(ParamUrl, fecha, ano, semestre, pos) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            fecha: fecha,
            ano: ano,
            semestre: semestre,
            pos:pos
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_SemanalMobile").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la página de horario semanal.');
        }
    });
}

function CerrarModal() {
    $('.modal-backdrop').remove();
    $('body').removeClass("modal-open");
    $('body').removeAttr("style");
    $("#modalpub").html("");
}

function validateonlynumbers(field) {
    $("#" + field).val($("#" + field).val().replace(/[^0-9\.]/g, ''));
}