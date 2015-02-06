/**
 * sofa-device-service - v0.5.1 - Fri Feb 06 2015 17:02:13 GMT+0100 (CET)
 * http://www.sofa.io
 *
 * Copyright (c) 2014 CouchCommerce GmbH (http://www.couchcommerce.com / http://www.sofa.io) and other contributors
 * THIS SOFTWARE CONTAINS COMPONENTS OF THE SOFA.IO COUCHCOMMERCE SDK (WWW.SOFA.IO)
 * IT IS PROVIDED UNDER THE LICENSE TERMS OF THE ATTACHED LICENSE.TXT.
 */
;(function (sofa, document, undefined) {
'use strict';
/* global navigator */
/* global document */
/* global sofa */
/* global CustomEvent */
/**
 * @sofadoc class
 * @name sofa.DeviceService
 * @distFile dist/sofa.deviceService.js
 * @package sofa-device-service
 * @requiresPackage sofa-core
 *
 * @description
 * This is a helper service that gives you methods to check for certain contexts
 * on touch devices etc. It determines the state for the usage of flexbox as well
 * as things like overflow:scroll support.
 */
sofa.define('sofa.DeviceService', function ($window) {
    var self = {};

    var ua = navigator.userAgent,
        htmlTag,
        dimensions = {},
        userOS,
        userOSver,
        mqTabletSize,
        mqPortrait;

    var MODERN_FLEXBOX_SUPPORT = 'modern-flexbox',
        OVERFLOW_SUPPORT = 'overflow-support',
        NO_PREFIX = 'no-',
        ANDROID_2X = 'android-2',
        IPAD_ON_IOS_7 = 'ipad-ios-7';

    /**
     * @param supports {boolean}
     * @param className {string}
     * @param negator {string}
     *
     * @description
     * Adds a className to the HTML element which is indicating support or no-support for a tested feature
     */
    var flag = function (supports, className, negator) {
        var htmlTag = self.getHtmlTag();
        htmlTag.className += supports ? ' ' + className : ' ' + negator + className;
    };

    /**
     * @param uaString {string}
     *
     * @description
     * Returns the user's operating system as a string. Either "iOS", "Android" or "unknown".
     *
     * @returns {string}
     */
    var getOs = function (uaString) {
        var os = 'unknown';

        if (uaString.match(/iPad/i) || uaString.match(/iPhone/i)) {
            os = 'iOS';
        } else if (uaString.match(/Android/i)) {
            os = 'Android';
        }

        return os;
    };

    /**
     * @param uaString {string}
     * @param operatingSystem {string}
     *
     * @description
     * Returns the user's operating system version as a string. Only for iOS and Android, otherwise "unknown".
     *
     * @returns {string}
     */
    var getOsVersion = function (uaString, operatingSystem) {
        var version = 'unknown';

        if (operatingSystem === 'iOS' && uaString.match(/OS /)) {
            version = uaString.substr(uaString.indexOf('OS ') + 3, 3).replace('_', '.');
        } else if (operatingSystem === 'Android' && uaString.match(/Android /)) {
            version = uaString.substr(uaString.indexOf('Android ') + 8, 3);
        }

        return version;
    };

    /**
     * @description
     * Updates the dimension object with current values of viewport width and height.
     */
    var updateDimension = function () {
        dimensions.width = $window.innerWidth;
        dimensions.height = $window.innerHeight;
    };

    /**
     * @param str {string}
     *
     * @description
     * Returns whether the current user's OS (major-) version equals the passed in value.
     *
     * @returns {boolean}
     */
    var versionStartsWith = function (str) {
        var version = self.getOsVersion();
        return version.indexOf(str) === 0;
    };

    /**
     * @description
     * Introduces a custom event for orientation change and adds listeners to matchMedia
     * objects if matchMedia is available. Falls back to using standard orientationchange event.
     */
    var addOrientationChangeHandler = function () {
        var deviceServiceOrientationChange = new CustomEvent('deviceService.orientationchange');

        if ($window.matchMedia) {
            mqTabletSize = $window.matchMedia('screen and (min-width: 641px)');
            mqPortrait   = $window.matchMedia('screen and (orientation: portrait)');
        }

        if ($window.matchMedia) {
            mqPortrait.addListener(function handleOrientationChange() {
                updateDimension();
                $window.dispatchEvent(deviceServiceOrientationChange);
            });
        } else {
            $window.addEventListener('orientationchange', function () {
                updateDimension();
                $window.dispatchEvent(deviceServiceOrientationChange);
            }, false);
        }
    };

    /**
     * @description
     * Adds global "fix" for iOS' bug where changing device orientation while the keyboard is visible
     * causes massive layout issues. Doesn't fix problems entirely, though.
     */
    var applyIosInputFocusFix = function () {
        if (userOS === 'iOS') {
            $window.addEventListener('resize', function () {
                $window.setTimeout(function () {
                    document.documentElement.style.minWidth = $window.innerWidth + 'px';
                }, 0);
            });
        }
    };

    /**
     * @description
     * Initial setup for the deviceService.
     * Sets OS variables and starts some functions that are needed to run upfront.
     */
    (function setupDeviceService() {
        userOS = getOs(ua);
        userOSver = getOsVersion(ua, userOS);

        updateDimension();
        addOrientationChangeHandler();
        applyIosInputFocusFix();
    }());

    /**
     * @sofadoc method
     * @name sofa.DeviceService#getHtmlTag
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns an HTMLDomObject for HTML.
     *
     * @return {object} HTMLDomObject
     */
    self.getHtmlTag = function () {
        return htmlTag || document.documentElement;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#isIpadOnIos7
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns a boolean indicating whether the device is an iPad running iOS7 or not.
     *
     * @return {boolean}
     */
    self.isIpadOnIos7 = function () {
        return ua.match(/iPad/i) && versionStartsWith('7');
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#getViewportDimensions
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns a dimension object holding the width and height of the viewport.
     *
     * @return {object}
     */
    self.getViewportDimensions = function () {
        return dimensions;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#isInPortraitMode
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns a bool indicating whether the device is held in portrait mode.
     *
     * @return {bool} boolean
     */
    self.isInPortraitMode = function () {
        return $window.matchMedia ? mqPortrait.matches : dimensions.height > dimensions.width;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#isLandscapeMode
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns a bool indicating whether the device is held in landscape mode.
     *
     * @return {boolean}
     */
    self.isInLandscapeMode = function () {
        return !self.isInPortraitMode();
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#isTabletSiye
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns true if the current device is in "TabletSize". See SO link for more
     * information (http://stackoverflow.com/questions/6370690/media-queries-how-to-target-desktop-tablet-and-mobile).
     *
     * @return {boolean} Whether the device is in tablet size or not.
     */
    self.isTabletSize = function () {
        return $window.matchMedia ? mqTabletSize.matches : $window.innerWidth > 640;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#isStockAndroidBrowser
     * @memberof sofa.DeviceService
     *
     * @description
     * Checks if browser is stock android browser or not.
     *
     * @return {boolean}
     */
    self.isStockAndroidBrowser = function () {
        return userOS === 'Android' && ua.indexOf('Chrome') < 0;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#flagOverflowSupport
     * @memberof sofa.DeviceService
     *
     * @description
     * Flags the current document with an SDK specific class depending on given
     * overflow:scroll support.
     */
    self.flagOverflowSupport = function () {
        flag(self.hasOverflowSupport(), OVERFLOW_SUPPORT, NO_PREFIX);
    };

     /**
      * @sofadoc method
      * @name sofa.DeviceService#getUserAgent
      * @memberof sofa.DeviceService
      *
      * @description
      *
      * @example
      *
      * @return {string} User agent currently in use
      */
    self.getUserAgent = function () {
        return ua;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#getOs
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns OS string.
     *
     * @return {string} Name of OS.
     */
    self.getOs = function () {
        return userOS;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#getOsVersion
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns OS version string.
     *
     * @return {string} Version of OS.
     */
    self.getOsVersion = function () {
        return userOSver;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#isAndroid2x
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns true if device os is Android and version starts with '2'.
     *
     * @return {bool}
     */
    self.isAndroid2x = function () {
        return self.getOs() === 'Android' && versionStartsWith('2');
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#hasOverflowSupport
     * @memberof sofa.DeviceService
     *
     * @description
     * Checks if the current device is blacklisted as such with no overflow:scroll support
     *
     * @return {boolean}
     */
    self.hasOverflowSupport = function () {
        if (self.getOs() === 'Android') {
            return !versionStartsWith('2');
        } else if (self.getOs() === 'iOS') {
            return  !versionStartsWith('1') &&
                    !versionStartsWith('2') &&
                    !versionStartsWith('3') &&
                    !versionStartsWith('4');
        }

        return true;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#hasModernFlexboxSupport
     * @memberof sofa.DeviceService
     *
     * @description
     * Checks if the browser has modern flexbox support or not.
     *
     * @return {boolean}
     */
    self.hasModernFlexboxSupport = function () {
        // IE 11+ safe by syntax
        // FF 28+ filter by version!
        // Chrome 21+ (-webkit) safe by syntax
        // Safari 6.1+ (-webkit) safe by syntax
        // iOS Safari 7+ (-webkit) safe by syntax

        var getFirefoxVersion = function () {
            var match = ua.match(/Firefox\/\d{2}/);
            return match ? match[0].substr(8) * 1 : 0;
        };

        if (ua.match(/Firefox/i) && getFirefoxVersion() < 28) {
            return false;
        }

        // Only new syntax
        var supportedValues = [
            '-webkit-flex',
            'flex'
        ];

        var testSpan = document.createElement('span');

        supportedValues.forEach(function (value) {
            testSpan.style.display = value;
        });

        return supportedValues.indexOf(testSpan.style.display) > -1;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#flagModernFlexboxSupport
     * @memberof sofa.DeviceService
     *
     * @description
     * Flags the document with an SDK specific class for modern flexbox support.
     */
    self.flagModernFlexboxSupport = function () {
        flag(self.hasModernFlexboxSupport(), MODERN_FLEXBOX_SUPPORT, NO_PREFIX);
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#flagIpadOnIos7
     * @memberof sofa.DeviceService
     *
     * @description
     * Flags the document with an SDK specific class to help getting around a bug in iOS7 on iPad landscape mode.
     * see http://stackoverflow.com/questions/18855642/ios-7-css-html-height-100-692px
     */
    self.flagIpadOnIos7 = function () {
        if (self.isIpadOnIos7()) {
            var htmlTag = self.getHtmlTag();
            htmlTag.className += ' ' + IPAD_ON_IOS_7;
        }
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#flagAndroid2x
     * @memberof sofa.DeviceService
     *
     * @description
     * Flags the document with an SDK specific class, as the Android 2.x versions
     * need some special CSS treatment.
     */
    self.flagAndroid2x = function () {
        if (self.isAndroid2x()) {
            var htmlTag = self.getHtmlTag();
            htmlTag.className += ' ' + ANDROID_2X;
        }
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#setViewportHeightToDeviceHeight
     * @memberof sofa.DeviceService
     *
     * @description
     * Sets the height of the html element to the actual height of the device.
     */
    self.setViewportHeightToDeviceHeight = function () {
        self.getHtmlTag().style.height = self.getViewportDimensions().height + 'px';
    };

    return self;
});
}(sofa, document));
