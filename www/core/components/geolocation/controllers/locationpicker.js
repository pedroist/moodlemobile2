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

angular.module('mm.core.geolocation')

/**
 * Controller to select and upload a file.
 *
 * @module mm.core.orientationmeasurer
 * @ngdoc controller
 * @name mmOrientationMeasurerCtrl
 */
.controller('mmGeolocationCtrl', function($log, $scope, $cordovaGeolocation) {
    
    var options = {
        timeout : 3000,
        enableHighAccuracy: false // may cause errors if true
    };
    var watchID = null;

    
    $scope.measure = function() {

        // watch location
        $log.debug("options: " +  JSON.stringify(options, null, 4));
        $log.debug("before watch ");

        watchID = $cordovaGeolocation.watchPosition(options)
        .then(
        null,
        function(error) {//error callback
            // An error occurred
            $log.debug("measurer.js An error occurred");
        },
        function(result){ //notify callback
            /*var X = result.x;
            var Y = result.y;
            var Z = result.z;
            var timeStamp = result.timestamp;
            
            $log.debug("X Y Z: " + X + Y + Z);
            */
            $scope.inputLat.value = position.coords.latitude;
            $scope.inputLon.value = position.coords.longitude;
        });
        
        $log.debug("after watch ");
    };

    $scope.stop = function(){
        if(watchID){
            watch.clearWatch();
        }else{
            $log.debug("measurer.js An error occurred: no watchID");
        }   
    };
});
