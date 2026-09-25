class AprobadorWorkflowService {
    listar(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkAprobadorWorkflow/Buscar'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarPeriodosPorOrganizacion(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkAprobadorWorkflow/BuscarPeriodosAcademicos?organizacion=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    listarGruposPorAprobador(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkAprobadorWorkflow/BuscarGrupos?idAprobadorWorkflow=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkAprobadorWorkflow/Crear`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Post, esAnidado: esAnidado
        });
    }
    actualizar(request, callback, verProgreso = true) {
        Ajax.ejecutar({
            url: `WkAprobadorWorkflow/Actualizar`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Put
        });
    }
}