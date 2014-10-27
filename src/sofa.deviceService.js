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
        isIpadOnIos7,
        uaindex,
        userOS,
        userOSver;

    var MODERN_FLEXBOX_SUPPORT = 'cc-modern-flexbox',
        NO_MODERN_FLEXBOX_SUPPORT = 'cc-no-modern-flexbox',
        IPAD_ON_IOS_7 = 'cc-ipad-ios-7';

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

    // determine OS
    if (ua.match(/iPad/i) || ua.match(/iPhone/i)) {
        userOS = 'iOS';
        uaindex = ua.indexOf('OS ');
    } else if (ua.match(/Android/i)) {
        userOS = 'Android';
        uaindex = ua.indexOf('Android ');
    } else {
        userOS = 'unknown';
    }

    // determine version
    if (userOS === 'iOS' && uaindex > -1) {
        userOSver = ua.substr(uaindex + 3, 3).replace('_', '.');
    } else if (userOS === 'Android' && uaindex > -1) {
        userOSver = ua.substr(uaindex + 8, 3);
    } else {
        userOSver = 'unknown';
    }

    // determine iPad + iOS7 (for landscape innerHeight bug, see flagIpadOnIos7() )
    isIpadOnIos7 = ua.match(/iPad/i) && userOSver.substr(0, 1) === '7';

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
        return isIpadOnIos7;
    };

    if ($window.matchMedia) {
        var mqTabletSize = $window.matchMedia('screen and (min-width: 641px)'),
            mqPortrait   = $window.matchMedia('screen and (orientation: portrait)');
    }

    var dimensions = {};

    var updateDimension = function () {
        dimensions.width = $window.innerWidth;
        dimensions.height = $window.innerHeight;
    };

    updateDimension();

    var deviceServiceOrientationChange = new CustomEvent('deviceService.orientationchange');

    (function () {
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
    }());

    var versionStartsWith = function (str) {
        var version = self.getOsVersion();
        return version.indexOf(str) === 0;
    };

    /**
     * @sofadoc method
     * @name sofa.DeviceService#getViewportDimensions
     * @memberof sofa.DeviceService
     *
     * @description
     * Returns the height of the viewport
     *
     * @return {int}
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
     * @name sofa.DeviceService#flagOs
     * @memberof sofa.DeviceService
     *
     * @description
     * Flags the current document with an SDK specific class depending on the OS
     * of the device.
     */
    self.flagOs = function () {
        var htmlTag = self.getHtmlTag();
        var version = self.getOsVersion();
        var majorVersion = version.length > 0 ? version[0] : '0';
        htmlTag.className += ' cc-os-' + self.getOs().toLowerCase() + ' cc-osv-' + majorVersion;
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
        var htmlTag = self.getHtmlTag();
        htmlTag.className += self.hasOverflowSupport() ? ' cc-has-overflow-support' : ' cc-has-no-overflow-support';
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
        var htmlTag = self.getHtmlTag();
        if (self.hasModernFlexboxSupport()) {
            htmlTag.className += ' ' + MODERN_FLEXBOX_SUPPORT;
        } else {
            htmlTag.className += ' ' + NO_MODERN_FLEXBOX_SUPPORT;
        }
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
        if (isIpadOnIos7) {
            var htmlTag = self.getHtmlTag();
            htmlTag.className += ' ' + IPAD_ON_IOS_7;
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
