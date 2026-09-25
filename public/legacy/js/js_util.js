const progressPercent = document.querySelector(".j-progress-amount");
const progressPercentLg = document.querySelector(".j-progress-amount-lg");
const numberPercent = document.querySelector(".j-number-percent");
const numberPercentDetail = document.querySelector(".j-number-percent-detail");

const updatePercent = function (numOfCompletedQuestions, numOfQuestions) {
    let percent = Math.round((numOfCompletedQuestions * 100) / numOfQuestions);
    let progressLg = 440 - (440 * percent) / 100;
    let progress = 251 - (251 * percent) / 100;
    document.querySelector(".j-progress-amount-lg").style.strokeDashoffset = progressLg;
    document.querySelector(".j-progress-amount").style.strokeDashoffset = progress;
    document.querySelector(".j-number-percent").innerHTML = `${percent}<span>%</span>`;
    document.querySelector(".j-number-percent-detail").innerHTML = `${numOfCompletedQuestions}/${numOfQuestions}`
};



function j_uf_mensaje(titulo, mensaje, vfunction) {
    $('#ModalErrorRegEnc').remove();
    var modal_content = '<div class="modal fade" id="ModalErrorRegEnc" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header" style="background-color:#153d77;"><h6 class="modal-title" id="exampleModalLabel" style="color:white;font-size:18px;">Mensaje</h6><button type="button" class="close" data-bs-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"><div class="row"><div class="col-lg-12 col-xs-12 mtp-10"> ' + mensaje + '</div></div></div><div class="modal-footer"><input type="button" class="btn-principal" data-bs-dismiss="modal" value="Cerrar"></div></div></div></div>';
    $('#ajax_mensaje').after(modal_content);

    var myModal = new bootstrap.Modal(document.getElementById('ModalErrorRegEnc'), {
        keyboard: false
    })
    myModal.show();

}