class GrupoUsuarioService {
    listar(request, callback, verProgreso = true) {
        let formData = new FormData();
        for (let item in request) {
            Util.crearFormData(formData, item, request[item]);
        }
        Ajax.ejecutar({
            url: 'WkGrupoUsuario/Buscar'
            , callback: callback, showProgress: verProgreso, type: Ajax.type.Post, data: formData,
            dataType: undefined, processData: false, contentType: false
        });
    }
    listarUsuariosPorGrupo(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkGrupoUsuario/BuscarUsuariosActivos?idGrupo=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    obtenerPorId(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkGrupoUsuario/ObtenerSolicitudGenericaPorId?key=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkGrupoUsuario/Crear`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Post, esAnidado: esAnidado
        });
    }
    actualizar(request, callback, verProgreso = true) {
        Ajax.ejecutar({
            url: `WkGrupoUsuario/Actualizar`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Put
        });
    }
}