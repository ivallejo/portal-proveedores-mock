class PlantillaCorreoWorkflowService {
    listar(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkPlantillaCorreoWorkflow/ListarPor'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarDestinatarios(request, callback, verProgreso = true, async = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkPlantillaCorreoWorkflow/ListarDestinatarioPor'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false, async: async
        });
    }
    obtenerPorId(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkPlantillaCorreoWorkflow/ObtenerPorId?key=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkPlantillaCorreoWorkflow/Crear`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Post, esAnidado: esAnidado
        });
    }
    actualizar(request, callback, verProgreso = true) {
        Ajax.ejecutar({
            url: `WkPlantillaCorreoWorkflow/Actualizar`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Put
        });
    }
}