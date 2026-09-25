class TarifaCursoService {
    listarCursosPorPeriodoAcademico(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkTarifaCurso/ListarCursosPorPeriodoAcademico?idPeriodoAcademico=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    listarTarifasDePeriodoAnterior(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkTarifaCurso/ListarTarifasDePeriodoAnterior?idPeriodoAcademico=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    listarSolicitudesTarifaPorSolicitud(key, key2, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkTarifaCurso/ListarSolicitudesTarifaPorSolicitud?idSolicitud=' + key + "&soloFinales=" + key2
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    listarReporteGeneral(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaCurso/ObtenerDatosReporteGeneral`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarReporteEstadistico(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: `WkTarifaCurso/ObtenerDatosReporteEstadistico`, callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    subirRegistroMasivo(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkTarifaCurso/SubirRegistroMasivo'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkTarifaCurso/Crear'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
}