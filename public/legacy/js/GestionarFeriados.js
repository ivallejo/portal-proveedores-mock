

$(document).ready(function () {

    var jsonEventoFeriado = JSON.parse($("#eventosFeriadosJson").val());
    console.log(jsonEventoFeriado); // Esto debería mostrar un arreglo de objetos en la consola

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        selectable: true,
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next today'
        },
        buttonText: {
            today: 'Mes Actual'
        },
        events: jsonEventoFeriado,
        select: function (info) {
            var eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
            document.getElementById('eventStart').value = info.startStr;
            eventModal.show();
        },
        windowResize: function () {
            // Ajustar el aspecto del calendario según el ancho de la ventana
            if (window.innerWidth < 768) {
                calendar.setOption('aspectRatio', 0.8); // Más alto en pantallas pequeñas
            } else {
                calendar.setOption('aspectRatio', 1.35); // Valor estándar para pantallas grandes
            }
        },
        height: 'auto', // Ajusta automáticamente la altura
        aspectRatio: window.innerWidth < 768 ? 0.8 : 1.35 // Condición inicial
    });

    calendar.render();

});


function guardarEvento() {

    //var eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    //eventModal.hide();

    $('#eventModal').modal('hide');

    let motivo_evento = $('#motivoEvento').val();
    let fecha_evento = $('#eventStart').val();
    

    var formData = new FormData();
    formData.append('motivo_evento', motivo_evento);
    formData.append('fecha_evento', fecha_evento);
   

    $.ajax({
        url: $('#inputActualizarFeriados').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success == true) {

             

                Swal.fire({
                    title: data1.mensaje,
                    text: "",
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.value) {
                        location.reload(true);

                    }
                });



            } else {



            }

        },
        error: function (error) {

        }
    });

}

function desactivarEvento() {

    $('#eventModal').modal('hide');
    let fecha_evento = $('#eventStart').val();

    var formData = new FormData();
    formData.append('fecha_evento', fecha_evento);


    $.ajax({
        url: $('#inputDesabilitarEvento').val(),
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (data1) {

            if (data1.success == true) {

                Swal.fire({
                    title: data1.mensaje,
                    text: "",
                    icon: 'success',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.value) {
                        location.reload(true);

                    }
                });



            } else {



            }

        },
        error: function (error) {

        }
    });


}