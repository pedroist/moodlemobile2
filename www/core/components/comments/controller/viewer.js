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

angular.module('mm.core.comments')

/**
 * Comment viewer controller.
 *
 * @module mm.core.comments
 * @ngdoc controller
 * @name mmCommentViewerCtrl
 */
.controller('mmCommentViewerCtrl', function($stateParams, $scope, $translate, $mmComments, $mmUtil, $mmUser, $q, $log) {
	$log.debug('PTC components/comments/controller/viewer.js: inside mmCommentViewerCtrl controller');
    var contextLevel = $stateParams.contextLevel,
        instanceId = $stateParams.instanceId,
        component = $stateParams.component,
        itemId = $stateParams.itemId,
        area = $stateParams.area,
        page = $stateParams.page || 0;

    $scope.title = $stateParams.title || $translate.instant('mm.core.comments');

    function fetchComments() {
        // Get comments data.
		$log.debug('PTC components/comments/controller/viewer.js:fetchComments()');
        return $mmComments.getComments(contextLevel, instanceId, component, itemId, area, page).then(function(comments) {
            $scope.comments = comments;
            angular.forEach(comments, function(comment) {
                // Get the user profile image.
                $mmUser.getProfile(comment.userid, undefined, true).then(function(user) {
                    comment.profileimageurl = user.profileimageurl || true;
                });
            });
        }).catch(function(error) {
			$log.debug('PTC components/comments/controller/viewer.js: fetchComments() error catch');
            if (error) {
                if (component == 'assignsubmission_comments') {
                    $mmUtil.showModal('mm.core.notice', 'mm.core.commentsnotworking');
                } else {
                    $mmUtil.showErrorModal(error);
                }
            } else {
                $translate('mm.core.error').then(function(error) {
                    $mmUtil.showErrorModal(error + ': get_comments');
                });
            }

            return $q.reject();
        });
    }

    fetchComments().finally(function() {
		$log.debug('PTC components/comments/controller/viewer.js: fetchComments finally');
        $scope.commentsLoaded = true;
    });

    $scope.refreshComments = function() {
		$log.debug('PTC components/comments/controller/viewer.js: refreshComments()');
        return $mmComments.invalidateCommentsData(contextLevel, instanceId, component, itemId, area, page).finally(function() {
            return fetchComments().finally(function() {
				$log.debug('PTC components/comments/controller/viewer.js: refreshComments finally');
                $scope.$broadcast('scroll.refreshComplete');
            });
        });
    };
});