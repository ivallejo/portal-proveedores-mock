const Ajax = {
    ejecutar: (parametros) => {
        let defecto = { url: null, type: Ajax.type.Get, data: null, callback: null, showProgress: true, dataType: "json", async: true, esAnidado: false, processData: undefined, contentType: undefined };
        let configuracion = Object.assign(defecto, parametros);
        return $.ajax({
            type: configuracion.type,
            url: URL_BASE + configuracion.url,
            async: configuracion.async,
            data: configuracion.data,
            dataType: configuracion.dataType,
            processData: configuracion.processData,
            contentType: configuracion.contentType,
            beforeSend: function () {
                if (configuracion.showProgress)
                    Loading.show();
            },
            error: function (xhr, error) {
                Loading.hide();
                Loading.resetText();
                MessageBox.showMessenger("Ocurrió un error inesperado, por favor informe a su contacto de ADEX.", 'error', 'Error');
                //MessageBox.alert("Ocurrió un error inesperado, por favor informe a su contacto de ADEX.");
            },
            success: function (response) {
                if (response.success) {
                    configuracion.callback(response.data);
                    if (!configuracion.esAnidado && configuracion.showProgress) {
                        Loading.hide();
                        Loading.resetText();
                    }
                }
                else {
                    if (response.swal == "warning") {
                        //MessageBox.showMessenger(response.mensaje, 'warning', 'Alerta');
                        //const mensajeFormateado = response.mensaje.replace(/\n/g, '<br>');
                        Swal.fire({
                            icon: 'warning',
                            title: 'Alerta',
                            //html: mensajeFormateado, // Usar 'html' en lugar de 'text'
                            html: response.mensaje,
                            toast: false,
                            position: 'center',
                            showConfirmButton: false,
                            timer: 5000,
                            timerProgressBar: true,
                        });
                    } else {
                        MessageBox.showMessenger("Ocurrió un error inesperado, por favor informe a su contacto de ADEX.", 'error', 'Error');
                    }
                    //if (response.sesion)
                    //    MessageBox.alert(response.message);
                    //else
                    //    MessageBox.alert("Ocurrió un error inesperado, por favor informe a su contacto de ADEX.");
                    Loading.hide();
                    Loading.resetText();
                }
            }
        });
    },
    obtenerHtml: (parametros) => {
        let defecto = { url: null, callback: null, showProgress: true, async: true, esAnidado: false };
        let configuracion = Object.assign(defecto, parametros);
        return $.get({
            url: URL_BASE + configuracion.url,
            async: configuracion.async,
            beforeSend: function () {
                if (configuracion.showProgress)
                    Loading.show();
            },
            error: function (xhr, error) {
                Loading.hide();
                Loading.resetText();
                MessageBox.alert("Ocurrió un error inesperado, por favor informe a su contacto de ADEX.");
            },
            success: function (response) {
                configuracion.callback(response);
                if (!configuracion.esAnidado && configuracion.showProgress) {
                    Loading.hide();
                    Loading.resetText();
                }
            }
        });
    },
    type: {
        Get: "GET",
        Post: "POST",
        Put: "PUT",
        Delete: "DELETE"
    }
};