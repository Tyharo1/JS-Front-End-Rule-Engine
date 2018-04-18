import { reEvaluateElements, evaluateDependants, evaluateOptional } from './rulesEngine.js';
// ------------------------------------------------------
// ------------------ Engine Rules ----------------------
// ------------------------------------------------------
// Method containing all valid rules
// If you want a new rule add it to the object with the appropriate logic
// Will Return 'True' if validation failes
export function getRuleProcessor() {
    return {
        maxLength: (value, constraint) => {
            if (!value || value.length > constraint) {
                const errorMessage = 'Input exceeded ' + constraint + ' characters.';
                return { maxLength: errorMessage };
            }
        },
        minLength: (value, constraint) => {
            if (!value || value.length < constraint) {
                const errorMessage = 'Input must be at least ' + constraint + ' characters long.';
                return { minLength: errorMessage };
            }
        },
        maxValue: (value, constraint) => {
            if (isNaN(value) || value > constraint) {
                const errorMessage = 'Input must be less than ' + constraint;
                return { maxValue: errorMessage };
            }
        },
        minValue: (value, constraint) => {
            if (isNaN(value) || value < constraint) {
                const errorMessage = 'Input must be greater than ' + constraint;
                return { minValue: errorMessage };
            }
        },
        type: (value, constraint) => {
            let actualType = null;

            switch (constraint) {
                case 'string':
                    actualType = typeof value;
                    if (actualType !== constraint) {
                        const errorMessage = 'Input must be a ' + constraint;
                        return { type: errorMessage };
                    }
                    break;
                case 'number':
                    actualType = typeof parseFloat(value);
                    if (isNaN(value) || actualType !== constraint) {
                        const errorMessage = 'Input must be a ' + constraint;
                        return { type: errorMessage };
                    }
                    break;
                case 'bool':
                    value = value.toLowerCase();
                    value = value === "true" || value === "false";
                    if (!value) {
                        const errorMessage = 'Input must be a ' + constraint;
                        return { type: errorMessage };
                    }
                    break;
            }
        },
        reEvaluate: (rules, elementRules, recursiveDepth) => {
            reEvaluateElements(rules, elementRules, recursiveDepth);
        },
        dependants: elementRules => {
            return evaluateDependants(elementRules);
        },
        optional: (elementRules, inputValue) => {
            return evaluateOptional(elementRules, inputValue);
        }
    };
}

export default getRuleProcessor;