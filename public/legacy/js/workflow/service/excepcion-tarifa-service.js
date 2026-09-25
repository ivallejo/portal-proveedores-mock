class ExcepcionTarifaService {
    procesar(request, callback, verProgreso = true, async = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkExcepcionTarifa/procesarDocumento',
            callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false, async: async
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkExcepcionTarifa/Agregar`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Post, esAnidado: esAnidado
        });
    }
    listarOrganizacion(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkExcepcionTarifa/ListarOrganizaciones`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Get, esAnidado: esAnidado
        });
    }
    listarPeriodoAnterior(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkExcepcionTarifa/ObtenerPeriodoAnterior`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarReporteGeneral(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkExcepcionTarifa/ObtenerDatosReporteGeneral`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
}