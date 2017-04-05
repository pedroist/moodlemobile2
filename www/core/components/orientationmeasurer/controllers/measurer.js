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

angular.module('mm.core.orientationmeasurer')

/**
 * Controller to select and upload a file.
 *
 * @module mm.core.orientationmeasurer
 * @ngdoc controller
 * @name mmOrientationMeasurerCtrl
 */
.controller('mmOrientationMeasurerCtrl', function($log, $scope, $cordovaDeviceMotion) {
    
    var options = { frequency: 700 };
    $scope.watchID = null;

    function computeTiltAngle (result){
        var X = result.x;
        var Y = result.y;
        var Z = result.z;
        var timeStamp = result.timestamp;

        $log.debug("X Y Z: " + X + Y + Z);

        var angleRad = Math.acos(Z/Math.sqrt(Math.pow(X, 2) + Math.pow(Y, 2) + Math.pow(Z, 2)));
        var angleDeg = angleRad * 180 /Math.PI;
        $log.debug("Angle in degrees: " + angleDeg);
        return angleDeg;
    }

    /*function onSuccess(result){
        var X = result.x;
        var Y = result.y;
        var Z = result.z;
        var timeStamp = result.timestamp;
        alert(X);
        $log.debug("X Y Z: " + X + Y + Z);
        $scope.input.value = X;
    }*/
    function onError(result){
        $log.debug("measurer.js An error occurred");
    }
    // measure angle.
    $scope.measure = function() {

        // watch Acceleration
        $log.debug("options: " +  JSON.stringify(options, null, 4));
        $log.debug("before watch ");
        /*$cordovaDeviceMotion.getCurrentAcceleration().then(function(result) {
            var X = result.x;
            var Y = result.y;
            var Z = result.z;
            var timeStamp = result.timestamp;
            $scope.input.value = X;
        }, function(err) {
            // An error occurred. Show a message to the user
        });
        */
        /*var watch = $cordovaDeviceMotion.watchAcceleration(function onSuccess(result){
        var X = result.x;
        var Y = result.y;
        var Z = result.z;
        var timeStamp = result.timestamp;
        alert(X);
        $log.debug("X Y Z: " + X + Y + Z);
        $scope.input.value = X;
    }, onError,options);
    */  
        $scope.watchID = $cordovaDeviceMotion.watchAcceleration(options);
        $log.debug("watchID = " + JSON.stringify($scope.watchID, null,4));
        $scope.watchID.then(
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
            $scope.input.value = computeTiltAngle(result);
        });
        $log.debug("after watch ");
    };

    $scope.stop = function(){
        //if($scope.watchID != null){
            $scope.watchID.clearWatch();
        //}else{
          //  $log.debug("measurer.js An error occurred: no watchID. watchID = "
            //    + $scope.watchID);
        //}   
    };
});
