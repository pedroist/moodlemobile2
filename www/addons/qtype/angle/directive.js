// (C) Copyright 2015 Martin Dougiamas
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

angular.module('mm.addons.qtype_angle')

/**
 * Directive to render a angle question.
 *
 * @module mm.addons.qtype_angle
 * @ngdoc directive
 * @name mmaQtypeAngle
 */
.directive('mmaQtypeAngle', function($log, $mmQuestionHelper) {
	$log = $log.getInstance('mmaQtypeAngle');

    return {
        restrict: 'A',
        priority: 100,
        templateUrl: 'addons/qtype/angle/template.html',
        link: function(scope) {
	        var questionEl = $mmQuestionHelper.directiveInit(scope, $log);
	        if (questionEl) {
	            questionEl = questionEl[0] || questionEl; // Convert from jqLite to plain JS if needed.

	            // Get the input element.
	            input = questionEl.querySelector('input[type="text"][name*=angle_resp]');

	            if (!input) {
	                $log.warn('Aborting because couldn\'t find input.', question.name);
	                return $mmQuestionHelper.showDirectiveError(scope);
	            }

	            scope.input = {
	                id: input.id,
	                name: input.name,
	                value: input.value,
	                readOnly: input.readOnly
	            };

	            // Check if question is marked as correct.
	            if (input.className.indexOf('incorrect') >= 0) {
	                scope.input.isCorrect = 0;
	            } else if (input.className.indexOf('correct') >= 0) {
	                scope.input.isCorrect = 1;
	            }

	            scope.review = false;
	            status = scope.question.status;
	            if(status === "Not answered" || status === "Correct" 
	            	|| status === "Incorrect"){
	            		scope.review = true;
	            }
	        }
	    }
	};
});
