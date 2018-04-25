'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.reEvaluateElements = reEvaluateElements;
exports.evaluateDependants = evaluateDependants;
exports.evaluateOptional = evaluateOptional;

var _engineRules = require('./engineRules.js');

var _errorHandler = require('./errorHandler.js');

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
function processRules(inputTarget, rules) {
    var recursiveDepth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

    var ruleProcessors = (0, _engineRules.getRuleProcessor)();
    var inputValue = inputTarget.value;
    var inputName = $(inputTarget).attr("data-js-validate");
    var engineRules = ['dependants', 'reEvaluate', 'optional'];
    var errors = {};

    // Ensure rule exists
    if (!(inputName in rules)) {
        console.error('Specified rule does not exist.');
    }

    var elementRules = Object.assign({}, rules[inputName]);
    elementRules = ruleProcessors['dependants'](elementRules);
    elementRules = ruleProcessors['optional'](elementRules, inputValue);

    // If any logic modules specify 'skip' no further validation is done
    if (elementRules.skip) {
        (0, _errorHandler.clearErrors)(inputTarget);
        return;
    }

    // TODO: refactor so user can edit error message
    if (!inputValue) {
        errors = Object.assign(errors, { empty: 'Please fill out this field.' });
        (0, _errorHandler.proccessErrors)(errors, inputTarget);
        return;
    }

    var filteredRules = removeEngineRules(elementRules, engineRules);

    // Loop through each rule specified for the element
    // If one fails the 'True' will be returned
    var errorCounter = 0;

    for (var rule in filteredRules) {
        try {
            var constraint = filteredRules[rule];
            var singleError = ruleProcessors[rule](inputValue, constraint);

            if (singleError) {
                errors = Object.assign(errors, singleError);
            }
        } catch (error) {
            console.error("The '" + rule + "' rule specified on the '" + inputName + "' element does not exist in the rules library." + '\n', error);
        }
    }

    // Post Evaluation with NO errors Logic Modules
    if ($.isEmptyObject(errors)) {
        ruleProcessors['reEvaluate'](rules, elementRules, recursiveDepth);
    }

    (0, _errorHandler.proccessErrors)(errors, inputTarget);
}

// ------------------------------------------------------
// ------------------ Rule Functions --------------------
// ------------------------------------------------------
function removeEngineRules(elementRules, engineRules) {
    var filteredRules = Object.assign({}, elementRules);
    for (var engineRule in engineRules) {
        if (engineRules[engineRule] in filteredRules) {
            delete filteredRules[engineRules[engineRule]];
        }
    }

    return filteredRules;
}

function reEvaluateElements(rules, elementRules, recursiveDepth) {
    if ('reEvaluate' in elementRules && recursiveDepth > 0) {
        var elementsToEvaluate = elementRules.reEvaluate;
        recursiveDepth = recursiveDepth - 1;

        for (var element in elementsToEvaluate) {
            var targetElement = $('[data-js-validate="' + elementsToEvaluate[element] + '"]')[0];
            processRules(targetElement, rules, recursiveDepth);
        }
    }
}

function evaluateDependants(elementRules) {
    if ('dependants' in elementRules) {
        var definedDependants = elementRules.dependants;

        for (var property in definedDependants) {
            var dependantValue = $('[data-js-validate="' + property + '"]').val();

            if (definedDependants.hasOwnProperty(property) && definedDependants[property] !== dependantValue) {
                return { skip: true };
            }
        }
    }

    return elementRules;
}

function evaluateOptional(elementRules, inputValue) {
    if ('optional' in elementRules && elementRules['optional'] === true && !inputValue) {
        return { skip: true };
    }

    return elementRules;
}