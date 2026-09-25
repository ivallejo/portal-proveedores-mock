class TarifaDocenteConceptoExtraordinarioService {
    procesar(request, callback, verProgreso = true, async = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkTarifaDocenteConceptoExtraordinario/procesarDocumento',
            callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false, async: async
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/Agregar`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Post, esAnidado: esAnidado
        });
    }
    listarOrganizacion(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/ListarOrganizaciones`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Get, esAnidado: esAnidado
        });
    }
    listarPeriodoAnterior(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/ObtenerPeriodoAnterior`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarReporteGeneral(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/ObtenerDatosReporteGeneral`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarReporteEstadistico(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/ObtenerDatosReporteEstadistico`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarConceptos(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/ListarConceptos`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Get, esAnidado: esAnidado
        });
    }
    listarCentroCostos(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkTarifaDocenteConceptoExtraordinario/ListarCentroCostos?organizacion=${request.organizacion}`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Get, esAnidado: esAnidado
        });
    }
}