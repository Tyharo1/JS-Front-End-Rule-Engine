
// Additions:
//		Make into an NPM library (will this even work on FE?)
//		Consider seperating Rule logic into a seperate file(s)
//      Should rules be stored in a data attribute on each element to validate?
//			-	BOTH: allow the developers to choose (Enusre choice is consistent in project)
// 		Build logic to allow same rules for two different inputs without adding new data tag to rules array


// Active Jquery looking for elements with data-attribute when blured
$('[data-js-validate]').blur((event) => {
    validateInputs(event.target);
});

$('[data-js-button-validate]').click((event) => {
    $('[data-js-validate]').each(function( index ) {
        validateInputs(this);
    });
});

// Each page will have its own validation file
// containing rules for each input on the page.
function validateInputs(inputTarget) {

    // Build rules per input, inputs name MUST match the rules name
    const rules = {
        numbers: {
            maxLength: 10,
            minLength: 1,
            type: 'number',
            reEvaluate: [
                'strings'
            ],
        },
        strings: {
            maxLength: 99,
            minLength: 1,
            type: 'string',
            dependants: {
                numbers: '1',
            },
        },
        bools: {
            maxLength: 5,
            minLength: 4,
            type: 'bool',
        },
        radio: {
            type: 'bool',
            dependants: {
                numbers: '123',
            }
        }
    };

    // Call utility with target object and page specified rules
    // Rules are ran based on targets name
    processRules(inputTarget, rules);
}



// ------------------------------------------------------
// ---------------------- Engine ------------------------
// ------------------------------------------------------

// Rule Validation Utility
function processRules(inputTarget, rules, recursiveDepth = 2) {
    const ruleProcessors = getRuleProcessor();
    const inputValue = inputTarget.value;
    const inputName = $(inputTarget).attr("data-js-validate");
    let engineRules = ['dependants', 'reEvaluate', 'optional'];
    let errors = {};

    // Ensure rule exists
    if (!(inputName in rules)) {
        console.error('Specified rule does not exist.');
    }

    let elementRules = Object.assign({}, rules[inputName]);
    elementRules = ruleProcessors['dependants'](elementRules);
    elementRules = ruleProcessors['optional'](elementRules, inputValue);

    // If any logic modules specify 'skip' no further validation is done
    if (elementRules.skip) {
        clearErrors(inputTarget);
        return;
    }

    // TODO: refactor so user can edit error message
    if (!inputValue) {
        errors = Object.assign(errors, {empty: 'Please fill out this field.'});
        proccessErrors(errors, inputTarget);
        return;
    }

    const filteredRules = removeEngineRules(elementRules, engineRules);

    // Loop through each rule specified for the element
    // If one fails the 'True' will be returned
    let errorCounter = 0;

    for (const rule in filteredRules) {
        try {
            const constraint = filteredRules[rule];
            let singleError = ruleProcessors[rule](inputValue, constraint);

            if (singleError) {
                errors = Object.assign(errors, singleError);
            }
        } catch (error) {
            console.error(
                "The '" + rule + "' rule specified on the '" + inputName +
                "' element does not exist in the rules library." + '\n',
                error
            );
        }
    }

    // Post Evaluation with NO errors Logic Modules
    if ($.isEmptyObject(errors)) {
        ruleProcessors['reEvaluate'](rules, elementRules, recursiveDepth);
    }

    proccessErrors(errors, inputTarget);
}

function removeEngineRules(elementRules, engineRules) {
    let filteredRules = Object.assign({}, elementRules);
    for (const engineRule in engineRules) {
        if (engineRules[engineRule] in filteredRules) {
           delete filteredRules[engineRules[engineRule]];
        }
    }

    return filteredRules;
}

//TODO: allow single or many error messages
function proccessErrors(errors, target) {
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

function clearErrors(target) {
    const invalidClass = 'invalid';
    if ($(target).hasClass(invalidClass)) {
        $(target).removeClass(invalidClass);
    }
}

// ------------------------------------------------------
// ------------------ Rule Functions --------------------
// ------------------------------------------------------
function reEvaluateElements(rules, elementRules, recursiveDepth) {
    if ('reEvaluate' in elementRules && recursiveDepth > 0) {
        let elementsToEvaluate = elementRules.reEvaluate;
        recursiveDepth = recursiveDepth - 1;

        for ( let element in elementsToEvaluate ) {
            let targetElement = $('[data-js-validate="' + elementsToEvaluate[element] + '"]')[0];
        console.log(targetElement);
            processRules(targetElement, rules, recursiveDepth);
        }
    }
}

function evaluateDependants(elementRules) {
    if ('dependants' in elementRules) {
        let definedDependants = elementRules.dependants;

        for ( let property in definedDependants ) {
            let dependantValue = $('[data-js-validate="' + property + '"]').val();

            if (definedDependants.hasOwnProperty(property)
                && definedDependants[property] !== dependantValue
            ) {
                return {skip: true};
            }
        }
    }

    return elementRules;
}

function evaluateOptional(elementRules, inputValue) {
    if ('optional' in elementRules &&
        elementRules['optional'] === true &&
        !inputValue
    ) {
        return {skip: true};
    }

    return elementRules;
}



// ------------------------------------------------------
// ---------------------- Rules -------------------------
// ------------------------------------------------------
// Method containing all valid rules
// If you want a new rule add it to the object with the appropriate logic
// Will Return 'True' if validation failes
function getRuleProcessor() {
    return {
        maxLength: (value, constraint) => {
            if (!value || value.length > constraint) {
                const errorMessage = 'Input exceeded ' + constraint + ' characters.';
                return {maxLength: errorMessage};
            }
        },
        minLength: (value, constraint) => {
            if (!value || value.length < constraint) {
                const errorMessage = 'Input must be at least ' + constraint + ' characters long.';
                return {minLength: errorMessage};
            }
        },
        maxValue: (value, constraint) => {
            if (isNaN(value) || value > constraint) {
                const errorMessage = 'Input must be less than ' + constraint;
                return {maxValue: errorMessage};
            }
        },
        minValue: (value, constraint) => {
            if (isNaN(value) || value < constraint) {
                const errorMessage = 'Input must be greater than ' + constraint;
                return {minValue: errorMessage};
            }
        },
        type: (value, constraint) => {
            let actualType = null;

            switch(constraint) {
                case 'string':
                    actualType = typeof value;
                    if (actualType !== constraint) {
                        const errorMessage = 'Input must be a ' + constraint;
                        return {type: errorMessage};
                    }
                    break;
                case 'number':
                    actualType = typeof parseFloat(value);
                    if (isNaN(value) || actualType !== constraint) {
                        const errorMessage = 'Input must be a ' + constraint;
                        return {type: errorMessage};
                    }
                    break;
                case 'bool':
                    value = value.toLowerCase();
                    value = (value === "true" || value === "false");
                    if (!value) {
                        const errorMessage = 'Input must be a ' + constraint;
                        return {type: errorMessage};
                    }
                    break;
            }
        },
        reEvaluate: (rules, elementRules, recursiveDepth) => {
            reEvaluateElements(rules, elementRules, recursiveDepth);
        },
        dependants: (elementRules) => {
            return evaluateDependants(elementRules);
        },
        optional: (elementRules, inputValue) => {
            return evaluateOptional(elementRules, inputValue);
        }
    }
}
