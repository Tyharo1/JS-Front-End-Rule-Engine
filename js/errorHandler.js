//TODO: allow single or many error messages
export function proccessErrors(errors, target) {
    const invalidClass = 'invalid';
    const errorMessageTarget = $('[data-errors-universal]');

    if (!$.isEmptyObject(errors)) {
        // TODO: loop through errors and apply all messages else only first error
        errorMessageTarget[0].innerHTML = errors[Object.keys(errors)[0]];
        $(target).addClass(invalidClass);
    } else if ($(target).hasClass(invalidClass)) {
        errorMessageTarget[0].innerHTML = '';
        $(target).removeClass(invalidClass);
    }
}

export function clearErrors(target) {
    const invalidClass = 'invalid';
    if ($(target).hasClass(invalidClass)) {
        $(target).removeClass(invalidClass);
    }
}