'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getRuleProcessor = getRuleProcessor;

var _rulesEngine = require('./rulesEngine.js');

// ------------------------------------------------------
// ------------------ Engine Rules ----------------------
// ------------------------------------------------------
// Method containing all valid rules
// If you want a new rule add it to the object with the appropriate logic
// Will Return 'True' if validation failes
function getRuleProcessor() {
    return {
        maxLength: function maxLength(value, constraint) {
            if (!value || value.length > constraint) {
                var errorMessage = 'Input exceeded ' + constraint + ' characters.';
                return { maxLength: errorMessage };
            }
        },
        minLength: function minLength(value, constraint) {
            if (!value || value.length < constraint) {
                var errorMessage = 'Input must be at least ' + constraint + ' characters long.';
                return { minLength: errorMessage };
            }
        },
        maxValue: function maxValue(value, constraint) {
            if (isNaN(value) || value > constraint) {
                var errorMessage = 'Input must be less than ' + constraint;
                return { maxValue: errorMessage };
            }
        },
        minValue: function minValue(value, constraint) {
            if (isNaN(value) || value < constraint) {
                var errorMessage = 'Input must be greater than ' + constraint;
                return { minValue: errorMessage };
            }
        },
        type: function type(value, constraint) {
            var actualType = null;

            switch (constraint) {
                case 'string':
                    actualType = typeof value === 'undefined' ? 'undefined' : _typeof(value);
                    if (actualType !== constraint) {
                        var errorMessage = 'Input must be a ' + constraint;
                        return { type: errorMessage };
                    }
                    break;
                case 'number':
                    actualType = _typeof(parseFloat(value));
                    if (isNaN(value) || actualType !== constraint) {
                        var _errorMessage = 'Input must be a ' + constraint;
                        return { type: _errorMessage };
                    }
                    break;
                case 'bool':
                    value = value.toLowerCase();
                    value = value === "true" || value === "false";
                    if (!value) {
                        var _errorMessage2 = 'Input must be a ' + constraint;
                        return { type: _errorMessage2 };
                    }
                    break;
            }
        },
        reEvaluate: function reEvaluate(rules, elementRules, recursiveDepth) {
            (0, _rulesEngine.reEvaluateElements)(rules, elementRules, recursiveDepth);
        },
        dependants: function dependants(elementRules) {
            return (0, _rulesEngine.evaluateDependants)(elementRules);
        },
        optional: function optional(elementRules, inputValue) {
            return (0, _rulesEngine.evaluateOptional)(elementRules, inputValue);
        }
    };
}

exports.default = getRuleProcessor;