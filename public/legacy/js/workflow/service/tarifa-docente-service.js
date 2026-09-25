class TarifaDocenteService {
    procesar(request, callback, verProgreso = true, async = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkTarifaDocente/procesarDocumento',
            callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false, async: async
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkTarifaDocente/Agregar'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarOrganizacion(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkTarifaDocente/ListarOrganizaciones`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Get, esAnidado: esAnidado
        });
    }
    listarPeriodoAnterior(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaDocente/ObtenerPeriodoAnterior`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarReporteGeneral(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaDocente/ObtenerDatosReporteGeneral`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarReporteEstadistico(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaDocente/ObtenerDatosReporteEstadistico`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
}