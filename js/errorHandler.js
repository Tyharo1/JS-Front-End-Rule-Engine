'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.proccessErrors = proccessErrors;
exports.clearErrors = clearErrors;
//TODO: allow single or many error messages
function proccessErrors(errors, target) {
    var invalidClass = 'invalid';
    var errorMessageTarget = $('[data-errors-universal]');

    if (!$.isEmptyObject(errors)) {
        // TODO: loop through errors and apply all messages else only first error
        errorMessageTarget[0].innerHTML = errors[Object.keys(errors)[0]];
        $(target).addClass(invalidClass);
    } else if ($(target).hasClass(invalidClass)) {
        errorMessageTarget[0].innerHTML = '';
        $(target).removeClass(invalidClass);
    }
}

function clearErrors(target) {
    var invalidClass = 'invalid';
    if ($(target).hasClass(invalidClass)) {
        $(target).removeClass(invalidClass);
    }
}