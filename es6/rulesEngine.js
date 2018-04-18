import { getRuleProcessor } from './engineRules.js';
import { proccessErrors, clearErrors } from './errorHandler.js';
// Additions:
//		Make into an NPM library (will this even work on FE?)
//		Consider seperating Rule logic into a seperate file(s)
//      Should rules be stored in a data attribute on each element to validate?
//			-	BOTH: allow the developers to choose (Enusre choice is consistent in project)
// 		Build logic to allow same rules for two different inputs without adding new data tag to rules array

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

// ------------------------------------------------------
// ------------------ Rule Functions --------------------
// ------------------------------------------------------
function removeEngineRules(elementRules, engineRules) {
    let filteredRules = Object.assign({}, elementRules);
    for (const engineRule in engineRules) {
        if (engineRules[engineRule] in filteredRules) {
           delete filteredRules[engineRules[engineRule]];
        }
    }

    return filteredRules;
}

export function reEvaluateElements(rules, elementRules, recursiveDepth) {
    if ('reEvaluate' in elementRules && recursiveDepth > 0) {
        let elementsToEvaluate = elementRules.reEvaluate;
        recursiveDepth = recursiveDepth - 1;

        for ( let element in elementsToEvaluate ) {
            let targetElement = $('[data-js-validate="' + elementsToEvaluate[element] + '"]')[0];
            processRules(targetElement, rules, recursiveDepth);
        }
    }
}

export function evaluateDependants(elementRules) {
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

export function evaluateOptional(elementRules, inputValue) {
    if ('optional' in elementRules &&
        elementRules['optional'] === true &&
        !inputValue
    ) {
        return {skip: true};
    }

    return elementRules;
}
