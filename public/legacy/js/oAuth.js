const usu = ["#Usuario", "#Usuario2"];
const pw = ["#card-password", "#card-password2"];
const divSessions = ["#divMensajesesion","#divMensajesesion2"];

function showAjaxLoading() {
    $("#DivAjax").show();
    $("#DivAjaxInside").show();
}

function stopAjaxLoading() {
    $("#DivAjax").hide();
    $("#DivAjaxInside").hide();
}

function ValidarCredenciales(ParamUrl) {
    var device = "pc";
    let c_usuario = usu[0];
    let c_password = pw[0];
    let divSession = divSessions[0];

    var user = $(c_usuario).val();
    var pass = $(c_password).val();

    if (user == null || user == "") {
        $(divSession).show();
        $(divSession).fadeOut(5000).html("Por favor ingrese su código de usuario");
        $(c_usuario).focus();
    }
    else if (pass == null || pass == "") {
        $(divSession).show();
        $(divSession).fadeOut(5000).html("Por favor ingrese su contraseña.");
        $(c_password).focus();
    }
    else {
        showAjaxLoading();
        $(divSession).hide();
        $(divSession).html('');
        $.ajax({
            type: "POST",
            url: ParamUrl,
            data: {
                Usuario: user,
                Password: pass,
                ipdir: $("#hdfip").val()
            },
            dataType: "json",
            success: function (response) {
                if (response != null) {
                    //console.log(response);

                    var auth_result = response.auth_result;

                    if (auth_result.status_code == 200) {
                        //console.log(response)
                        redirectionMenu(response.firstMenu);
                    }
                    else { //errores en funxion a 
                        fade_responseMessage(auth_result, device);
                    }
                    
                } else {
                    stopAjaxLoading();
                }
            },
            failure: function (response) {
                console.warn("La peticion ha fallado ");
                //console.log(response);
                stopAjaxLoading();
            },
            error: function (response) {
                console.error("Error en la peticion.");
                console.error(response);
                stopAjaxLoading();
            },
            complete: function () {
                stopAjaxLoading();
            }
        });
    }    
}

function ValidarCredenciales2(ParamUrl) {
    var device = "phone";

    let c_usuario = usu[1];
    let c_password = pw[1];
    let divSession = divSessions[1];

    var user = $(c_usuario).val();
    var pass = $(c_password).val();


    if (user == null || user == "") {
        $(divSession).show();
        $(divSession).fadeOut(5000).html("Por favor ingrese su código de usuario");
        $(c_usuario).focus();
    }
    else if (pass == null || pass == "") {
        $(divSession).show();
        $(divSession).fadeOut(5000).html("Por favor ingrese su contraseña.");
        $(c_password).focus();
    }
    else {
        showAjaxLoading();
        $(divSession).hide();
        $(divSession).html('');
        $.ajax({
            type: "POST",
            url: ParamUrl,
            data: {
                Usuario: user,
                Password: pass
            },
            dataType: "json",
            success: function (response) {
                if (response != null) {

                    var auth_result = response.auth_result;

                    if (auth_result.status_code == 200) {
                        //console.log(response)
                        redirectionMenu(response.firstMenu);
                    }
                    else { //errores en funxion a 
                        fade_responseMessage(auth_result, device);
                    }

                } else {
                    stopAjaxLoading();
                }
            },
            failure: function (response) {
                console.warn("La peticion ha fallado ");
                //console.warn(response);
                stopAjaxLoading();
            },
            error: function (response) {
                console.error("Error en la peticion.");
                console.error(response);

                stopAjaxLoading();
            },
            complete: function () {
                stopAjaxLoading();
            }
        });
    }
}

//utilidades
function redirectionMenu(aresult) {
    //console.log(aresult)
    //var redirect = `${aresult.controller}/${aresult.view}`;
    var redirect = `${aresult}`;
    //return;
    window.location.href = redirect;

}
function fade_responseMessage(response,device) {
    //console.log(response);
    var user = "";
    var password = "";
    var divMessage = "";
    var index;
    switch (device) {

        case "pc":
            index = 0;
            break;
        case "phone":
            index = 1;

    }

    user = usu[index];
    password = pw[index];
    divMessage = divSessions[index];
    
    $(password).addClass("login-error");
    $(divMessage).show();
    $(divMessage).fadeOut(10000).html(response.response_message);
}

function mostrarError() {
    //xddd
}


//pendiente reestablecimiento de contraseña
function EnviarPasswordCC(ParamUrl, id) {

    var pass = $("#txtCCpassword").val();
    if (pass == null || pass == "") {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(5000).html("Por favor ingrese una contraseña.");
        $('#txtCCpassword').focus();
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                id: id,
                password: pass                
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ChangePassword").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading()
                alert('Ocurrió un error al intentar validar su contraseña.');
            }
        });
    }
    
}

function EnviarConfirmarPasswordCC(ParamUrl) {

    var pass = $("#txtCCpassword").val();
    var repass = $("#txtCCrepassword").val();

    if (pass == null || pass == "") {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(5000).html("Por favor ingrese una contraseña.");
        $('#txtCCpassword').focus();
    }
    else if (repass == null || repass == "") {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(5000).html("Por favor confirme la contraseña.");
        $('#txtCCrepassword').focus();
    }
    else if (pass != repass) {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(5000).html("Las contraseñas no coinciden.");
        $('#txtCCpassword').focus();
    }
    else if (pass.length < 6 || /[a-z]/.test(pass) == 0 || /[A-Z]/.test(pass) == 0 || /\d/.test(pass) == 0) {
        $("#Div_MensajeError").show();
        $("#Div_MensajeError").fadeOut(6000).html("La contraseña ingresada no cumple con los requisitos minimos.");
    }
    else {
        showAjaxLoading();
        $.ajax({
            async: true,
            type: "POST",
            url: ParamUrl,
            data: {
                password: $("#txtCCpassword").val(),
                repassword: repass
            },
            cache: false,
            success: function (data) {
                stopAjaxLoading();
                $("#Div_ChangePassword").html(data);
            },
            error: function (jqXHR, status, error) {
                stopAjaxLoading()
                alert('Ocurrió un error al intentar validar su contraseña.');
            }
        });
    }

}