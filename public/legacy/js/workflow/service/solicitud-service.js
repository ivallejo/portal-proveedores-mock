class SolicitudService {
    agregar(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkSolicitud/JustificacionAsistenciaCrear'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarPendienteAprobar(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkAprobacionSolicitud/ListarPendienteAprobacion'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    obtenerPendienteAprobarPorId(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkAprobacionSolicitud/ObtenerPendienteAprobarPorId?key=' + key + '&onlyview=false'
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    obtenerPendienteAprobarPorIdOnlyView(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkAprobacionSolicitud/ObtenerPendienteAprobarPorId?key=' + key + '&onlyview=true'
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    registrarEvaluacion(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkAprobacionSolicitud/RegistrarEvaluacion'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    //bandeja de solicitud
    listarParticipados(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ListarParticipados'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    obtenerParticipadosPorId(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ObtenerParticipadosPorId?key=' + key,
            callback: (response) => {
                // Solo ejecutar el callback si la respuesta es exitosa
                if (response && response.success !== false) {
                    callback(response);
                }
                // Si hay error, Ajax.ejecutar ya lo manejó en el success/error handler
            },
            showProgress: verProgreso,
            async: async,
            // Agregar manejo personalizado de errores
            esAnidado: false
        });
    }
    obtenerParticipadosPorId2(key, key2, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ObtenerParticipadosPorId?key=' + key + "&soloFinales=" + key2
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    actualizarJustificacion(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarJustificacion'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    actualizarTarifaDocente(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarTarifaDocente'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    actualizarTarifaDocenteConceptoExtraordinario(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarTarifaDocenteConceptoExtraordinario'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    actualizarTarifaCurso(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarTarifaCurso'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    actualizarLimiteMarcacion(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarLimiteMarcacion'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    actualizarExcepcionTarifa(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarExcepcionTarifa'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    actualizarReportePagoDocente(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarReportePagoDocente'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    registrarEvaluacionMasivo(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkAprobacionSolicitud/RegistrarEvaluacionMasivo'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    agregarReprogramacion(request, callback, verProgreso = true) {

        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkSolicitud/ReprogramacionCrear'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }

    actualizarReprogramacion(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkBandejaSolicitud/ActualizarReprogramacion'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
}