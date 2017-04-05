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
 * Service to interact with addons to be shown in the file picker to upload a file.
 *
 * @module mm.core.photouploader
 * @ngdoc provider
 * @name $mmPhotoUploaderDelegate
 */
.provider('$mmPhotoUploaderDelegate', function() {
    var handlers = {},
        self = {};

    /**
     * Register a photo picker handler.
     *
     * @module mm.core.photouploader
     * @ngdoc method
     * @name $mmPhotoUploaderDelegate#registerHandler
     * @param {String} addon The addon's name (mmaFiles, mmaMessages, ...)
     * @param {String|Object|Function} handler Must be resolved to an object defining the following functions. Or to a function
     *                           returning an object defining these functions. See {@link $mmUtil#resolveObject}.
     *                             - isEnabled (Boolean|Promise) Whether or not the handler is enabled on a site level.
     *                                                           When using a promise, it should return a boolean.
     *                             - getController (Object) Returns the object that will act as controller. This is the list of
     *                                     expected scope variables:
     *                                         * class Optional. Class to add to the handler's row.
     *                                         * title Required. Title to show in the handler's row.
     *                                         * icon Optional. Icon to show in the handler's row.
     *                                         * action Required. A function called when the handler is clicked, receives maxSize
     *                                             as parameter. It must return an object - or a promise resolved with an object -
     *                                             containing these properties:
     *                                                 - uploaded Boolean. Whether the handler uploaded the file.
     *                                                 - path String. Ignored if uploaded=true. The path of the file to upload.
     *                                                 - fileEntry Object. Ignored if uploaded=true. The fileEntry to upload.
     *                                                 - delete Boolean. Ignored if uploaded=true. Whether the file should be
     *                                                          deleted after upload.
     *                                                 - result Object. Ignored if uploaded=false. The result of the upload.
     */
    self.registerHandler = function(addon, handler, priority) {
        if (typeof handlers[addon] !== 'undefined') {
            console.log("$mmPhotoUploaderDelegate: Addon '" + handlers[addon].addon + "' already registered as handler");
            return false;
        }
        console.log("$mmPhotoUploaderDelegate: Registered addon '" + addon + "' as handler.");
        handlers[addon] = {
            addon: addon,
            handler: handler,
            instance: undefined,
            priority: priority
        };
        return true;
    };

    self.$get = function($mmUtil, $q, $log, $mmSite) {
        var enabledHandlers = {},
            self = {},
            lastUpdateHandlersStart;

        $log = $log.getInstance('$mmPhotoUploaderDelegate');

        /**
         * Clear current site handlers. Reserved for core use.
         *
         * @module mm.core.photouploader
         * @ngdoc method
         * @name $mmPhotoUploaderDelegate#clearSiteHandlers
         * @return {Void}
         */
        self.clearSiteHandlers = function() {
            enabledHandlers = {};
        };

        /**
         * Get the handlers for the current site.
         *
         * @module mm.core.photouploader
         * @ngdoc method
         * @name $mmPhotoUploaderDelegate#getHandlers
         * @return {Promise} Resolved with an array of objects containing 'priority' and 'controller'.
         */
        self.getHandlers = function() {
            var handlers = [];

            angular.forEach(enabledHandlers, function(handler) {
                handlers.push({
                    controller: handler.instance.getController(),
                    priority: handler.priority
                });
            });

            return handlers;
        };

        /**
         * Check if a time belongs to the last update handlers call.
         * This is to handle the cases where updateHandlers don't finish in the same order as they're called.
         *
         * @module mm.core.photouploader
         * @ngdoc method
         * @name $mmPhotoUploaderDelegate#isLastUpdateCall
         * @param  {Number}  time Time to check.
         * @return {Boolean}      True if equal, false otherwise.
         */
        self.isLastUpdateCall = function(time) {
            if (!lastUpdateHandlersStart) {
                return true;
            }
            return time == lastUpdateHandlersStart;
        };

        /**
         * Update the handler for the current site.
         *
         * @module mm.core.photouploader
         * @ngdoc method
         * @name $mmPhotoUploaderDelegate#updateHandler
         * @param  {String} addon       The addon.
         * @param  {Object} handlerInfo The handler details.
         * @param  {Number} time        Time this update process started.
         * @return {Promise}            Resolved when enabled, rejected when not.
         * @protected
         */
        self.updateHandler = function(addon, handlerInfo, time) {
            var promise,
                siteId = $mmSite.getId();

            if (typeof handlerInfo.instance === 'undefined') {
                handlerInfo.instance = $mmUtil.resolveObject(handlerInfo.handler, true);
            }

            if (!$mmSite.isLoggedIn()) {
                promise = $q.reject();
            } else {
                promise = $q.when(handlerInfo.instance.isEnabled());
            }

            // Checks if the content is enabled.
            return promise.catch(function() {
                return false;
            }).then(function(enabled) {
                // Verify that this call is the last one that was started.
                // Check that site hasn't changed since the check started.
                if (self.isLastUpdateCall(time) && $mmSite.isLoggedIn() && $mmSite.getId() === siteId) {
                    if (enabled) {
                        enabledHandlers[addon] = {
                            instance: handlerInfo.instance,
                            priority: handlerInfo.priority
                        };
                    } else {
                        delete enabledHandlers[addon];
                    }
                }
            });
        };

        /**
         * Update the handlers for the current site.
         *
         * @module mm.core.photouploader
         * @ngdoc method
         * @name $mmPhotoUploaderDelegate#updateHandlers
         * @return {Promise} Resolved when done.
         * @protected
         */
        self.updateHandlers = function() {
            var promises = [],
                now = new Date().getTime();

            $log.debug('Updating navigation handlers for current site.');

            lastUpdateHandlersStart = now;

            // Loop over all the content handlers.
            angular.forEach(handlers, function(handlerInfo, addon) {
                promises.push(self.updateHandler(addon, handlerInfo, now));
            });

            return $q.all(promises).then(function() {
                return true;
            }, function() {
                // Never reject.
                return true;
            });
        };

        return self;
    };

    return self;

});
