class LimiteMarcacionService {
    agregar(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkLimiteMarcacion/Crear'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    obtenerPeriodoAnterior(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkLimiteMarcacion/ObtenerPeriodoAnterior?idPeriodoAcademico=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    listarReporteGeneral(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkLimiteMarcacion/ObtenerDatosReporteGeneral`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
}