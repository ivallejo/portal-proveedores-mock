class ReportePagoDocenteService {
    agregar(request, callback, verProgreso = true, esAnidado = false) {
        Ajax.ejecutar({
            url: `WkReportePagoDocente/Agregar`, callback: callback, showProgress: verProgreso, data: request, type: Ajax.type.Post, esAnidado: esAnidado
        });
    }
}