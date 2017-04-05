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

angular.module('mm.addons.qtype_coordinates')

/**
 * Directive to render a coordinates question.
 *
 * @module mm.addons.qtype_coordinates
 * @ngdoc directive
 * @name mmaQtypeCoordinates
 */
.directive('mmaQtypeCoordinates', function($log, $mmQuestionHelper) {
	$log = $log.getInstance('mmaQtypeCoordinates');

    return {
        restrict: 'A',
        priority: 100,
        templateUrl: 'addons/qtype/coordinates/template.html',
        link: function(scope) {
            var questionEl = $mmQuestionHelper.directiveInit(scope, $log);
	        if (questionEl) {
	            questionEl = questionEl[0] || questionEl; // Convert from jqLite to plain JS if needed.

	            // Get the input element.
	            inputLat = questionEl.querySelector('input[type="text"][name*=lat]');
	            inputLon = questionEl.querySelector('input[type="text"][name*=lon]');
	            if (!inputLat || !inputLon) {
	                $log.warn('Aborting because couldn\'t find input.', question.name);
	                return $mmQuestionHelper.showDirectiveError(scope);
	            }

	            scope.inputLat = {
	                id: inputLat.id,
	                name: inputLat.name,
	                value: inputLat.value,
	                readOnly: inputLat.readOnly
	            };

	            scope.inputLon = {
	                id: inputLon.id,
	                name: inputLon.name,
	                value: inputLon.value,
	                readOnly: inputLon.readOnly
	            };

	            // Check if question is marked as correct.
	            if (inputLat.className.indexOf('incorrect') >= 0) {
	                scope.inputLat.isCorrect = 0;
	            } else if (inputLat.className.indexOf('correct') >= 0) {
	                scope.inputLat.isCorrect = 1;
	            }

	            if (inputLon.className.indexOf('incorrect') >= 0) {
	                scope.inputLon.isCorrect = 0;
	            } else if (inputLon.className.indexOf('correct') >= 0) {
	                scope.inputLon.isCorrect = 1;
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
