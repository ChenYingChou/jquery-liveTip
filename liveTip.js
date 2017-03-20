/*
 * live tip for jQuery plugin
 * @requires jQuery v1.3+
 *
 * Refer to http://www.learningjquery.com/2009/12/binding-multiple-events-to-reduce-redundancy-with-event-delegation-tooltips
 *
 * Copyright (c) 2009,2017 Tony Chen (tonychen+jQuery at finenet dot com dot tw)
 * Dual licensed under the MIT and GPL licenses:
 * https://opensource.org/licenses/mit-license.php
 * https://www.gnu.org/licenses/lgpl.html
 *
 * Version: 1.1.2
 */

/*jslint browser: true, white: true, sub: true, vars: true */
/*global jQuery */

(function ($) {
    "use strict";

    function getWindow() {
        var doc = document.documentElement || document.body;
        return {
            left    : window.pageXOffset || doc.scrollLeft || 0,
            top     : window.pageYOffset || doc.scrollTop  || 0,
            height  : window.innerHeight || doc.clientHeight,
            width   : doc.clientWidth || window.innerWidth
        };
    }

    var $liveTip;
    $.fn.liveTip = function (options) {
        options = $.extend({}, $.fn.liveTip.defaults, {css: null},
                    typeof(options) === 'object' ? options : {onGetTip: options});
        if (options.css === true || options.css === 'default') {
            options.css = $.fn.liveTip.defaults.css;
        }
        if (options.ajaxUrl) {
            options.onGetTip = function (title, $tipBox, options) { // this == target DOM
                var params = { '_' : '?' }, callback;

                if (options.onBeforeAjax &&
                    options.onBeforeAjax.call(this, params, options) === false) {
                    return '';
                }

                if (options.ajaxCache) {
                    var data = $tipBox.data('liveTip'),
                        query = options.ajaxUrl + '?' + $.param(params);
                    if (data && data[query]) { return data[query]; }
                    callback = function (responseText, status) {    // this == target DOM
                        if (status === "success" || status === "notmodified") {
                            if (!data || typeof(data) !== 'object') {
                                data = {};
                                $tipBox.data('liveTip', data);
                            }
                            data[query] = responseText;
                        }
                    };
                }
                if ($.isEmptyObject(params)) {
                    params = null;
                } else {
                    if (params['_'] === '?') { params['_'] = new Date().getTime(); }
                }
                $tipBox.load(options.ajaxUrl, params, callback);
                return options.ajaxLoading;
            };
        }

        var $tipBox = options.tipBox;
        if ($tipBox) {
            if (typeof($tipBox) === 'string') { $tipBox = $($tipBox); }
            $tipBox.hide();
        } else {
            if ($liveTip === undefined) { $liveTip = $('<div/>').hide().appendTo('body'); }
            if (!options.css) { options.css = $.fn.liveTip.defaults.css; }
            $tipBox = $liveTip;
        }
        if (options.css && typeof(options.css) === 'object') {
            options.css.position = 'absolute';
            $tipBox.css(options.css);
        } else {
            $tipBox.css({position: 'absolute'});
        }

        var tipTitle, showID, tipActive, delayEvent;
        return this.bind('mouseover.liveTip mouseout.liveTip mousemove.liveTip', function (event) {
            var target = event.target;
            if (options.delegate) {
                if (typeof(options.delegate) === 'string') {
                    target = $(target).closest(options.delegate)[0];
                } else if ($.isFunction(options.delegate)) {
                    target = options.delegate.call(this, event);
                }
            }
            if (!target) { return; }

            function showTip(event) {
                if (tipTitle || options.onGetTip) {
                    var msg = $.isFunction(options.onGetTip) ?
                                options.onGetTip.call(target, tipTitle, $tipBox, options) :
                                (options.onGetTip || tipTitle);
                    if (!msg) { return /*false*/; }

                    if (tipTitle) { target.title = ''; }
                    $tipBox.html(msg);
                } else {
                    if (!options.tipBox || !$tipBox.html()) { return /*false*/; }
                }
                tipActive = true;
                options.onShow.call($tipBox, event, target, options);
            }

            if (event.type === 'mouseout') {
                tipActive = false;
                if (showID) {
                    window.clearTimeout(showID);
                    showID = null;
                }
                options.onHide.call($tipBox, event, target, options);
                if (tipTitle) { target.title = tipTitle; }
            } else if (event.type === 'mouseover') {
                tipTitle = target.title || '';
                if (options.delay) {
                    if (tipTitle) { target.title = ''; }
                    delayEvent = event;
                    showID = window.setTimeout(function () {
                                showID = null;
                                showTip(delayEvent);
                            }, options.delay);
                } else {
                    showTip(event);
                }
            } else if (event.type === 'mousemove') {
                if (tipActive) {
                    options.onMove.call($tipBox, event, target, options);
                } else {
                    delayEvent = event;
                }
            }
        });
    };

    $.fn.liveTip.defaults = {
        //delegate: null,       // closest selector or function return DOM
        //tipBox: null,         // tooltip selector or DOM
        //delay: 0,             // delay showing tip
        //onGetTip: null,       // target.onGetTip(title, $tipBox, options) return tip string
        autoPosition: true,
        offsetX: 12,
        offsetY: 12,
        css: {
            'background-color'      : '#cfc',
            'padding'               : '2px 4px',
            'border'                : '2px solid #9c9',
            'border-radius'         : '4px',
            '-webkit-border-radius' : '4px',
            '-moz-border-radius'    : '4px'
        },
        onShow: function (event, target, options) { // this == $tipBox
            if (options.onMove) { options.onMove.apply(this, arguments); }
            this.show();
        },
        onHide: function (event, target, options) { // this == $tipBox
            this.hide();
        },
        onMove: function (event, target, options) { // this == $tipBox
            var x = event.pageX + options.offsetX,
                y = event.pageY + options.offsetY;
            if (options.autoPosition) {
                var xx, yy,
                    win = getWindow(),
                    boxW = this.outerWidth(),
                    boxH = this.outerHeight();

                xx = x - win.left;
                if (xx+boxW >= win.width) {
                    if (boxW+options.offsetX+4 < xx) { x -= boxW + options.offsetX + 4; }
                }

                yy = y - win.top;
                if (yy+boxH >= win.height) {
                    yy = win.height - boxH;
                    y = (yy < 0 ? 0 : yy) + win.top;
                }
            }
            this.css({top: y, left: x});
        },
        /*
        ajaxUrl: '',            // URL for ajax
        ajaxCache: false,       // ajax cache
        onBeforeAjax: function (params, options) {  // this == DOM of target
            // params = {'_':'?'} --> replace '?' with Date.getTime() when call ajax
            // Ex. add params[]:
            //  params['node'] = this.nodeName;
            //  params['html'] = this.innerHTML;
            //  options.ajaxUrl = 'change the URL...';
            // Return false will stop the call ajax
        },
        */
        ajaxLoading: 'Loading ...'
    };

})(jQuery);
