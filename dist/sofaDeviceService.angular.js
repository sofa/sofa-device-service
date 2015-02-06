/**
 * sofa-device-service - v0.5.1 - Fri Feb 06 2015 17:02:13 GMT+0100 (CET)
 * http://www.sofa.io
 *
 * Copyright (c) 2014 CouchCommerce GmbH (http://www.couchcommerce.com / http://www.sofa.io) and other contributors
 * THIS SOFTWARE CONTAINS COMPONENTS OF THE SOFA.IO COUCHCOMMERCE SDK (WWW.SOFA.IO)
 * IT IS PROVIDED UNDER THE LICENSE TERMS OF THE ATTACHED LICENSE.TXT.
 */
;(function (angular) {
angular.module('sofa.deviceService', [])

.factory('deviceService', ['$window', function ($window) {

    'use strict';

    return new sofa.DeviceService($window);
}]);
}(angular));