class UtilService {
    obtenerHtml(url, callback, verProgreso = true, esAnidado = false) {
        Ajax.obtenerHtml({
            url: url, callback: callback, showProgress: verProgreso, esAnidado: esAnidado
        });
    }
}   