const slug_auxiliar = "";
//const slug_auxiliar = "/SAD_NOV";

/*LOGICA INICIAL PARA LA CONSTRUCCION DE CALENDARIO CON PLUGIN*/

function cargarhorariopost(target, anio, semestre, print_target, loaderId) {
    //console.info("Cargando horario para el elemento: ", target, anio, semestre, print_target, loaderId);
    return new Promise((resolve, reject) => {
        try {
            const codDocente = sessionStorage.getItem('currentCodDocente');
            var fdtx = new FormData();
            fdtx.append("anio_d", anio);
            fdtx.append("semestre_d", semestre);
            fdtx.append("target", print_target);
            fdtx.append("codDocente", codDocente);

            $.ajax({
                url: getSchedule,
                type: 'POST',
                data: fdtx,
                contentType: false,
                processData: false,
                dataType: 'html',
                beforeSend: function () {
                    showModalLoader();
                    showAlternativeLoader(loaderId);
                },
                success: function (data) {
                    //console.log("Contenido: ", data)
                    $(target).html(data);
                    loadSchedule(0, print_target, anio, semestre);
                    resolve(); // Llamar resolve cuando la petición termine correctamente
                },
                error: function (error) {
                    var responseText = error.responseText;
                    console.error("Error en la petición AJAX:", error);

                    //
                        var exmessage = "";
                        // Crear un parser para analizar la respuesta HTML
                        let parser = new DOMParser();
                        let doc = parser.parseFromString(responseText, 'text/html');

                        // Buscar el div con la clase "titleerror"
                        let titleErrorElement = doc.querySelector('.titleerror');
                        // Si existe, extraer el texto
                        if (titleErrorElement) {
                            exmessage = titleErrorElement.textContent.trim();
                        }
                    //
                    
                    let traza = `<h4 class='fw-bold'>Ocurrió un error al cargar el Horario traza: ${exmessage}</h4 >`;
                    $(target).html(traza);

                    reject(error); // Llamar reject en caso de error
                },
                complete: function () {
                    hideModalLoader();
                    hideAlternativeLoader(loaderId);
                }
            });
        } catch (error) {
            hideAlternativeLoader();
            $(target).html(`Ocurrió un error al buscar las sesiones del docente => ${error.message}`);
            reject(error); // Llamar reject en caso de error
        }
    });
}
function loadSchedule(index,target,anio,semestre) {
    //console.log(index);

    // let firstDataSchedule = dataSchedule[index];

    //var calendarEl = document.getElementById('calendar2');
    var calendarEl = document.getElementById(target);
    //console.log(dataSchedule);

    var calendar = new FullCalendar.Calendar(calendarEl, {

        locale: 'es',
        initialView: 'timeGridWeek',
        firstDay: 1, // Comenzar la semana en lunes
        slotMinTime: '08:00:00', // Establece la hora mínima de los intervalos
        slotMaxTime: '23:00:00', // Establece la hora máxima de los intervalos
        dayHeaderFormat: { weekday: 'long' },
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: false
        },
        allDaySlot: false, // Ocultar la fila de "Todo el día"
        weekNumberTitle: '', // Dejar el título de la semana en blanco
        buttonIcons: false,
        weekNumbers: false,
        selectable: false,
        customButtons: {
            customPrev: {
                text: 'Anterior',
                click: function () {
                    calendar.prev();
                }
            },
            customNext: {
                text: 'Siguiente',
                click: function () {
                    calendar.next();
                }
            },
            customToday: {
                text: 'Hoy',
                click: function () {
                    calendar.today();
                }
            }
        },
        headerToolbar: {
            left: 'customPrev,customNext customToday',
            center: 'title',
            right: false
        },
        navLinks: false,
        editable: false,
        dayMaxEvents: true,
        //selectable: true,
        selectMirror: true,
        droppable: true,
        events: dataSchedule,
        eventContent: function (info) {
            return { html: '<div style="display:flex;justify-content:center;text-align:center;height:100%;align-items:center;font-size:10px;color:' + info.event.textColor + ';">' + info.event.title + '</div>' };
        },
        contentHeight: 'auto',
        loading: function (bool) { },
        dateClick: function (info) { },
        eventClick: function (info) {
            let date = info.el.fcSeg.start;
            //console.log(date);

            let item = info.event._def;
            var title = item.title;
            var path_elements = extractSectionAndCourseID(title,anio,semestre);
            //una vez con los elementos respectivos, realizo el request a la bd para enconrar las secciones hijas
            var academic_year = path_elements.academic_year;
            var academic_term = path_elements.academic_term;
            var section = path_elements.section;
            var event_id = path_elements.event_id;
            var esVistaPC = 1;
            searchSeccionesHijas(path_elements, searchChildSections, date, esVistaPC);
        }
    });

    calendarInstance = calendar;
    calendar.render();


    function mostrarCalendario() {
        setInterval(() => {
            //console.log("Actualizando calendario ==> " + target);
            calendar.updateSize();
        }, 500);
    }

    mostrarCalendario();
}


//para mobile
$(document).ready(function () {
    $('[data-toggle="collapse"]').click(function () {
        $(this).toggleClass('active');
    });
});


// Función para cargar el contenido de la semana seleccionada
function loadWeekContent(weekIndex, target, weeks, anio, semestre, ajaxHijas) {

    //console.log("target: ", target)
    //console.log("weeks: ", weeks)
    //console.log("anio: ", anio)
    //console.log("semestre: ", semestre)
    var weekcontent = `week-content_${target}`;

    if (!weeks || weeks.length === 0) {
        console.error("No hay semanas disponibles para mostrar.");
        document.getElementById(weekcontent).innerHTML = `<h4 class="fw-bold">Usted no cuenta con sesiones programadas para el periodo ${anio}${semestre}.</h4>`;
        return;
    }

    var headerx = `<h3 class="d-flex" style="color: #207fe9; font-size: 20px;align-items:center;font-weight:bold;">
                                                                        Mi horario semanal ${anio}${semestre}
                                                                    </h3>`;

    if (weekIndex < 0 || weekIndex >= weeks.length) {
        console.warn("Índice de semana fuera de rango:", weekIndex);
        return;
    }

    var week = weeks[weekIndex];

    var startDate = new Date(week.startOfWeek);
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    var weekLabel = `week-label_${target}`;


    $(`#${weekLabel}`);
    document.getElementById(weekLabel).textContent = `${startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    let content = "";

    // Definir el orden de los días de la semana en español
    var daysOrder = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

    // Agrupa los eventos de la semana por día y asegura el orden
    var eventsByDay = daysOrder.map(day => {
        return {
            day,
            events: week.events ? week.events.filter(event => {
                var eventDay = new Date(event.fechaSesión).toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
                return eventDay === day;
            }) : [] // Si week.events es undefined, retorna un arreglo vacío
        };
    });

    // Genera el HTML para cada día en orden y sus eventos
    eventsByDay.forEach(({ day, events }) => {
        if (events.length > 0) { // Solo mostrar el día si hay eventos
            var firstEventDate = new Date(events[0].fechaSesión);
            var fullDate = `${day.toUpperCase()} ${firstEventDate.getDate()} DE ${firstEventDate.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()}`;

            content += `<div class="day-header" style="font-weight: bold; font-size: 16px; margin-top: 15px;">${fullDate}</div> <hr>`;

            events.forEach(event => {
                //console.log(event);
                var option = "";
                if (event.espadre) {
                    var date = event.fechaSesión
                    option = `<button class="btn btn-primary mt-3" onclick="searchDetailscardHorario('${anio}','${semestre}','${event.section}','${event.event_id}','${ajaxHijas}','${date}')" >Ver secciones fusionadas</button>`;
                }

                content += `
                                                    <div class="class-card mb-2 m-3" style="border-left: 16px solid ${event.backgroundColor}; background-color: #efefef; margin-top: 10px; padding: 15px; border-radius: 5px;">
                                                        <div style="color: ${event.textColor}; font-weight: bold; font-size: 14px;">${event.descriptionCourse}</div>
                                                        <div class="class-info" style="font-size: 13px; margin-top: 5px;">
                                                            <img src="${slug_auxiliar}/img/location.png" alt="Location" style="height: 16px; width: 16px; vertical-align: middle; margin-right: 5px;" />
                                                            Sección: ${event.section} &nbsp; &nbsp; &nbsp; ${event.aula ? `Aula: ${event.aula}` : ""}
                                                        </div>
                                                        <div class="class-time" style="font-size: 13px; margin-top: 5px;">
                                                            <img src="${slug_auxiliar}/img/clock_black.fw.png" alt="Time" style="height: 16px; width: 16px; vertical-align: middle; margin-right: 5px;" />
                                                            ${event.startTime} - ${event.endTime}
                                                        </div>

                                                        <div class="class-time" style="font-size: 13px; margin-top: 5px;">
                                                            <img src="${slug_auxiliar}/images/bxs-calendar.svg" alt="Time" style="height: 16px; width: 16px; vertical-align: middle; margin-right: 5px;" />
                                                            ${event.fechaInicio} - ${event.fechaFin}
                                                        </div>

                                                        <div class="class-time" style="font-size: 13px; margin-top: 5px;" hidden>
                                                            ${anio}${semestre}
                                                        </div>

                                                        ${option}
                                                    </div>`;
            });
        }
    });

    content += `
                                            <div class="col-md-10 col-xl-12" style="padding-top: 20px;">
                                                <button class="btn btn-lg btn-primary" style="background-color: #D2EDFF !important; border-color: #D2EDFF !important; color: #207FE9 !important; font-weight: bold;">Presencial</button>
                                                <button class="btn btn-lg btn-primary" style="background-color: #f1fae0 !important; border-color: #f1fae0 !important; color: #45630c !important; font-weight: bold; ">Virtual</button>
                                                <button class="btn btn-lg btn-primary" style="background-color: #d2acfa !important; border-color: #d2acfa !important; color: #483b57 !important; font-weight: bold; ">Asíncrono*</button>
                                                <button class="btn btn-lg btn-primary" style="background-color: #FFDFDF !important; border-color: #FFDFDF !important; color: #7C0000 !important; font-weight: bold; ">Híbrido</button>
                                            </div>`;

    var headerMobile = `header_mobile_${target}`;


    document.getElementById(headerMobile).innerHTML = headerx;
    document.getElementById(weekcontent).innerHTML = content;

    $(`#header_mobile_${target}`)
    $(`#week-content_${target}`)
}

// Navegación entre semanas
function navigateWeek(direction, target, anio, semestre, sstorage_token, ajaxHijas) {
    //console.log(sstorage_token);
    var weeks_s = sessionStorage.getItem(sstorage_token);
    var week = JSON.parse(weeks_s);

    //console.log(currentWeekIndex);
    currentWeekIndex += direction;

    if (currentWeekIndex < 0) {
        currentWeekIndex = 0;
    } else if (currentWeekIndex >= week.length) {
        currentWeekIndex = week.length - 1;
    }

    loadWeekContent(currentWeekIndex, target, week, anio, semestre, ajaxHijas);
}




// Función para encontrar la semana actual
function findCurrentWeekIndex(weeks, currentDate) {
    //destroyguidSessionStorage();
    var today = new Date(currentDate.split("T")[0]); // Usa solo la parte de la fecha sin horas

    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
        var week = weeks[weekIndex];
        var startDate = new Date(week.startOfWeek.split("T")[0]); // Solo toma la fecha
        var endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        if (today >= startDate && today <= endDate) {
            //console.log("Semana encontrada en índice:", weekIndex);
            return weekIndex;
        }
    }

    // Si no encuentra la semana actual, devuelve la primera semana como fallback
    //console.log("No se encontró la semana actual, devolviendo índice 0.");
    return 0;
}


function buildWeeks(months, tokenSessionStorage) {
    var weeks = [];

    months.forEach(month => {
        if (month.weeks && Array.isArray(month.weeks)) {
            month.weeks.forEach(week => {
                // Verificar si una semana con el mismo startOfWeek ya existe en weeks
                var existingWeek = weeks.find(existing => existing.startOfWeek === week.startOfWeek);

                if (existingWeek) {
                    // Si la semana ya existe, combinar los eventos
                    existingWeek.events = [...existingWeek.events, ...week.events];
                } else {
                    // Si no existe, agregar la semana a weeks
                    weeks.push(week);
                }
            });
        }
    });

    var weeksStringify = JSON.stringify(weeks);
    //console.log(JSON.parse(weeksStringify));
    //console.log(tokenSessionStorage);

    sessionStorage.setItem(tokenSessionStorage, weeksStringify);

    return weeks;
}
