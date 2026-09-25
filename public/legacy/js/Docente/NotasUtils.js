function drawHTMLg(jsonSeccionesFusionadas, course) {
    var content = ``;

    jsonSeccionesFusionadas.forEach(function (item) {
        var anio = "";
        var semestre = "";
        var seccion = "";
        var event_id = "";
        var turno = "";
        var curso = "";

        if (item.lenght > 0) {
            itm = item[0];
            anio = itm.academic_year;
            semestre = itm.academic_term;
            seccion = itm.section;
            event_id = itm.event_id;
            turno = itm.academic_session;
        }

    })
    content +=
    `
    <div class="card">
            <div class="card-header">
                Evaluaciones continuas del curso
                <strong class="Course">${Course}</strong>
            </div>
            <div class="card-body">
                <div>
                    <!--Aquí se mostrarán los detalles del curso-->
                    <strong>Detalles del Curso:</strong>
                    
                    <br />

                    <div class="row">

                        <div class=" form-group col-md-2">
                            <label class="col-sm-2 col-form-label lbl">Año</label>
                            <div class="col-sm-10">
                                <input class="form-control detailSection" id="txtAnio" disabled />
                            </div>
                        </div>

                        <div class=" form-group col-md-3">
                            <label class="col-sm-2 col-form-label lbl">Semestre</label>
                            <div class="col-sm-10">
                                <input class="form-control detailSection" id="txtSemestre" disabled />
                            </div>
                        </div>

                        <div class=" form-group col-md-2">
                            <label class="col-sm-2 col-form-label lbl">Seccion</label>
                            <div class="col-sm-10">
                                <input class="form-control detailSection" id="txtSection" disabled />
                            </div>
                        </div>
                        <div class=" form-group col-md-2">
                            <label class="col-sm-2 col-form-label lbl">Id Curso</label>
                            <div class="col-sm-10">
                                <input class="form-control detailSection" id="txtEventId" disabled />
                            </div>
                        </div>
                        <div class=" form-group col-md-3">
                            <label class="col-sm-2 col-form-label lbl">Turno</label>
                            <div class="col-sm-10">
                                <input class="form-control detailSection" id="txtAcademicSession" disabled />
                            </div>
                        </div>
                    </div>

                    <!--inputs ocultos-->
                    <div class="row mt-1">

                        <div class="col" hidden>
                            <label class="form-label">SECTIONGRADING_KEY (RECORD_NUMBER en contexto de TRANSCRIPTGRADING)</label>
                            <input class="form-control" id="record_number" disabled />
                        </div>

                    </div>
                </div>

                <br />
                <div class="mt-1">
                    <div class="container mb-4" id="hijasToggle_ec"></div>
                    <div class="row d-flex justify-content-center mt-1" id="resultTab">
                        <!--foreach de los elementos botones de accion para realizar la busqueda de los participantes en la seccion y el -->
                        <!---->
                    </div>

                </div>

            </div>
        </div>
        <br />
        <div class="card" id="asistentes">
            <div class="card-body">

                <div id="target-asistentes">
                    Seleccione una evaluacion para realizar la carga
                </div>
            </div>
        </div>
    `

    return content;
}

function sendNotas(target) {
    //console.info(target);
}