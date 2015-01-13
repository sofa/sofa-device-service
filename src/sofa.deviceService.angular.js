angular.module('sofa.deviceService', [])

.factory('deviceService', ['$window', function ($window) {

    'use strict';

    return new sofa.DeviceService($window);
}]);
