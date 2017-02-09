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

angular.module('mm.core.photouploader')

/**
 * Controller to select and upload a file.
 *
 * @module mm.core.photouploader
 * @ngdoc controller
 * @name mmPhotoUploaderPickerCtrl
 */
.controller('mmPhotoUploaderPickerCtrl', function($log, $scope, $mmUtil, $mmPhotoUploaderHelper, $ionicHistory, $mmApp, $mmFS, $q,
            $mmPhotoUploaderDelegate, $stateParams, $state, $translate) {

    var maxSize = $stateParams.maxsize,
        upload = $stateParams.upload,
        allowOffline = $stateParams.allowOffline && !upload,
        uploadMethods = {
            album: $mmPhotoUploaderHelper.uploadImage,
            camera: $mmPhotoUploaderHelper.uploadImage,
            audio: $mmPhotoUploaderHelper.uploadAudioOrVideo,
            video: $mmPhotoUploaderHelper.uploadAudioOrVideo
        };
    /*$log.debug("PTC: core/components/photouploader/controllers/picker.js after vars definition");
    $log.debug("PTC: core/components/photouploader/controllers/picker.js object $stateParams: "
            +JSON.stringify($stateParams,null,4));
    $log.debug("PTC: core/components/photouploader/controllers/picker.js object $state.params: "
            +JSON.stringify($state.params,null,4));
    $log.debug("PTC: core/components/photouploader/controllers/picker.js object $stateParams.params: "
            +JSON.stringify($stateParams.params,null,4));
    $log.debug("PTC: core/components/photouploader/controllers/picker.js $ionicHistory.backView: "
            + JSON.stringify($ionicHistory.backView(),null,4));
    $log.debug("PTC: core/components/photouploader/controllers/picker.js $ionicHistory.currentView: "
            + JSON.stringify($ionicHistory.currentView(),null,4));
    $log.debug("PTC: core/components/photouploader/controllers/picker.js $ionicHistory.forwardView: "
            + JSON.stringify($ionicHistory.forwardView(),null,4));
    */
    $scope.isAndroid = ionic.Platform.isAndroid();
    $scope.handlers = $mmPhotoUploaderDelegate.getHandlers();
    $scope.title = $translate.instant(upload ? 'mm.photouploader.uploadafile' : 'mm.photouploader.selectafile');

    // Function called when a file is uploaded.
    function successUploading(result) {
        $log.debug("PTC: core/components/photouploader/controllers/picker.js successUploading()");
        $mmPhotoUploaderHelper.fileUploaded(result);
        /*$log.debug("PTC: core/components/photouploader/controllers/picker.js successUploading() viewHistory(): "
                +JSON.stringify($ionicHistory.viewHistory(),null,4));
        */
        //$ionicHistory.goBack();
    }

    // Function called when a file upload fails.
    function errorUploading(err) {
        $log.debug("PTC: core/components/photouploader/controllers/picker.js errorUploading()");
        if (err) {
            $mmUtil.showErrorModal(err);
        }
        return $q.reject();
    }

    // Upload a file given the fileEntry.
    function uploadFileEntry(fileEntry, deleteAfterUpload) {
        return $mmFS.getFileObjectFromFileEntry(fileEntry).then(function(file) {
            return uploadFileObject(file).then(function() {
                if (deleteAfterUpload) {
                    // We have uploaded and deleted a copy of the file. Now delete the original one.
                    $mmFS.removeFileByFileEntry(fileEntry);
                }
            });
        }, function() {
            $mmUtil.showErrorModal('mm.photouploader.errorreadingfile', true);
            return $q.reject();
        });
    }

    // Upload a file given the file object.
    function uploadFileObject(file) {
        if (maxSize != -1 && file.size > maxSize) {
            return $mmPhotoUploaderHelper.errorMaxBytes(maxSize, file.name);
        }

        return $mmPhotoUploaderHelper.confirmUploadFile(file.size, false, allowOffline).then(function() {
            // We have the data of the file to be uploaded, but not its URL (needed). Create a copy of the file to upload it.
            return $mmPhotoUploaderHelper.copyAndUploadFile(file, upload).then(successUploading, errorUploading);
        }, errorUploading);
    }

    // Upload media.
    $scope.upload = function(type, param) {
        if (!allowOffline && !$mmApp.isOnline()) {
            $mmUtil.showErrorModal('mm.photouploader.errormustbeonlinetoupload', true);
        } else {
            if (typeof(uploadMethods[type]) !== 'undefined') {
                $log.debug("PTC: core/components/photouploader/controllers/picker.js upload() line 88");
                uploadMethods[type](param, maxSize, upload).then(successUploading, errorUploading);
            }
        }
    };

    // Upload a file selected with input type="file".
    $scope.uploadFile = function(evt) {
        var input = evt.srcElement;
        var file = input.files[0];
        input.value = ''; // Unset input.
        if (file) {
            uploadFileObject(file);
        }
    };

    // A handler was clicked.
    $scope.handlerClicked = function(e, action) {
        e.preventDefault();
        e.stopPropagation();
        action(maxSize, upload).then(function(data) {
            if (data.uploaded) {
                // The handler already uploaded the file. Return the result.
                // We shouldn't enter here if upload is false, but that's the handler's fault.
                successUploading(data.result);
            } else {
                // The handler didn't upload the file, we need to upload it.
                if (data.fileEntry) {
                    // The handler provided us a fileEntry, use it.
                    return uploadFileEntry(data.fileEntry, data.delete);
                } else if (data.path) {
                    // The handler provided a path. First treat it like it's a relative path.
                    return $mmFS.getFile(data.path).then(function(fileEntry) {
                        return uploadFileEntry(fileEntry, data.delete);
                    }, function() {
                        // File not found, it's probably an absolute path.
                        return $mmFS.getExternalFile(data.path).then(function(fileEntry) {
                            return uploadFileEntry(fileEntry, data.delete);
                        }, errorUploading);
                    });
                }

                // Nothing received, fail.
                $mmUtil.showErrorModal('No file received');
            }
        });
    };

    $scope.$on('$destroy', function(){
        $mmPhotoUploaderHelper.filePickerClosed();
    });
});
