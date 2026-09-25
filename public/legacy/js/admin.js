
function cargarconsolidadobusquedas() {
    var ParamUrl = $("#idConbusqapp").val();
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {},
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $('.modal-backdrop').remove();
            $("#Div_ConsolidadoBusquedas").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar el consolidado de búsquedas.');
        }
    });
}

function CargarActualizarBusqueda(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar los datos del criterio de búsqueda seleccionado.');
        }
    });
}

function ConfirmarActualizarbusqueda(ParamUrl, id) {
    var descripcion = $("#txtdescripcionact").val();
    var activo = $("#SlcActivoact").val();
    var url = $("#txturlact").val();

    if (descripcion == null || descripcion == "") {
        $("#txtdescripcionact").css('border', '2px solid red');
    }
    else if (activo == null || activo == "") {
        $("#SlcActivoact").css('border', '2px solid red');
    }
    else if (url == null || url == "") {
        $("#txturlact").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                descripcion: descripcion,
                activo: activo,
                url: url
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                cargarconsolidadobusquedas();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar actualizar el criterio de búsqueda seleccionado.');
            }
        });
    }
}

function RegistrarBusqueda(ParamUrl) {
    var descripcion = $("#txtdescripcion").val();
    var perfil = $("#slcperfil").val();
    var url = $("#txtUrl").val();

    if (descripcion == null || descripcion == "") {
        $("#txtdescripcion").css('border', '2px solid red');
    }
    else if (perfil == null || perfil == "") {
        $("#slcperfil").css('border', '2px solid red');
    }
    else if (url == null || url == "") {
        $("#txtUrl").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                descripcion: descripcion,
                perfil: perfil,
                url: url
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                cargarconsolidadobusquedas();
                $("#Div_Resultado").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al cargar la página de gestión de búsquedas.');
            }
        });
    }
}

function ActualizarPublicidadLogin(ParamUrl, id) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {id: id},
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ModalAPL").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la información de la publicidad seleccioanda.');
        }
    });
}

function ConsolidadoPublicidadLogin() {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: $("#idconpublog").val(),
        data: { },
        cache: false,
        success: function (data) {
            stopAjaxLoading()
            $("#Div_ConsolidadoPublicidad").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading()
            alert('Ocurrió un error al intentar cargar el consolidado de publicidades registradas.');
        }
    });
}

function ConfirmarActualizarPublicidad(ParamUrl, id) {
    var activo = $("#SlcActivoU").val();
    var fechaini = $("#txtinicioUP").val();
    var fechafin = $("#txtfinUP").val();
    var ruta = $("#txtruta").val();
    var redirect = $("#txtredireccion").val();
    var movil = $("#SlcMovilU").val();

    if (activo == null || activo == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor indique si la publicidad se encuentra activa.');
        $("#Div_ErrorMJS").focus();
    }
    else if (fechaini == null || fechaini == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la fecha de inicio para la publicidad.');
        $("#Div_ErrorMJS").focus();
    }
    else if (fechafin == null || fechafin == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la fecha fin para la publicidad.');
        $("#Div_ErrorMJS").focus();
    }
    else if (ruta == null || ruta == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la ruta de la imagen o video.');
        $("#Div_ErrorMJS").focus();
    }
    else if (movil == null || movil == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor indique si la publicidad será visible en dispositivos móviles.');
        $("#Div_ErrorMJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                ruta: ruta,
                fecIni: fechaini,
                FecFin: fechafin,
                activo: activo,
                redireccion: redirect,
                movil: movil
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                ConsolidadoPublicidadLogin();
                $('.modal-backdrop').remove();
                $("#Div_ModalAPL").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                alert('Ocurrió un error al intentar actualizar la publicidad.');
            }
        });
    }
}

function NuevaPublicidad(ParamUrl) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {},
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ModalAPL").html(data);
        },
        error: function (jqXHR, status, error) {
            alert('Ocurrió un error al intentar cargar la pagina de registro de publicidades.');
        }
    });
}

function RegistrarPublicidad(ParamUrl) {
    var activo = $("#SlcActivo").val();
    var fechaini = $("#txtinicioP").val();
    var fechafin = $("#txtfinP").val();
    var ruta = $("#txtruta").val();
    var redirect = $("#txtredireccion").val();
    var titulo = $("#txttitulo").val();
    var tipo = $("#slctipo").val();
    var movil = $("#Slcmovil").val();

    if (activo == null || activo == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor indique si la publicidad se encuentra activa.');
        $("#Div_ErrorMJS").focus();
    }
    else if (fechaini == null || fechaini == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la fecha de inicio para la publicidad.');
        $("#Div_ErrorMJS").focus();
    }
    else if (fechafin == null || fechafin == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la fecha fin para la publicidad.');
        $("#Div_ErrorMJS").focus();
    }
    else if (ruta == null || ruta == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la ruta de la imagen o video.');
        $("#Div_ErrorMJS").focus();
    }
    else if (titulo == null || titulo == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese un nombre para la publicidad.');
        $("#Div_ErrorMJS").focus();
    }
    else if (tipo == null || tipo == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor seleccione el tipo de publicidad.');
        $("#Div_ErrorMJS").focus();
    }
    else if (movil == null || movil == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor indique si la publicidad será visible en dispositivos móviles.');
        $("#Div_ErrorMJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                ruta: ruta,
                fecIni: fechaini,
                FecFin: fechafin,
                activo: activo,
                redireccion: redirect,
                tipo: tipo,
                titulo: titulo,
                movil: movil
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                
                ConsolidadoPublicidadLogin();
                $('.modal-backdrop').remove();
                $("#Div_ModalAPL").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar actualizar la publicidad.');
            }
        });
    }
}

function CargarCarreras(ParamUrl) {
    var periodo = $("#slcperiodo").val();

    if (periodo == null || periodo == "") {
        $("#Div_Programa").html("");
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                periodo: periodo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_Programa").html(data);
            },
            error: function (jqXHR, status, error) {
                alert('Ocurrió un error al cargar las carreras.');
            }
        });
    }

}

function NuevoRegDPI(ParamUrl) {
    var periodo = $("#slcperiodo").val();
    var producto = $("#slcCarrera").val();
    var activo = $("#SlcActivo").val();
    var limite = $("#txtvalor").val();
    var notificacion = $("#txtnotificacion").val();
    var limiteprevio = $("#txtvalorprevia").val();
    var notificacionprevia = $("#txtnotificacionprevia").val();

    if (periodo == null || periodo == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor seleccione un periodo.');
        $("#Div_ErrorJS").focus();
    }
    else if (activo == null || activo == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor indique si el reglamento se encuentra activo.');
        $("#Div_ErrorJS").focus();
    }
    else if (producto == null || producto == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor seleccione un programa.');
        $("#Div_ErrorJS").focus();
    }
    else if (limite == null || limite == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por ingrese el limite de faltas para el cálculo del DPI.');
        $("#Div_ErrorJS").focus();
    }
    else if (limiteprevio == null || limiteprevio == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por ingrese el limite previo de faltas para realizar la notificación al alumno.');
        $("#Div_ErrorJS").focus();
    }
    else if (notificacion == null || notificacion == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por ingrese el mensaje con el cual se notificará al alumno.');
        $("#Div_ErrorJS").focus();
    }
    else if (notificacionprevia == null || notificacionprevia == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por ingrese el mensaje con el cual se notificará al alumno cuando este por llegar al límite de inasistencias (notif. previa).');
        $("#Div_ErrorJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                periodo: periodo,
                producto: producto,
                limite: limite,
                activo: activo,
                notificacion: notificacion,
                limiteprevio: limiteprevio,
                notificacionprevia: notificacionprevia
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                ConsolidadoReglamentoDPI();
                $('.modal-backdrop').remove();
                $("#Div_Modaldpi").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar registrar el reglamento de DPI.');
            }
        });
    }
}

function ConsolidadoReglamentoDPI() {
    var ParamUrl = $("#idConRegDPI").val();
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {},
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $('.modal-backdrop').remove();
            $("#Div_ConsolidadoRegDPI").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar el consolidado de reglamentos registrados.');
        }
    });
}

function CargarActualizarRegDPI(ParamUrl, periodo, producto) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            periodo: periodo,
            producto: producto
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_Modaldpi").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información del reglamento.');
        }
    });
}

function ConfirmarActualizarRegDPI(ParamUrl) {
    var periodo = $("#hdfperiodo").val();
    var producto = $("#hdfproducto").val();
    var activo = $("#SlcActivoAA").val();
    var limite = $("#txtlimiteAA").val();
    var notificacion = $("#txtnotificacionAA").val();
    var limiteprevia = $("#txtlimitePrevioAA").val();
    var notificacionprevia = $("#txtnotificacionPreviaAA").val();

    if (activo == null || activo == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor indique si el reglamento se encuentra activo.');
        $("#Div_ErrorMJS").focus();
    }
    else if (limite == null || limite == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por ingrese el limite de faltas para el cálculo del DPI.');
        $("#Div_ErrorMJS").focus();
    }
    else if (notificacion == null || notificacion == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por ingrese el mensaje con el cual se notificará al alumno.');
        $("#Div_ErrorMJS").focus();
    }
    else if (limiteprevia == null || limiteprevia == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por ingrese el limite previo de faltas para realizar la notificación al alumno.');
        $("#Div_ErrorMJS").focus();
    }
    else if (notificacionprevia == null || notificacionprevia == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por ingrese el mensaje con el cual se notificará al alumno cuando este por llegar al límite de inasistencias (notif. previa).');
        $("#Div_ErrorMJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                periodo: periodo,
                producto: producto,
                limite: limite,
                activo: activo,
                notificacion: notificacion,
                limiteprevia: limiteprevia,
                notificacionprevia: notificacionprevia
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                ConsolidadoReglamentoDPI();
                $('.modal-backdrop').remove();
                $("#Div_Modaldpi").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                alert('Ocurrió un error al intentar actualizar el reglamento de DPI.');
            }
        });
    }
}

function NuevoRegActDat(ParamUrl) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {           
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ModalRAD").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información del reglamento.');
        }
    });
}

function RegistrarRegAD(ParamUrl) {
    var fecini = $("#txtfechainicio").val();
    var fecfin = $("#txtfechafin").val();
    var obligatorio = $("#Slcobligatorio").val();
    var tipo = $("#Slctipousuario").val();
    var mensaje = $("#txtmensajebloqueo").val();

    var selected = [];
    $('input[type=checkbox]:checked').each(function () {
        selected.push($(this).attr('name'));        
    });

    if (fecini == null || fecini == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor ingrese la fecha de inicio de la campaña.');
        $("#Div_ErrorJS").focus();
    }
    else if (fecfin == null || fecfin == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por ingrese la fecha fin para la campaña.');
        $("#Div_ErrorJS").focus();
    }
    else if (obligatorio == null || obligatorio == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor indique si la campaña es obligatoria.');
        $("#Div_ErrorJS").focus();
    }
    else if (tipo == null || tipo == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor indique el tipo de usuario al que se encuentra dirigido la campaña.');
        $("#Div_ErrorJS").focus();
    }
    else if (selected.length == 0) {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor seleccione los campos que serán actualizables en la campaña.');
        $("#Div_ErrorJS").focus();
    }
    else if (mensaje == null || mensaje == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor ingrese el campo a mostrar para los campos que no puedes ser actualizados.');
        $("#Div_ErrorJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                fechainicio: fecini,
                fechafin: fecfin,
                obligatorio: obligatorio,
                tipo: tipo,
                campos: selected,
                mensaje: mensaje
            },
            cache: false,
            success: function (data) {
                ConsolidadoReglamentoActualizacionDatos();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_ModalRAD").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                alert('Ocurrió un error al intentar registrar el reglamento para la actualización de datos.');
            }
        });
    }
}

function ConsolidadoReglamentoActualizacionDatos() {

    var ParamUrl = $("#idConRegAD").val();
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {            
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ConsolidadoRegActDat").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar el consolidado de reglamentos de actualización de datos registrados.');
        }
    });
}

function CargarActualizarRegActDatos(ParamUrl, id) {
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
            $("#Div_ModalRAD").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la página para actualizar el reglamento.');
        }
    });
}

function VerRegActDatos(ParamUrl, id) {
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
            $("#Div_ModalRAD").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la página.');
        }
    });
}

function ConfirmarActualizarRegAD(ParamUrl, id) {
    var fecini = $("#txtfechainicioA").val();
    var fecfin = $("#txtfechafinA").val();
    var obligatorio = $("#SlcobligatorioA").val();
    var mensaje = $("#txtmensajebloqueoact").val();

    var selected = [];
    $('#Div_chk input[type=checkbox]:checked').each(function () {
        selected.push($(this).attr('name'));
    });

    if (fecini == null || fecini == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese la fecha de inicio de la campaña.');
        $("#Div_ErrorMJS").focus();
    }
    else if (fecfin == null || fecfin == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por ingrese la fecha fin para la campaña.');
        $("#Div_ErrorMJS").focus();
    }
    else if (obligatorio == null || obligatorio == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor indique si la campaña es obligatoria.');
        $("#Div_ErrorMJS").focus();
    }
    else if (selected.length == 0) {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor seleccione los campos que serán actualizables en la campaña.');
        $("#Div_ErrorMJS").focus();
    }
    else if (mensaje == null || mensaje == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por favor ingrese el mensaje a mostrar para los campos bloqueados.');
        $("#Div_ErrorMJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                fechainicio: fecini,
                fechafin: fecfin,
                obligatorio: obligatorio,
                campos: selected,
                mensaje: mensaje
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                ConsolidadoReglamentoActualizacionDatos();
                $('.modal-backdrop').remove();
                $("#Div_ModalRAD").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar actualizar el reglamento para la actualización de datos.');
            }
        });
    }
}

function NuevoEvento(ParamUrl) {
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {            
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ModalEventos").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la página de registro de eventos.');
        }
    });
}

function BuscarDocenteAdmin(ParamUrl) {

    if ($("#txtusuario").val().length < 3 && $("#txtnombres").val().length < 3 && $("#txtapepat").val().length < 3 && $("#txtapemat").val().length < 3) {
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
                codigo: $("#txtusuario").val(),
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

function BuscarAlumnoAdmin(ParamUrl) {
    if ($("#txtusuario").val().length < 3 && $("#txtnombres").val().length < 3 && $("#txtapepat").val().length < 3 && $("#txtapemat").val().length < 3) {
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
                codigo: $("#txtusuario").val(),
                nombres: $("#txtnombres").val(),
                apepat: $("#txtapepat").val(),
                apemat: $("#txtapemat").val()
            },
            cache: false,            
            success: function (data) {               
                $("#Div_ResultadoBusqAlu").html(data);                
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar realizar la búsqueda de alumnos con los parámetros ingresados.');
            }
        });

        stopAjaxLoading();
    }

}

function CargarDatosDocenteAdmin(ParamUrl, id) {
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

function CargarHorarioDocentePeriodo(ParamUrl, id) {
    var periodo = $("#slcPeriodo").val();

    if (periodo == null || periodo =='') {
        $("#HorariosSemestreDocente").html("");
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                periodo: periodo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#HorariosSemestreDocente").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar cargar el horario para el periodo seleccionado.');
            }
        });
    }
}

function ReporteNotificaciones(ParamUrl) {
    var campana = $("#slccampana").val();
    var fecini = $("#txtinicio").val();
    var usuario = $("#txtusuario").val();

    if ((fecini == null || fecini == '') && (usuario == null || usuario == "") && (campana == null || campana == "")) {
        $("#Div_MensajeErrorMd").html("Por favor seleccione al menos un criterio de búsqueda");
        $('#ModalErrorReporte').modal('show');
    }    
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                campana: campana,
                fecini: fecini,
                usuario: usuario
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_Resultado").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeErrorMd").html("Ocurrió un error al intentar cargar el reporte de notificaciones con los parametros seleccionados.");
                $('#ModalErrorReporte').modal('show');                
            }
        });
    }
}

function CargarConsolidadoDocumentosCargados() {
    var ParamUrl = $("#IdConDocCarPro").val();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {            
        },
        cache: false,
        success: function (data) {
            $("#Div_ConsolidadoDocumentos").html(data);
        },
        error: function (jqXHR, status, error) {
            $("#Div_MensajeError").html("Ocurrió un error al intentar cargar el consolidado de documentos cargados.");
            $('#ModalErrorCampos').modal('show');
        }
    });
}

function ActualizarDocumentoCargado(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            $("#Div_MensajeError").html("Ocurrió un error al cargar la información del documento seleccionado.");
            $('#ModalErrorCampos').modal('show');
        }
    });
}

function ConfirmarActualizarDocCargado(ParamUrl, id) {
    var titulo = $("#txtnombreact").val();
    var activo = $("#slcActivoAct").val();

    if (titulo == null || titulo == "") {

    }
    else if (activo == null || activo == "") {

    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                titulo: titulo,
                activo: activo
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoDocumentosCargados();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeError").html("Ocurrió un error al intentar actualizar el documento seleccionado.");
                $('#ModalErrorCampos').modal('show');
            }
        });
    }
}

function RegistrarCampanaDocumentos(ParamUrl) {
    var titulo = $("#txtnombrecamp").val();
    var programa = $("#SlcProgramacamp").val();
    var tipoarchivo = $("#slctipoarchivo").val();
    var fechainicio = $("#txtfechainicio").val();
    var fechafin = $("#txtfechafin").val();
    var tipodoc = $("#slctipodocumento").val();
    var obligatorio = $("#SlcObligatorio").val();
    var notifica = $("#Slcnotificacion").val();
    
    if (titulo == null | titulo == '') {
        $("#Div_MensajeError").html("Por favor ingrese un nombre para el reglamento.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (programa == null || programa == '') {
        $("#Div_MensajeError").html("Por favor seleccione un programa.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (tipoarchivo == null || tipoarchivo == "") {
        $("#Div_MensajeError").html("Por favor seleccione el tipo de archivo.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (fechainicio == null || fechainicio == "") {
        $("#Div_MensajeError").html("Por favor seleccione la fecha de inicio para la campaña.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (fechafin == null || fechafin == "") {
        $("#Div_MensajeError").html("Por favor seleccione la fecha fin para la campaña.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (obligatorio == null || obligatorio == "") {
        $("#Div_MensajeError").html("Por favor indique si la campaña es obligatoria.");
        $('#ModalErrorCampos').modal('show');
    }
    else if (tipodoc == null || tipodoc == "") {
        $("#Div_MensajeError").html("Por favor indique el tipo de documento para la campaña.");
        $('#ModalErrorCampos').modal('show');

    }
    else if (notifica == null || notifica == "") {
        $("#Div_MensajeError").html("Por favor indique si se enviarán notificaciones al cargar el documento.");
        $('#ModalErrorCampos').modal('show');

    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                titulo: titulo,
                programa: programa,
                tipo: tipoarchivo,
                fechainicio: fechainicio,
                fechafin: fechafin,
                tipodoc: tipodoc,
                obligatorio: obligatorio,
                notifica: notifica
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoRegCargaDocs();
                stopAjaxLoading();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeError").html("Ocurrió un error al intentar registrar la campaña.");
                $('#ModalErrorCampos').modal('show');
            }
        });
    }
}

function CargarConsolidadoRegCargaDocs() {
    var ParamUrl = $("#IdConRegcCarDoc").val();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
        },
        cache: false,
        success: function (data) {
            $("#Div_ConsolidadoReglamentos").html(data);
        },
        error: function (jqXHR, status, error) {
            $("#Div_MensajeError").html("Ocurrió un error al intentar cargar el consolidado de reglamentos.");
            $('#ModalErrorCampos').modal('show');
        }
    });
}

function CargarActualizaReglamentoDocumento(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            $("#Div_MensajeError").html("Ocurrió un error al intentar cargar la información del reglamento seleccionado.");
            $('#ModalErrorCampos').modal('show');
        }
    });
}

function ConfirmarActualizarRegDocCargado(ParamUrl, id) {
    var titulo = $("#txtnombreact").val();
    var activo = $("#slcActivoAct").val();
    var fi = $("#txtfeciniupd").val();
    var ff = $("#txtfecfinupd").val();
    var obligatorio = $("#slcObligatorioAct").val();
    var notificar = $("#slcnotificact").val();

    if (titulo == null || titulo == "" || activo == null || activo == "" || fi == null || fi == "" || ff == null || ff == ""
        || obligatorio == null || obligatorio == "" || notificar == null || notificar == "") {

    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                titulo: titulo,
                activo: activo,
                fechainicio: fi, 
                fechafin: ff,
                obligatorio: obligatorio,
                notificar: notificar
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoRegCargaDocs();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeError").html("Ocurrió un error al intentar actualizar el reglamento seleccionado.");
                $('#ModalErrorCampos').modal('show');
            }
        });
    }
}

function ConfirmarRegistroArea(ParamUrl) {
    var nombre = $("#txtnombre").val();

    if (nombre == null || nombre == "") {
        $("#txtnombre").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                nombre: nombre
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoAreas();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar registrar el área.");                
            }
        });
    }
}

function CargarConsolidadoAreas() {
    var ParamUrl = $("#IdConDirArea").val();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
        },
        cache: false,
        success: function (data) {
            $("#Div_ConsolidadoAreas").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el consolidado de áreas.");            
        }
    });
}

function CargarActualizarArea(ParamUrl, id) {
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            id: id
        },
        cache: false,
        success: function (data) {
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el la información del área seleccionada.");
        }
    });
}

function ConfirmarActualizarArea(ParamUrl, id) {
    var nombre = $("#txtnombreact").val();
    var activo = $("#SlcActivoact").val();

    if (nombre == null || nombre == "") {
        $("#txtnombreact").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                nombre: nombre,
                activo : activo
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoAreas();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar actualizar el área.");
            }
        });
    }
}

function ConfirmarRegistroUbicacion(ParamUrl) {
    var nombre = $("#txtnombre").val();

    if (nombre == null || nombre == "") {
        $("#txtnombre").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                nombre: nombre
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoUbicaciones();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar registrar la ubicación.");
            }
        });
    }
}

function CargarConsolidadoUbicaciones() {
    var ParamUrl = $("#IdConDirUbica").val();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
        },
        cache: false,
        success: function (data) {
            $("#Div_ConsolidadoUbicaciones").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el consolidado de ubicaciones.");
        }
    });
}

function CargarActualizarUbicacion(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el la información de la ubicación seleccionada.");
        }
    });
}

function ConfirmarActualizarUbicacion(ParamUrl, id) {
    var nombre = $("#txtnombreact").val();
    var activo = $("#SlcActivoact").val();

    if (nombre == null || nombre == "") {
        $("#txtnombreact").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                nombre: nombre,
                activo: activo
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoUbicaciones();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar actualizar la ubicación.");
            }
        });
    }
}

function ConfirmarRegistroPuesto(ParamUrl) {
    var nombre = $("#txtnombre").val();

    if (nombre == null || nombre == "") {
        $("#txtnombre").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                nombre: nombre
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoPuestos();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar registrar el área.");
            }
        });
    }
}

function CargarConsolidadoPuestos() {
    var ParamUrl = $("#IdConDirPuesto").val();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ConsolidadoPuestos").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el consolidado de puestos.");
        }
    });
}

function CargarActualizarPuesto(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el la información del puesto seleccionado.");
        }
    });
}

function ConfirmarActualizarPuesto(ParamUrl, id) {
    var nombre = $("#txtnombreact").val();
    var activo = $("#SlcActivoact").val();

    if (nombre == null || nombre == "") {
        $("#txtnombreact").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                nombre: nombre,
                activo: activo
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoPuestos();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar actualizar el puesto.");
            }
        });
    }
}

function ConfirmarRegistroEmpleado(ParamUrl) {
    var nombre = $("#txtnombres").val();
    var ap = $("#txtapepaterno").val();
    var am = $("#txtapematerno").val();
    var activo = $("#slcactivo").val();
    var correo = $("#txtcorreo").val();
    var telefono = $("#txttelefono").val();
    var area = $("#slcarea").val();
    var ubicacion = $("#slcubicacion").val();
    var puesto = $("#slcpuesto").val();
    var usuario = $("#codusuario").val();

    if (nombre == null || nombre == "") {
        $("#txtnombres").css('border', '2px solid red');
    }
    else if (ap == null || ap == "") {
        $("#txtapepaterno").css('border', '2px solid red');
    }
    else if (activo == null || activo == "") {
        $("#slcactivo").css('border', '2px solid red');
    }
    else if (area == null || area == "") {
        $("#slcarea").css('border', '2px solid red');
    }
    else if (ubicacion == null || ubicacion == "") {
        $("#slcubicacion").css('border', '2px solid red');
    }
    else if (puesto == null || puesto == "") {
        $("#slcpuesto").css('border', '2px solid red');
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
                am:am,
                activo: activo,
                correo: correo,
                telefono: telefono,
                area: area,
                ubicacion: ubicacion,
                puesto: puesto,
                usuario: usuario
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoPuestos();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar registrar al empleado.");
            }
        });
    }
}

function CargarConsolidadoEmpleados() {
    var ParamUrl = $("#IdConDirEmp").val();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ConsolidadoEmpleado").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el consolidado de empleados.");
        }
    });
}

function CargarActualizarEmpleado(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);
        },
        error: function (jqXHR, status, error) {
            alert("Ocurrió un error al intentar cargar el la información del empleado seleccionado.");
        }
    });
}

function ConfirmarActualizarEmpleado(ParamUrl, id) {
    var nombre = $("#txtnombreact").val();
    var ap = $("#txtapepact").val();
    var am = $("#txtApematact").val();
    var activo = $("#SlcActivoact").val();
    var correo = $("#txtcorreoact").val();
    var telefono = $("#txttelefonoact").val();
    var area = $("#slcareaact").val();
    var ubicacion = $("#slcubicacionact").val();
    var puesto = $("#slcpuestoact").val();
    var usuario = $("#txtusuariooact").val();

    if (nombre == null || nombre == "") {
        $("#txtnombreact").css('border', '2px solid red');
    }
    else if (ap == null || ap == "") {
        $("#txtapepact").css('border', '2px solid red');
    }
    else if (activo == null || activo == "") {
        $("#SlcActivoact").css('border', '2px solid red');
    }
    else if (area == null || area == "") {
        $("#slcareaact").css('border', '2px solid red');
    }
    else if (ubicacion == null || ubicacion == "") {
        $("#slcubicacionact").css('border', '2px solid red');
    }
    else if (puesto == null || puesto == "") {
        $("#slcpuestoact").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                nombre: nombre,
                ap: ap,
                am: am,
                activo: activo,
                correo: correo,
                telefono: telefono,
                area: area,
                ubicacion: ubicacion,
                puesto: puesto,
                usuario: usuario
            },
            cache: false,
            success: function (data) {
                CargarConsolidadoEmpleados();
                stopAjaxLoading();
                $('.modal-backdrop').remove();
                $("#Div_Resultado").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert("Ocurrió un error al intentar actualizar el empleado.");
            }
        });
    }
}

function CargarDatosAlumnoAdmin(ParamUrl, id) {
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
            $("#Div_ResultadoBusqAlu").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar la información del alumno seleccionado.');
        }
    });
}

function cargarseccion(id) {
    var ParamUrl = $("#slcOpciones").val();

    if (ParamUrl == null || ParamUrl == "") {

    }
    else {
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
                $("#Div_ConsolidadoInformacion").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar cargar la información para la sección seleccionada.');
            }
        });
    }
    
}

function CargarInasistenciasPeriodo(ParamUrl, id) {
    var periodo = $("#slcPeriodo").val();

    if (periodo == null || periodo == "") {

    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                periodo: periodo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ConsolidadoInformacion").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar cargar la información de inasistencias.');
            }
        });
    }
}

function NuevoCampNot(ParamUrl) {
    var nombre = $("#txtnombre").val();
    var activo = $("#SlcActivo").val();

    if (nombre == null || nombre == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por ingrese un nombre para la campaña.');
        $("#Div_ErrorJS").focus();
    }
    else if (activo == null || activo == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por favor indique si la campaña se encontrará activa.');
        $("#Div_ErrorJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                nombre: nombre,
                activo: activo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                ConsolidadoCampanasNotificacion();
                $("#Div_ModalCampanaNotificaciones").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar realizar el registro de la campaña para notificaciones.');
            }
        });
    }
}

function ConsolidadoCampanasNotificacion() {
    var ParamUrl = $("#idConCampNot").val();

    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {            
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ConsolidadoCampanaNotificacion").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar el consolidado de campañas para notificaciones.');
        }
    });
}

function CargarActualizarCampNot(ParamUrl, id) {

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
            $("#Div_ModalCampanaNotificaciones").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar el la información de la campaña seleccionada.');
        }
    });
}

function ConfirmarActualizarCampNot(ParamUrl, id) {
    var nombre = $("#txtnombreact").val();
    var activo = $("#SlcActivoact").val();

    if (nombre == null || nombre == "") {
        $("#txtnombreact").css('border', '2px solid red');
    }
    else if (activo == null || activo == "") {
        $("#SlcActivoact").css('border', '2px solid red');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                nombre: nombre,
                activo: activo
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                ConsolidadoCampanasNotificacion();
                $('.modal-backdrop').remove();
                $("#Div_ModalCampanaNotificaciones").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar realizar el registro de la campaña para notificaciones.');
            }
        });
    }
}

function ConfirmarActNotMas(ParamUrl) {
    var campana = $("#Slccampanamasivo").val();
    var activo = $("#SlcActivo").val();
    var fecini = $("#txtfecini").val();
    var fecfin = $("#txtfecfin").val();

    if (campana == null || campana == "") {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Por seleccione una campaña.');
        $("#Div_ErrorJS").focus();
    }
    else if ((campana == null || campana == "") && (fecini == null || fecini == "") && (fecfin == null || fecfin == "")) {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Debe actualizar al menos un campo.');
        $("#Div_ErrorJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                campana: campana,
                activo: activo,
                fecini: fecini,
                fecfin: fecfin
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ModalActualizacionNotificaciones").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar realizar el registro de la campaña para notificaciones.');
            }
        });
    }
}

function BuscarNotificacionPorFiltro(ParamUrl) {
    var campana = $("#Slccampanaindividual").val();
    var usuario = $("#txtcodusuario").val();

    if ((campana == null || campana == "") && (usuario == null || usuario == "")) {
        $("#Div_ErrorJS").show();
        $("#Div_ErrorJS").fadeOut(5000).html('Debe de seleccionar al menos un criterio de búsqueda.');
        $("#Div_ErrorJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                campana: campana,
                usuario: usuario
                
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ResultadoBusqueda").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar realizar el cargar las notificaciones con los parámetros seleccionados.');
            }
        });
    }
}

function CargarActualizarNotIndividual(ParamUrl, id) {
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
            $("#Div_ModalActualizacionNotificaciones").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al intentar cargar los datos de la notificación seleccionada.');
        }
    });
}

function ConfirmarActualizarNotificacionInd(ParamUrl, id) {
    var campana = $("#slccampanaactind").val();
    var activo = $("#SlcActivoAA").val();
    var fecini = $("#txtfeciniAA").val();
    var fecfin = $("#txtfecfinAA").val();
    var url = $("#idbusnotfil").val();

    if (campana == null || campana == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Por seleccione una campaña.');
        $("#Div_ErrorMJS").focus();
    }
    else if (activo == null || activo == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Debe indicar si notificación se encuentra activa.');
        $("#Div_ErrorMJS").focus();
    }
    else if (fecini == null || fecini == "") {
        $("#Div_ErrorMJS").show();
        $("#Div_ErrorMJS").fadeOut(5000).html('Debe indicar la fecha de inicio para la notificación.');
        $("#Div_ErrorMJS").focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                campana: campana,
                activo: activo,
                fecini: fecini,
                fecfin: fecfin
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                BuscarNotificacionPorFiltro(url);
                $('.modal-backdrop').remove();
                $("#Div_ModalActualizacionNotificaciones").html(data);
                $('body').css({
                    overflow: 'visible'
                });
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al intentar actualizar la información de la notificación.');
            }
        });
    }
}

function ReporteAccesos(ParamUrl, pageNumber, pageSize ) {

    var fechainicio = $("#txtinicio").val();
    var fechafin = $("#txtfin").val();
    var usuario = $("#txtusuario").val();

    if ((fechainicio == null || fechainicio == "") && (fechafin == null || fechafin == "") && (usuario == null || usuario == "")) {
        $("#Div_MensajeErrorMd").fadeOut(5000).html('Debe ingresar al menos un parámetro de búsqueda.');
        $('#ModalErrorReporte').modal('show');
    }
    else if (fechainicio != null && fechainicio != "" && (fechafin == null || fechafin == "")) {
        $("#Div_MensajeErrorMd").fadeOut(5000).html('Debe ingresar ingresar la fecha de fin.');
        $('#ModalErrorReporte').modal('show');
    }
    else if (fechafin != null && fechafin != "" && (fechainicio == null || fechainicio == "")) {
        $("#Div_MensajeErrorMd").fadeOut(5000).html('Debe ingresar ingresar la fecha de inicio.');
        $('#ModalErrorReporte').modal('show');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                fechainicio: fechainicio,
                fechafin: fechafin,
                usuario: usuario,
                pageNumber: pageNumber,
                pageSize: pageSize
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_Resultado").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeErrorMd").html('Ocurrió un error al intentar actualizar la información de la notificación.');
                $('#ModalErrorReporte').modal('show');
            }
        });
    }
    
}

function BuscarReporteAccesosPag(ParamUrl, pageNumber, pageSize) {

    var fechainicio = $("#txtinicio").val();
    var fechafin = $("#txtfin").val();
    var usuario = $("#txtusuario").val();

    if ((fechainicio == null || fechainicio == "") && (fechafin == null || fechafin == "") && (usuario == null || usuario == "")) {
        $("#Div_MensajeErrorMd").fadeOut(5000).html('Debe ingresar al menos un parámetro de búsqueda.');
        $('#ModalErrorReporte').modal('show');
    }
    else if (fechainicio != null && fechainicio != "" && (fechafin == null || fechafin == "")) {
        $("#Div_MensajeErrorMd").fadeOut(5000).html('Debe ingresar ingresar la fecha de fin.');
        $('#ModalErrorReporte').modal('show');
    }
    else if (fechafin != null && fechafin != "" && (fechainicio == null || fechainicio == "")) {
        $("#Div_MensajeErrorMd").fadeOut(5000).html('Debe ingresar ingresar la fecha de inicio.');
        $('#ModalErrorReporte').modal('show');
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                fechainicio: fechainicio,
                fechafin: fechafin,
                usuario: usuario,
                pageNumber: pageNumber,
                pageSize: pageSize
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#div_busquedapag").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                $("#Div_MensajeErrorMd").html('Ocurrió un error al intentar actualizar la información de la notificación.');
                $('#ModalErrorReporte').modal('show');
            }
        });
    }

}

function SendForm(id) {
    document.getElementById(id).submit();
}

function CargarActualizarDocumentoCampanaUsuario(ParamUrl, id) {
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
            $("#Div_ResultadoCarga").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la información del documento');
        }
    });
}

function ConfirmarDocumentoUsuario(ParamUrl, status, id, idreg) {
    $('#ModalAprobarDocumento').modal('hide');
    showAjaxLoading();
    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            status: status,
            documentoid: id
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();                  
            $('.modal-backdrop').remove();
            var select = document.querySelector('#slcestadocargadoc');
            select.value = 3;
            select.dispatchEvent(new Event('change'));

            $("#Div_modalresultado").html(data);
            $('body').css({
                overflow: 'visible'
            });
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            $('.modal-backdrop').remove();
            alert('Ocurrió un error al evaluar el documento.');
        }
    });
}

function CargarConsolidadoDocumentosCampana(id) {
    var ParamUrl = $("#Idcondoccamp").val();

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
            $("#Div_Consolidadocumentoscampana").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar el consolidado de documentos.');
        }
    });
}

function CargarDetalleRegCampDocumentos(ParamUrl, id) {

    var estado = $("#slcestadocargadoc").val();

    if (estado == null || estado == "") {

    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                key: id,
                estado: estado
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ResultadoDetalle").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading();
                alert('Ocurrió un error al cargar el consolidado de documentos cargados.');
            }
        });
    }
}

function CargarConsolidadoImagenes() {
    var ParamUrl = $("#idconimgRep").val();
    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ConsolidadoImagenes").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar el consolidado de documentos cargados.');
        }
    });
}

function EstablecerVigente(ParamUrl, id) {
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
            $("#Div_ModalMalla").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function RegistrarTipoDocumentoCamp(ParamUrl) {
    var nombre = $("#txtnombre").val();

    if (nombre == null || nombre == "") {
        return;
    }

    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            nombre: nombre
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_Resultado").html(data);
            CargarConsolidadotipodocumento();
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function CargarConsolidadotipodocumento() {
    var ParamUrl = $("#idcontipdoc").val();
    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {

        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_ConsolidadoTipoDoc").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar el consolidado de documentos cargados.');
        }
    });
}

function CargarActualizaTipoDocCampana(ParamUrl, id) {
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
            $("#Div_Resultado").html(data);            
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function ConfirmarActualizarTipodocumento(ParamUrl, id) {
    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            id: id,
            activo: $("#SlcActivoAA").val()
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#Div_Resultado").html(data);
            $('.modal-backdrop').remove();
            CargarConsolidadotipodocumento();
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function cargardepartamentos(ParamUrl) {
    $("#div_departamento").html("");
    $("#div_departamentowm").html("");
    $("#div_provinciawm").html("");
    $("#div_provincia").html("");
    $("#div_distritoswm").html("");
    $("#div_distritos").html("");

    var pais = "";    
    if (($("#slcpais").val() == null || $("#slcpais").val() == "") && ($("#slcpaisWM").val() == null || $("#slcpaisWM").val() == "")) {
        return;
    }
    if ($("#slcpais").val() == null || $("#slcpais").val() == "") {
        pais = $("#slcpaisWM").val();
        $("#slcpais").val($("#slcpaisWM").val());  
    }
    else {
        pais = $("#slcpais").val();
        $("#slcpaisWM").val($("#slcpais").val());
    }

    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            pais: pais
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#div_departamento").html(data);
            data = data.replace("slcdepartamento", "slcdepartamentoWM");
            $("#div_departamentowm").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function Cargarprovincias(ParamUrl) {
    $("#div_provinciawm").html("");
    $("#div_provincia").html("");
    $("#div_distritoswm").html("");
    $("#div_distritos").html("");

    var departamento = "";
    
    if (($("#slcdepartamento").val() == null || $("#slcdepartamento").val() == "") && ($("#slcdepartamentoWM").val() == null || $("#slcdepartamentoWM").val() == "")) {
        return;
    }
    if ($("#slcdepartamento").val() == null || $("#slcdepartamento").val() == "") {
        departamento = $("#slcdepartamentoWM").val();
        $("#slcdepartamento").val($("#slcdepartamentoWM").val());
    }
    else {
        departamento = $("#slcdepartamento").val();
        $("#slcdepartamentoWM").val($("#slcdepartamento").val());
    }

    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            departamento: departamento
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#div_provincia").html(data);
            data = data.replace("slcprovincia", "slcprovinciaWM");
            $("#div_provinciawm").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function cargardistritos(ParamUrl) {
    $("#div_distritoswm").html("");
    $("#div_distritos").html("");
    
    var provincia = "";
    
    if (($("#slcprovincia").val() == null || $("#slcprovincia").val() == "") && ($("#slcprovinciaWM").val() == null || $("#slcprovinciaWM").val() == "")) {
        return;
    }
    if ($("#slcprovincia").val() == null || $("#slcprovincia").val() == "") {
        provincia = $("#slcprovinciaWM").val();
        $("#slcprovincia").val($("#slcprovinciaWM").val());
    }
    else {
        provincia = $("#slcprovincia").val();
        $("#slcprovinciaWM").val($("#slcprovincia").val());
    }

    showAjaxLoading();

    $.ajax({
        async: true,
        type: "POST",
        url: ParamUrl,
        data: {
            provincia: provincia
        },
        cache: false,
        success: function (data) {
            stopAjaxLoading();
            $("#div_distritos").html(data);
            data = data.replace("slcdistrito", "slcdistritoWM");
            $("#div_distritoswm").html(data);
        },
        error: function (jqXHR, status, error) {
            stopAjaxLoading();
            alert('Ocurrió un error al cargar la página.');
        }
    });
}

function BuscarReporteActDatos(ParamUrl) {
    showAjaxLoading();

    if (($("#slccampana").val() == null || $("#slccampana").val() == "") &&
        ($("#txtinicio").val() == null || $("#txtinicio").val() == "") &&
        ($("#txtfin").val() == null || $("#txtfin").val() == "") &&
        ($("#txtalumno").val() == null || $("#txtalumno").val() == "")) {

        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(6000).html('Debe ingresar al menos un parámetro de búsqueda.');        
    }
    else {
        var url = ParamUrl + '?idreg=' + $("#slccampana").val() + ' &fecini=' + $("#txtinicio").val() + '&fecfin=' + $("#txtfin").val() + '&alumno=' + $("#txtalumno").val();

        $('<a href="' + url + '" target="_blank"></a>')[0].click();
    }
    
    stopAjaxLoading();
}