//import { icon } from "../plugins/leaflet/leaflet-src";

//FULL CALENDAR

var pagina = 0;
document.addEventListener('DOMContentLoaded', function() {
  
    //const url = "/Buscador/GetCalendar";

    //$.ajax({
    //    url: url, 
    //    method: 'GET',
    //    async: false, 
    //    dataType: 'json',
    //    success: function (data) {
    //        dataSchedule = data;
    //    },
    //    error: function (jqXHR, textStatus, errorThrown) {
    //        console.error('Error:', textStatus);
    //        alert('Ocurrió un error');
    //    }
    //});

    let btnPreview = document.getElementById('btnPreview');
    let btnNext = document.getElementById('btnNext');

    if (dataSchedule.length == 0 || dataSchedule.length == 1) {
        btnPreview.style.display = 'none';
        btnNext.style.display = 'none';
    }
    //else {
    //    btnPreview.style.display = 'block';
    //    btnNext.style.display = 'block';
    //}

    loadSchedule(0);
    pagina = 1;
    

    document.getElementById('btnPreview').addEventListener('click', function () {
        pagina = pagina - 1;

    /*    console.log(pagina);*/

        if (pagina > 0) {

            loadSchedule(pagina - 1);
        } else {

            //console.log(pagina)

            pagina = 1;
        }
       
        
    });

    document.getElementById('btnNext').addEventListener('click', function () {
        pagina = pagina + 1;
        if (dataSchedule.length >= pagina) {
            loadSchedule(pagina - 1);
        } else {
            pagina = pagina - 1;
        }
        
    });

    function convertNetDate(netDate) {
        // Extraer el número de milisegundos
        var timestamp = netDate.match(/\/Date\((\d+)\)\//)[1];
        // Convertirlo a un objeto Date
        var date = new Date(parseInt(timestamp));
        return date.toISOString();  // Convertir a formato ISO
    }

    function loadSchedule(index) {

     

        let firstDataSchedule = dataSchedule[index];

        console.log(firstDataSchedule.Calendars);
        //// Procesa los datos recibidos
        //firstDataSchedule.Calendars.forEach(event => {
        //    event.Start = convertNetDate(event.Start);
        //    event.End = convertNetDate(event.End);
        //});


        console.log(firstDataSchedule.Calendars);

        //console.log(firstDataSchedule.Calendars);
        let btnModulo = document.getElementById('modulo');
        btnModulo.textContent = firstDataSchedule.Modulo;

        let btnModuloFI = document.getElementById('moduloFechaInicio');
        btnModuloFI.textContent = firstDataSchedule.StartDate;

        let btnModuloFF = document.getElementById('moduloFechaFin');
        btnModuloFF.textContent = firstDataSchedule.EndDate;

        var calendarEl = document.getElementById('calendar2');

        var calendar = new FullCalendar.Calendar(calendarEl, {

            locale: 'es',
            initialView: 'timeGridWeek',
            slotMinTime: '08:00:00', // Establece la hora mínima de los intervalos
            slotMaxTime: '23:00:00', // Establece la hora máxima de los intervalos
            dayHeaderFormat: { weekday: 'long' },
            //slotDuration: '00:15:00',
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
            headerToolbar: false,
            navLinks: true, // can click day/week names to navigate views
            editable: false,
            dayMaxEvents: true,
            selectable: true,
            selectMirror: true,
            droppable: true, // this allows things to be dropped onto the calendar
            //maxTime: '18:00:00', // Hora máxima que se mostrará (ejemplo: 6:00 PM)
            events: firstDataSchedule.Calendars,
            eventContent: function (info) {
                return { html: '<div style="display:flex;justify-content:center;text-align:center;height:100%;align-items:center;font-size:10px;color:' + info.event.textColor +';">' + info.event.title + '</div>' };
            },
            contentHeight: 'auto',
            loading: function (bool) {
                //document.getElementById('loading').style.display =
                //    bool ? 'block' : 'none';
            },
            dateClick: function (info) {
                //alert(1);
                //console.log("hola");
                //$("#Fecha").val(info.dateStr);
                //$("#modalProgramacion").modal('show');
            },
            eventClick: function (info) {
                console.log(info.event);
            }
        });

        calendar.render();
    }

});

