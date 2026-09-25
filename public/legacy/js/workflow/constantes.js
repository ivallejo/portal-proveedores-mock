const Constantes = {
    Select: {
        OpcionTodos: '<option value="">--Todos--</option>',
        OpcionSeleccione: '<option value="">--Seleccione--</option>',
        OpcionNinguno: '<option value="">--Ninguno--</option>',
    },
    Parametros: {
        Dominio: {
            Destinatarios: 3,
            Organizacion: 2
        }
    },
    EstadoSolicitud: {
        Solicitado: 1,
        EnEvaluacion: 2,
        Aprobado: 3,
        Rechazado: 4
    },
    Workflow: {
        JustificacionAsistencia: 1,
        TarifaDocentes: 2,
        TarifaCursos: 3,
        ExcepcionesTarifasDocente: 4,
        LimitesMarcacion: 5,
        ReporteDePagoDeDocentes: 6,
        ReprogramacionClases: 7,
        TarifaDeDocenteConceptoExtraordinario: 8
    },
    JustificacionAsistenciaSolicitudIdentificador: {
        Entrada: 'E',
        Salida: 'S',
        EntradaYSalida: 'ES',
    },
    ReprogramacionSolicitudIdentificador: {
        AdelantoClases: 'AC',
        RecuperacionClases: 'RC',
    },
    Organizacion: {
        Instituto: 'INS',
        Escuela: 'ECA',
        GlobalLearning: 'ESC'
    },
    TipoTarifa: {
        PorDocente: '1',
        PorCurso: '2'
    }
};