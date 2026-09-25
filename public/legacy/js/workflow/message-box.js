OptionsMessageBox = {
    closeDialog: function () {
        $('.modal-message').modal('hide');
        $(".modal-message .btn").off("click");
        $(".modal-message").remove();
        $(".modal-backdrop").last().remove();
        $('body').removeClass("modal-open");
    },
    showModal: function () {
        $('.modal-message').modal('show');
        $('.modal-backdrop').last().css('z-index', "1051");
    },
    getButtonOk: function (options) {
        let button = $(Templates.button);
        button.addClass("btn-primary").addClass("btn-min-width");
        if (options.buttonTextOk !== undefined)
            button.html(options.buttonTextOk);
        button.on("click", function () {
            OptionsMessageBox.closeDialog();
            if (options.callbackOk !== undefined)
                options.callbackOk();
        });
        return button;
    },
    getButtonNOk: function (options) {
        let button = $(Templates.button);
        button.addClass("btn-default").addClass("btn-min-width");
        if (options.buttonTextNOk !== undefined)
            button.html(options.buttonTextNOk);
        button.on("click", function () {
            OptionsMessageBox.closeDialog();
            if (options.callbackNOk !== undefined)
                options.callbackNOk();
        });
        return button;
    }
};
Templates = {
    dialog:
        '<div class="modal modal-message fade text-left" data-backdrop="static" tabindex="-1" style="z-index: 1052;" role="dialog" aria-hidden="true">' +
        '<div class="modal-dialog" style="max-width: 500px;">' +
        '<div class="modal-content">' +
        '<div class="modal-body"><div class="message-box-body"></div></div>' +
        '</div>' +
        '</div>' +
        '</div>',
    header:
        '<div class="modal-header">' +
        '<h5 class="modal-title"></h5>' +
        '</div>',
    footer:
        '<div class="modal-footer"></div>',
    button:
        '<button type="button" class="btn">Aceptar</button>'
};

const MessageBox = {
    //alert: function (msg) {
    //    this.showAlert({ message: msg });
    //},
    error: function (msg) {
        this.showMessenger(msg, 'error', 'Mensaje del sistema');
    },
    //showAlert: function (options) {
    //    let dialog = $(Templates.dialog);
    //    let body = dialog.find('.modal-body');
    //    body.find('.message-box-body').html(options.message);
    //    let footer = $(Templates.footer);
    //    footer.append(OptionsMessageBox.getButtonOk(options));
    //    body.after(footer);
    //    $('body').append(dialog);
    //    OptionsMessageBox.showModal();
    //},
    confirm: function (options) {
        let dialog = $(Templates.dialog);
        let body = dialog.find('.modal-body');
        body.find('.message-box-body').html(options.message);
        let footer = $(Templates.footer);
        if (options.buttonTextOk === undefined) {
            options.buttonTextOk = "Aceptar";
        }
        if (options.buttonTextNOk === undefined) {
            options.buttonTextNOk = "Cancelar";
        }
        footer.append(OptionsMessageBox.getButtonNOk(options));
        footer.append(OptionsMessageBox.getButtonOk(options));
        body.after(footer);
        $('body').append(dialog);
        OptionsMessageBox.showModal();
    },
    //Messenger
    info: function (msg) {
        this.showMessenger(msg, 'info', 'Operación Correcta');
    },
    showMessenger: function (msg, icon, title) {
        Swal.fire({
            icon: icon, //success, error, warning, info, question
            title: title,
            text: msg,
            toast: false,
            position: 'center',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
        });
        //Messenger.options = { extraClasses: "messenger-fixed messenger-on-top  messenger-on-right", theme: "flat", messageDefaults: { showCloseButton: !0 } };
        //Messenger().post({ message: msg, type: tipo });
    },
    alert: function (title, text, icon, showConfirmButton, allowOutsideClick, callback) {
        Swal.fire({
            title: title,
            text: text,
            icon: icon, //success, error, warning, info, question
            toast: false,
            position: 'center',
            showConfirmButton: typeof showConfirmButton !== 'undefined' ? showConfirmButton : false,
            allowOutsideClick: typeof allowOutsideClick !== 'undefined' ? allowOutsideClick : true,
            //timer: 4000,
            //timerProgressBar: true,
        }).then((result) => {
            if (result.isConfirmed && typeof callback === 'function') {
                callback();
            }
        });
    }
}