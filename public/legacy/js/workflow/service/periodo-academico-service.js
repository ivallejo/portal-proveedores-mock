class PeriodoAcademicoService {
    constructor() {
        if (!!PeriodoAcademicoService.instance) {
            return PeriodoAcademicoService.instance;
        }

        PeriodoAcademicoService.instance = this;

        return this;
    }

    listarPorOrganizacion(key, callback, verProgreso = true, async = true) {
        Ajax.ejecutar({
            url: 'WkAprobadorWorkflow/BuscarPeriodosAcademicos?organizacion=' + key
            , callback: callback, showProgress: verProgreso, async: async
        });
    }
}