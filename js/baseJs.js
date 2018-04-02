
// Additions:
// 		Branching rule logic based on other input values
//		Make into an NPM library (will this even work on FE?)
//		Consider seperating Rule logic into a seperate file(s)
//      Should rules be stored in a data attribute on each element to validate?
//			-	BOTH: allow the developers to choose (Enusre choice is consistent in project)
//		Build seperate method for error message reporting
// 		Build logic to allow same rules for two different inputs without adding new data tag to rules array
//      Build organizer method to allow users specify which order the rules should be ran


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
                'strings',
                'bools',
            ],
            // rule: 'reEvaluate' to target what element for reEvaluation and update
        },
        strings: {
            maxLength: 99,
            minLength: 1,
            type: 'string',
            dependants: {
                numbers: '1',
            }
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
function processRules(inputTarget, rules) {
    const ruleProcessors = getRuleProcessor();
    const inputValue = inputTarget.value;
    const inputName = $(inputTarget).attr("data-js-validate");
    let engineRules = ['dependants', 'reEvaluate'];
    let errorsFound = false;

    // Ensure rule exists
    if (!(inputName in rules)) {
        console.error('Specified rule does not exist.');
    }

    const elementRules = rules[inputName];

    let preEvaluationResults = evaluateDependants(elementRules);


    // If any logic modules specify 'skip' no further validation is done
    if (preEvaluationResults.skip) {
        return;
    }

    const filteredRules = removeEngineRules(elementRules, engineRules);

    // Loop through each rule specified for the element
    // If one fails the 'True' will be returned
    for (const rule in filteredRules) {
        try {
            const constraint = filteredRules[rule];
            const results = ruleProcessors[rule](inputValue, constraint);

            if (results === true) {
                errorsFound = results;
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
    if (!errorsFound) {
        console.log('here');
        reEvaluateElements(rules, elementRules);
    }

    // If errors are found add error class else remove class if it exists
    // TODO: breakout
    if (errorsFound) {
        // TODO: pass error message to update page
        $(inputTarget).addClass("invalid");
    } else if ($(inputTarget).hasClass("invalid")) {
        $(inputTarget).removeClass("invalid");
    }
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

function reEvaluateElements(rules, elementRules) {
    console.log(elementRules);
    if ('reEvaluate' in elementRules) {
       console.log('im here');
    }
}

function evaluateDependants(rules) {
    if ('dependants' in rules) {
        let definedDependants = rules.dependants;

        for ( let property in definedDependants ) {
            let dependantValue = $('[data-js-validate="' + property + '"]').val();

            if (definedDependants.hasOwnProperty(property)
                && definedDependants[property] !== dependantValue
            ) {
                return {skip: true};
            }
        }
    }

    return rules;
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
            if (value.length > constraint) {
                return true;
            }
        },
        minLength: (value, constraint) => {
            if (value.length < constraint) {
                return true;
            }
        },
        maxValue: (value, constraint) => {
            if (isNaN(value) || value > constraint) {
                return true;
            }
        },
        minValue: (value, constraint) => {
            if (isNaN(value) || value < constraint) {
                return true;
            }
        },
        type: (value, constraint) => {
            let actualType = null;
            switch(constraint) {
                case 'string':
                    actualType = typeof value;
                    if (actualType !== constraint) {
                        return true;
                    }
                    break;
                case 'number':
                    actualType = typeof parseFloat(value);
                    if (isNaN(value) || actualType !== constraint) {
                        return true;
                    }
                    break;
                case 'bool':
                    value = value.toLowerCase();
                    value = (value === "true" || value === "false");
                    if (!value) {
                        return true;
                    }
                    break;
            }
        },
    }
}
