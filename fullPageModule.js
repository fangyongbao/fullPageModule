/* 
 * author : fang yongbao
 * data : 2014.07.30
 * model : 全屏展示module
 * verson : 1.0
 * info ：知识在于积累，每天一小步，成功永远属于坚持的人。
 * blog : http://www.best-html5.net
 */

/*
 *
 * @param {type} option
 * {
 *   @param _windowEvent: ture/false//是否绑定window.resize事件
 *   @param _scrollingSpeed: 毫秒//动画执行的时间
 *   @param _scrollDely: 毫秒,//每一次滚动之间的延迟
 *   @param _controller: ture/false,//是否开启锚点控制
 *   @param _beforeScroll: function,//滚动前的回调，返回的参数为当前page的下标，从0开始计算
 *   @param _endScroll: function,//，返回的参数为当前page的下标，从0开始计算
 * }
 * return obj
 *   none
 *
 *
 */


(function($) {
    $.fn.fullPage = function(options) {
        var option = $.extend({
            _windowEvent: true,
            _mouseEvent: true,
            _scrollingSpeed: 700,
            _scrollDely: 400,
            _useCss3: true,
            _controller: true,
            _controllerId: "fullPageController",
            /****
             * event
             */
            _beforeScroll: null,
            _endScroll: null

        }, options);

        var _this = this;




        _this.setParameter = function() {
            _this._moving = false;
            _this.option = option;
            _this._layerObj = _this.find(".fullPageLayer");
            _this._pagerObj = _this.find(".fullPagePager");
            _this._childLength = _this._pagerObj.length;
            _this.option._useCss3 = supportTransition();

        };


        _this._setHeight = function() {

            _this._height = $(window).height();
            _this._layerObj.height(_this._height * _this._childLength);
            _this._pagerObj.height(_this._height);
            _this.height(_this._height);


        };

        _this._init = function() {
            _this.setParameter();
            _this._setHeight();

            if (_this.option._windowEvent) {
                _this._bindWindowEvent();
            }

            if (_this.option._mouseEvent) {
                _this._bindMouseEvent();
            }

            if (_this.option._controller) {
                _this._controller();
            }

        };

        _this._prev = function(_index) {

            $.isFunction(_this.option._beforeScroll) && _this.option._beforeScroll(_index);
            _this._scroll(_index, "up");

        };

        _this._next = function(_index) {
            $.isFunction(_this.option._beforeScroll) && _this.option._beforeScroll(_index);
            _this._scroll(_index, "down");

        };

        _this._scroll = function(_index, _direction) {



            if (_direction == "up") {
                _this._pagerObj.eq(_index - 1).addClass("active").siblings().removeClass("active");
                var _y = -(_index - 1) * _this._height + "px";
                _this.option._controller && _this._changeController(_index - 1);
            } else if (_direction == "down") {
                _this._pagerObj.eq(_index + 1).addClass("active").siblings().removeClass("active");
                var _y = -(_index + 1) * _this._height + "px";
                _this.option._controller && _this._changeController(_index + 1);
            } else {
                _this._pagerObj.eq(_index).addClass("active").siblings().removeClass("active");
                var _y = -_index * _this._height + "px";
                _this.option._controller && _this._changeController(_index);
            }





            if (_this.option._useCss3) {

                //var _translate3d = "translate3d(0px, " + _y + " , 0px)";
                var _translate2d = "translate(0px, " + _y + ")";
                transformContainer(_translate2d, true);
            } else {
                _this._layerObj.animate({top: _y}, _this.option._scrollingSpeed, function() {
                    resetMoving();
                });
            }
        };


        /**
         * 绑定窗口事件
         * @returns {undefined}
         */
        _this._bindWindowEvent = function() {
            $(window).on("resize", function() {
                _this._setHeight();

                if (!_this._moving) {
                    var _y = -(_this._layerObj.find(".active").index()) * _this._height + "px";
                    if (_this.option._useCss3) {

                        //var _translate3d = "translate3d(0px, " + _y + " , 0px)";
                        var _translate2d = "translate(0px, " + _y + ")";
                        transformContainer(_translate2d, true);
                    } else {

                        _this._layerObj.animate({top: _y}, _this.option._scrollingSpeed, function() {
                            resetMoving();
                        });
                    }
                }
            });
        };



        /**
         * 绑定鼠标事件
         * @returns {undefined}
         */
        _this._bindMouseEvent = function() {
            _this.mousewheel(function(event, delta) {
                var _currentObj = _this.find(".active");
                var _index = _currentObj.index();

                if (delta > 0 && _index > 0 && !_this._moving) {
                    _this._moving = true;
                    _this._prev(_index);


                }
                else if (delta < 0 && _index < _this._childLength - 1 && !_this._moving) {

                    _this._moving = true;
                    _this._next(_index);


                } else {
                    return;
                }


            });
        };


        _this._controller = function() {

            var _html = "";
            for (var i = 1; i <= _this._childLength; i++) {
                if (i == 1) {
                    _html += "<a class='select'>" + i + "</a>";
                } else {
                    _html += "<a>" + i + "</a>";
                }

            }
            var controllerLayer = $("<div id=" + _this.option._controllerId + "></div>");
            controllerLayer.append(_html);

            $("body").append(controllerLayer);

            $("#" + _this.option._controllerId + " a").on("click", function() {
                if (!_this._moving) {
                    _this._moving = true;
                    _this._scroll($(this).index());
                }

            });

        };

        _this._changeController = function(_index) {
            $("#" + _this.option._controllerId).find("a:eq(" + _index + ")").addClass("select").siblings().removeClass("select");
        };

        _this._init();

        function resetMoving() {
            setTimeout(function() {

                $.isFunction(_this.option._endScroll) && _this.option._endScroll(_this.find(".active").index());
                setTimeout(function() {
                    _this._moving = false;
                }, _this.option._scrollDely);
            }, _this.option._scrollingSpeed);
        }

        function transformContainer(_translate3d, _animated) {
            _this._layerObj.toggleClass('fp-easing', _animated);
            _this._layerObj.css(getTransforms(_translate3d));
            resetMoving();
        }

        function getTransforms(translate3d) {
            return {
                '-webkit-transform': translate3d,
                '-moz-transform': translate3d,
                '-ms-transform': translate3d,
                'transform': translate3d
            };
        }

        /**
         * 判断浏览器是否支持transform
         * @returns {Boolean}
         */
        function supportTransition() {


            var el = document.createElement('p'),
                    hasTransition,
                    transition = {
                        webkitTransition: '-webkit-transition',
                        OTransition: '-o-transition',
                        msTransition: '-ms-transition',
                        MozTransition: '-moz-transition',
                        transition: 'transition'
                    };

            for (var t in transition) {

                if (t in el.style) {
                    return true;
                }
            }
            return false;


        }

        return _this;



    };
})(jQuery);


