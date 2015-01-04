;(function(core) {

  if (!window.jQuery) {
    throw new Error("HSG requires jQuery");
  }

  if (window && window.jQuery) {
    core(window, window.jQuery, window.document);
  }

})(function(global, $, doc) {

  "use strict";

  var HSG = $.HSG || {},
    $html = $("html"),
    $win = $(window);

  if (HSG.fn) {
    return HSG;
  }

  HSG.version = "0.0.1";


  // build HSG main function
  HSG.fn = function(command, options) {
    var args = arguments,
      cmd = command.match(/^([a-z\-]+)(?:\.([a-z]+))?/i),
      component = cmd[1],
      method = cmd[2];

    if (!HSG[component]) {
      $.error("HSG component [" + component + "] does not exists");
      return this;
    }

    return this.each(function() {
      var $this = $(this),
        data = $this.data(component);

        if (!data) {
          $this.data(component, (data = HSG[component](this, method ? undefined : options)));
        }

        if (method) {
          data[method].apply(data, Array.prototype.slice.call(args, 1));
        }
    });
  };


  // build supports
  HSG.support = {};


  HSG.support.svg = (function() {
    return !!('createElementNS' in document && document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGRect);
  })();


  HSG.support.transition = (function() {

    var transitionEnd = (function() {

      var element = doc.body || doc.documentElement,
        transEndEventNames = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'oTransitionEnd otransitionend',
        transition: 'transitionend'
        }, name;

      for (name in transEndEventNames) {
        if (element.style[name] !== undefined) return transEndEventNames[name];
      }
    }());

    return transitionEnd && { end: transitionEnd };
  })();


  HSG.support.animation = (function() {

    var animationEnd = (function() {

      var element = doc.body || doc.documentElement,
        animEndEventNames = {
        WebkitAnimation: 'webkitAnimationEnd',
        MozAnimation: 'animationend',
        OAnimation: 'oAnimationEnd oanimationend',
        animation: 'animationend'
        }, name;

        for (name in animEndEventNames) {
          if (element.style[name] !== undefined) return animEndEventNames[name];
        }
    }());

    return animationEnd && { end: animationEnd };
  })();


  HSG.support.requestAnimationFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.msRequestAnimationFrame || global.oRequestAnimationFrame || function(callback){ global.setTimeout(callback, 1000/60); };


  HSG.support.touch = (
    ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
    (global.DocumentTouch && document instanceof global.DocumentTouch)  ||
    (global.navigator['msPointerEnabled'] && global.navigator['msMaxTouchPoints'] > 0) || //IE 10
    (global.navigator['pointerEnabled'] && global.navigator['maxTouchPoints'] > 0) || //IE >=11
    false
  );


  HSG.support.mutationobserver = (global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver || null);


  // build utils
  HSG.utils = {};


  HSG.utils.debounce = function(func, wait, immediate) {
      var timeout;
      return function() {
          var context = this, args = arguments;
          var later = function() {
              timeout = null;
              if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
      };
  };


  HSG.utils.removeCssRules = function(selectorRegEx) {
      var idx, idxs, stylesheet, _i, _j, _k, _len, _len1, _len2, _ref;

      if(!selectorRegEx) return;

      setTimeout(function(){
          try {
            _ref = document.styleSheets;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              stylesheet = _ref[_i];
              idxs = [];
              stylesheet.cssRules = stylesheet.cssRules;
              for (idx = _j = 0, _len1 = stylesheet.cssRules.length; _j < _len1; idx = ++_j) {
                if (stylesheet.cssRules[idx].type === CSSRule.STYLE_RULE && selectorRegEx.test(stylesheet.cssRules[idx].selectorText)) {
                  idxs.unshift(idx);
                }
              }
              for (_k = 0, _len2 = idxs.length; _k < _len2; _k++) {
                stylesheet.deleteRule(idxs[_k]);
              }
            }
          } catch (_error) {}
      }, 0);
  };


  HSG.utils.isDevice = function(device) {
    switch (device) {
      case "ios":
       return /iPhone|iPad|iPod/i.test(navigator.userAgent);

      case "android":
       return /Android/i.test(navigator.userAgent);

      default:
       return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

  };


  HSG.utils.isInView = function(element, options) {

    var $element = $(element);

    if (!$element.is(":visible")) {
      return false;
    }

    var windowLeft = $win.scrollLeft(),
      windowTop = $win.scrollTop(),
      offset = $element.offset(),
      left = offset.left,
      top = offset.top;

    options = $.extend({
      topoffset: 0,
      leftoffset: 0
    }, options);

    if (top + $element.height() >= windowTop && top - options.topoffset <= windowTop + $win.height() &&
        left + $element.width() >= windowLeft && left - options.leftoffset <= windowLeft + $win.width()) {
        return true;
      } else {
        return false;
      }
  };


  HSG.utils.scrollTo = function(element, options) {

    var $element = $(element);

    if (!$element.is(":visible")) {
      return false;
    }

    options = $.extend({
      duration: 400
    }, options);

    $('html, body').animate({
        scrollTop: $element.offset().top
    }, options.duration);
  };


  HSG.utils.scrollWindow = function(amount) {
    $("html, body").animate({
      scrollTop: $win.scrollTop()+amount
    });
  };


  HSG.utils.options = function(string) {

    if ($.isPlainObject(string)) {
      return string;
    }

    var start = (string ? string.indexOf("{") : -1 ), options = {};

    if (start != -1) {
      try {
        options = (new Function("", "var json = " + string.substr(start) + "; return JSON.parse(JSON.stringify(json));"))();
      } catch(e) {}
    }

    return options;
  };


  // build events
  HSG.utils.events = {};


  HSG.utils.events.click = HSG.support.touch ? "tap" : "click";


  // declare HSG
  $.HSG = HSG;
  $.fn.hsg = HSG.fn;


  $(function(){
    $(document).trigger("hsg-domready");

    // remove css hover rules for touch devices
    if (HSG.support.touch) {
        HSG.utils.removeCssRules(/\.hsg-(?!navbar).*:hover/);
    }
  });


  $html
    .addClass(HSG.support.touch ? "hsg-touch" : "hsg-no-touch")
    .addClass(HSG.support.animation ? "hsg-animation" : "hsg-no-animation")
    .addClass(HSG.support.svg ? "hsg-svg" : "hsg-no-svg");


  return HSG;
});

;(function($, HSG) {

  "use strict";

  HSG.components = {};

  HSG.component = function(name, def) {

    var fn = function(element, options) {
      var $this = this;

      this.element = element ? $(element) : null;
      this.options = $.extend(true, {}, this.defaults, options);

      // attach fn to element
      if (this.element) {
        this.element.data(name, this);
      }

      this.init();

      this.trigger("init", [this]);
    };


    $.extend(true, fn.prototype, {

      defaults: {},

      init: function() {
        console.log("init");
      },

      trigger: function(evt, params) {
        return $(this.element || this).trigger(evt, params);
      },

      on: function() {
        return $(this.element || this).on.apply(this.element || this, arguments);
      },

      one: function() {
        return $(this.element || this).one.apply(this.element || this, arguments);
      },

      off: function(evt) {
        return $(this.element || this).off(evt);
      },

      find: function(selector) {
        return this.element ? this.element.find(selector) : $([]);
      }
    }, def);


    this.components[name] = fn;

    //TODO: figure what is this for
    // set element and options
    this[name] = function() {
      var element, options;

      if (arguments.length) {
        switch(arguments.length) {
          case 1:
            if (typeof arguments[0] === "string" || arguments[0].nodeType || arguments[0] instanceof jQuery) {
            element = $(arguments[0]);
            } else {
            options = arguments[0];
            }
            break;

          case 2:
            element = $(arguments[0]);
            options = arguments[1];
            break;
        }
      }

      // return element fn if attached to his data
      if (element && element.data(name)) {
        return element.data(name);
      }

      return (new HSG.components[name](element, options));
    };

    return fn;
  };

})(jQuery, jQuery.HSG);

;(function($, HSG) {

  "use strict";

  HSG.component("button", {

    cls: {
      disabled: "hsg-disabled",
      active: "hsg-active"
    },

    defaults: {
      loadingText: null,
      resetText: null
    },

    init: function() {
      var $this = this;

      if (!this.element.data("button")) return;

      this.element.trigger("hsg.button.initiating");

      if (this.options.resetText === null) {
        this.options.resetText = this.element[this.elementValName()]();
      }

      this.on("click", function(e) {
        e.preventDefault();

        $this.disable();
        $this.element.blur();

      });

      this.element.trigger("hsg.button.init");

      return this;

    },

    elementValName: function() {
      return this.element.is("input") ? "val" : "html";
    },

    disable: function() {
      this.element.trigger("hsg.button.disabling");

      if (this.element.hasClass(this.cls.disabled)) return;

      this.element.attr("disabled", "disabled").addClass(this.cls.disabled);

      if (this.options.loadingText) {
        this.element[this.elementValName()](this.options.loadingText);
      }

      this.element.trigger("hsg.button.disable");

    },

    enable: function() {
      this.element.trigger("hsg.button.enabling");

      this.element.removeClass(this.cls.disabled + " " + this.cls.active).removeAttr("disabled");
      this.element[this.elementValName()](this.options.resetText);

      this.element.trigger("hsg.button.enable");

    },

    toggle: function() {
      if (this.element.hasClass(this.cls.disabled)) {
        this.enable();

      } else {
        this.disable();

      }

    }
  });


  // attach events
  $(document).on("click.button.hsg", "[data-hsg-button]", function(e) {
    var obj, ele = $(this);

    if (!ele.data("button")) {
      obj = HSG.button(ele, HSG.utils.options(ele.attr("data-hsg-button")));
      ele.trigger("click");
    }
  });

})(jQuery, jQuery.HSG);

;(function($, HSG) {

  "use strict";

  var $win = $(window), event = "resize orientationchange";


  HSG.component("gridMatch", {

    columns: null,
    elements: null,

    defaults: {
      target: null,
      row: null
    },

    init: function() {
      var $this = this;

      if (!this.element.data("gridMatch")) return;

      this.element.trigger("hsg.gridmatch.initiating");

      this.columns = this.element.children();
      this.elements = this.options.target ? this.element.find(this.options.target) : this.columns;

      if (!this.columns.length) return;

      $win.on(event, (function() {
        var fn = function() {
          $this.match();
        };

        $(function() {
          fn();
          $win.on("load", fn);
        });

        return HSG.utils.debounce(fn, 150);
      })());

      $(document).on("hsg-domready", function() {
        $this.columns = $this.element.children();
        $this.elements = $this.options.target ? $this.element.find($this.options.target) : $this.columns;
        $this.match();
      });

      this.element.trigger("hsg.gridmatch.init");

      return this;
    },

    match: function() {
      this.element.trigger("hsg.gridmatch.matching");

      this.revert();

      var firstVisible = this.columns.filter(":first:visible");

      if (!firstVisible.length) return;

      var stacked = Math.ceil(100 * parseFloat(firstVisible.css('width')) / parseFloat(firstVisible.parent().css('width'))) >= 100 ? true : false,
          max = 0,
          $this = this;

      if (stacked) return;

      if (this.options.row) {

        // force redraw
        this.element.width();

        // setTimeout is to let the rendering threads catch up.
        // http://stackoverflow.com/a/779785
        setTimeout(function(){
          var lastoffset = false,
            group = [];

          $this.elements.each(function(i) {
            var ele = $(this),
              offset = ele.offset().top;

              if(offset != lastoffset && group.length) {

                  $this.matchHeights($(group));
                  group  = [];
                  offset = ele.offset().top;
              }

              group.push(ele);
              lastoffset = offset;
          });

          if(group.length) {
              $this.matchHeights($(group));
          }

        }, 0);
      } else {

        this.matchHeights(this.elements);
      }

      this.element.trigger("hsg.gridmatch.match");

      return this;
    },

    matchHeights: function(elements) {
      var max = 0;

      if (elements.length < 2) return;

      elements.each(function() {
          max = Math.max(max, $(this).outerHeight());
      }).each(function() {

          var element = $(this),
              height  = max; // removed this calculation: - (element.outerHeight() - element.height());

          element.css('min-height', height + 'px');
      });

    },

    revert: function() {
      this.elements.css("min-height", "");
      return this;
    }
  });


  HSG.component("gridMargin", {

    columns: null,
    elements: null,

    defaults: {
      cls: "hsg-grid-margin"
    },

    init: function() {
      var $this = this;

      if (!this.element.data("gridMargin")) return;

      this.element.trigger("hsg.gridmargin.initiating");

      this.columns = this.element.children();
      this.elements = this.options.target ? this.element.find(this.options.target) : this.columns;

      if (!this.columns.length) return;

      $win.on(event, (function() {
        var fn = function() {
          $this.process();
        };

        $(function() {
          fn();
          $win.on("load", fn);
        });

        return HSG.utils.debounce(fn, 150);
      })());

      $(document)
        .on("hsg-domready hsg-check-display", function() {
          $this.columns = $this.element.children();
          $this.elements = $this.options.target ? $this.element.find($this.options.target) : $this.columns;
          $this.process();
        });

      this.element.trigger("hsg.gridmargin.init");

      return this;
    },

    process: function() {
      var $this = this;

      this.element.trigger("hsg.gridmargin.processing");

      this.revert();

      var skip = false,
        firstVisible = this.columns.filter(":visible:first"),
        offset = firstVisible.length ? firstVisible.offset().top : false;

      if (offset === false) return;

      this.columns.each(function() {
        var column = $(this);

        if (column.is(":visible")) {
          if (skip) {
            $this.columns.addClass($this.options.cls);
          } else {
            if (column.offset().top != offset) {
              column.addClass($this.options.cls);
              skip = true;
            }
          }
        }
      });

      this.element.trigger("hsg.gridmargin.process");

      return this;
    },

    revert: function() {
      this.columns.removeClass(this.options.cls);
      return this;
    }
  });


  // attach events
  $(document).on("hsg-domready", function(e) {
    $("[data-hsg-grid-match]").each(function() {
      var obj, ele = $(this);

      if (!ele.data("gridMatch")) {
        obj = HSG.gridMatch(ele, HSG.utils.options(ele.attr("data-hsg-grid-match")));
      }
    });

    $("[data-hsg-grid-margin]").each(function() {
      var obj, ele = $(this);

      if (!ele.data("gridMargin")) {
        obj = HSG.gridMargin(ele, HSG.utils.options(ele.attr("data-hsg-grid-margin")));
      }
    });
  });

})(jQuery, jQuery.HSG);

;(function($, HSG) {

  "use strict";

  HSG.component("stripCollapse", {
    cls: {
      strip: "hsg-strip",
      close: "hsg-strip-close",
      iconStart: "hsg-icon-collapse-",
      opening: "hsg-opening"
    },

    defaults: {
      head: ".hsg-strip-head",
      side: ".hsg-strip-side",
      body: ".hsg-strip-body",
      duration: 400
    },

    init: function() {
      var $this = this;

      if(!this.element.data("stripCollapse")) return;

      this.element.trigger("hsg.stripcollapse.initiating");

      if (!this.element.hasClass(this.cls.strip)) {
        throw new Error("HSG strip collapse must be used on hsg-strip");
      }

      this.updateIcons();

      this.element.find(this.options.head).on("click", function(e) {
        if ( e.target.nodeName !== "A") {
          e.preventDefault();
          $this.toggle();
        }
      });

      this.element.find(this.options.side).on("click", function(e) {
        // by finding the icon we know we are in collapse mode
        // also if we click on link (A) we dont trigger the strip collapse
        if ( e.target.nodeName !== "A" && $(this).find("[class^='" + $this.cls.iconStart + "']:visible").length ) {
          e.preventDefault();
          $this.toggle();
        }
      });

      this.element.trigger("hsg.stripcollapse.init");

      return this;
    },

    updateIcons: function() {
      this.element.find("[class^='" + this.cls.iconStart + "']").remove();

      if (this.element.hasClass(this.cls.close)) {
        $("<i>", {
          "class": this.cls.iconStart + "close-o hsg-hidden-large"
        }).appendTo(this.element.find(this.options.side));

        $("<i>", {
          "class": this.cls.iconStart + "close hsg-visible-large"
        }).appendTo(this.element.find(this.options.head));

      } else {
        $("<i>", {
          "class": this.cls.iconStart + "open-o hsg-hidden-large"
        }).appendTo(this.element.find(this.options.side));

        $("<i>", {
          "class": this.cls.iconStart + "open hsg-visible-large"
        }).appendTo(this.element.find(this.options.head));

      }
    },

    toggle: function() {
      if (this.isClose()) {
        this.open();

      } else {
        this.close();

      }

    },

    isClose: function() {
      return this.element.hasClass(this.cls.close);
    },

    close: function() {
      var $this = this;

      this.element.trigger("hsg.stripcollapse.closing");

      this.element.find(this.options.body).slideUp(this.options.duration, function() {
        $this.element.addClass($this.cls.close);
        $this.updateIcons();
        $this.element.trigger("hsg.stripcollapse.close");
      });

    },

    open: function() {
      var $this = this,
        $body = this.element.find(this.options.body);

      this.element.trigger("hsg.stripcollapse.opening");

      this.element.addClass(this.cls.opening);

      $body.slideDown(this.options.duration, function() {
        $this.element.removeClass($this.cls.close).removeClass($this.cls.opening);
        $this.updateIcons();

        if ( !HSG.utils.isInView($body, {topoffset: 0-$body.outerHeight()}) ) {
          HSG.utils.scrollTo($this.element);
        }

        $this.element.trigger("hsg.stripcollapse.open");
      });

    }

  });


  // attach
  $(".hsg-strip[data-hsg-strip-collapse]").each(function() {
    var obj, ele = $(this);

    if (!ele.data("stripCollapse")) {
      obj = HSG.stripCollapse(ele, HSG.utils.options(ele.attr("data-hsg-strip-collapse")));
    }
  });

})(jQuery, jQuery.HSG);

;(function($, HSG) {

  "use strict";

  HSG.component("collapse", {

    cls: {
      parent: "hsg-collapse",
      open: "hsg-open",
      activator: "> li > a"
    },

    defaults: {
      duration: 400
    },

    item: null,

    init: function() {
      var $this = this;

      if (!this.element.data("collapse")) return;

      this.element.trigger("hsg.collapse.initiating");

      if (!this.element.hasClass(this.cls.parent)) this.element.addClass(this.cls.parent);

      this.element.find(this.cls.activator).on("click.collapse.hsg", function(e) {
        e.preventDefault();
        $this.item = $(this);
        $this.toggle();
      });

      this.element.trigger("hsg.collapse.init");

      return this;
    },

    toggle: function() {
      if (this.isVisible()) {

        this.hide();
      } else {

        this.show();
      }
    },


    content: function() {
      return $(this.item.attr("href")).first();
    },

    isVisible: function() {
      return (this.item) ? this.item.hasClass(this.cls.open) : false;
    },

    show: function() {
      var $this = this,
        $body = this.content();

      if (this.isVisible()) return false;

      this.element.trigger("hsg.collapse.showing");

      this.hideAll();
      this.content().slideDown($this.options.duration, function() {
        $this.item.addClass($this.cls.open);

        if ( !HSG.utils.isInView($body, {topoffset: 0-$body.outerHeight()}) ) {
          HSG.utils.scrollTo($body);
        }
      });

      this.element.trigger("hsg.collapse.show");

    },

    hide: function() {
      var $this = this;

      if (!this.isVisible()) return false;

      this.item.trigger("hsg.collapse.hiding");

      this.content().slideUp($this.options.duration, function() {
        $this.item.removeClass($this.cls.open);
        $this.content().removeClass($this.cls.open).removeAttr("style");
      });

      this.item.trigger("hsg.collapse.hide");

    },


    hideAll: function() {
      var $this = this;

      this.element.find(this.cls.activator).filter("." + this.cls.open).find("+ div")
        .slideUp($this.options.duration, function() {
          $(this).prev().removeClass($this.cls.open).removeAttr("style");
        });

    }

  });


  // attch events
  $("[data-hsg-collapse]").each(function() {
    var obj, ele = $(this);

    if (!ele.data("collapse")) {
      obj = HSG.collapse(ele, HSG.utils.options(ele.attr("data-hsg-collapse")));
    }

  });

})(jQuery, jQuery.HSG);


;(function($, HSG, $win) {

  "use strict";

  var $tooltip;

  HSG.component("tooltip", {
    cls: {
      visible: "hsg-tooltip-visible",
      inner: "hsg-tooltip-inner"
    },

    defaults: {
      "offset": 5,
      "pos": "top-right",
      "animation": false,
      "title": function() { return this.text(); },
      "link": function() { return this.attr("href"); },
      "src": function() { return this.attr("title"); }
    },

    init: function() {
      var $this = this;

      if(!this.element.data("tooltip")) return;

      this.element.trigger("hsg.tooltip.initiating");

      this.tipTitle = (typeof(this.options.title) === "function") ? this.options.title.call(this.element) : this.options.title;
      this.tipSrc = (typeof(this.options.src) === "function") ? this.options.src.call(this.element) : this.options.src;
      this.tipLink = (typeof(this.options.link) === "function") ? this.options.link.call(this.element) : this.options.link;

      this.element.attr("data-cached-title", this.element.attr("title"));
      this.element.removeAttr("title", "");

      this.on("click", function(e) {
        e.preventDefault();
        $this.toggle();

      });

      this.element.trigger("hsg.tooltip.init");

      return this;

    },

    toggle: function() {
      $("html").off("click.tooltip.close.hsg");

      if (this.element.hasClass(this.cls.visible)) {
        this.hide();

      } else {
        this.show();

      }

    },

    show: function() {

      this.element.trigger("hsg.tooltip.showing");

      if (!this.tipSrc.length) return;

      $("[data-hsg-tooltip]").removeClass(this.cls.visible);

      $tooltip.stop().css({"top": -2000, "visibility": "hidden"}).show();
      $tooltip.html('<div class="' + this.cls.inner + '"><h2>' + this.tipTitle + '</h2><p>' + this.tipSrc + '</p><a href="' + this.tipLink + '">למידע נוסף</a></div>');

      var $this = this,
        pos  = $.extend({}, this.element.offset(), {width: this.element[0].offsetWidth, height: this.element[0].offsetHeight}),
        width  = $tooltip[0].offsetWidth,
        height = $tooltip[0].offsetHeight,
        offset = this.options.offset,
        position = this.options.pos,
        tcss = {
            "display": "none",
            "visibility": "visible",
            "top": (pos.top + pos.height + height),
            "left": pos.left
        },
        variants =  {
          "bottom"  : {top: pos.top + pos.height + offset, left: pos.left + pos.width / 2 - width / 2},
          "top"     : {top: pos.top - height - offset, left: pos.left + pos.width / 2 - width / 2},
          "left"    : {top: pos.top + pos.height / 2 - height / 2, left: pos.left - width - offset},
          "right"   : {top: pos.top + pos.height / 2 - height / 2, left: pos.left + pos.width + offset}
        },
        tmppos = position.split("-");

      $("html").on("click.tooltip.close.hsg", function(e) {
        if (!e.target.attributes.getNamedItem("data-hsg-tooltip")) $tooltip.hide();
      });

      $.extend(tcss, variants[tmppos[0]]);

      if (tmppos.length == 2) tcss.left = (tmppos[1] == 'left') ? (pos.left) : ((pos.left + pos.width) - width);

      var boundary = this.checkBoundary(tcss.left, tcss.top, width, height);

      if(boundary) {
        switch(boundary) {
          case "x":
            if (tmppos.length == 2) {
                position = tmppos[0]+"-"+(tcss.left < 0 ? "left": "right");
            } else {
                position = tcss.left < 0 ? "right": "left";
            }
            break;

          case "y":
            if (tmppos.length == 2) {
                position = (tcss.top < 0 ? "bottom": "top")+"-"+tmppos[1];
            } else {
                position = (tcss.top < 0 ? "bottom": "top");
            }
            break;

          case "xy":
            if (tmppos.length == 2) {
                position = (tcss.top < 0 ? "bottom": "top")+"-"+(tcss.left < 0 ? "left": "right");
            } else {
                position = tcss.left < 0 ? "right": "left";
            }
            break;
        }

        tmppos = position.split("-");
        $.extend(tcss, variants[tmppos[0]]);
        if (tmppos.length == 2) tcss.left = (tmppos[1] == 'left') ? (pos.left) : ((pos.left + pos.width) - width);
      }

      tcss.left -= $("body").position().left;

      $tooltip.css(tcss).attr("class", "hsg-tooltip hsg-tooltip-" + position);

      if ($this.options.animation) {
          $tooltip.css({opacity: 0, display: 'block'}).animate({opacity: 1}, parseInt($this.options.animation, 10) || 400);
      } else {
          $tooltip.show();
      }

      this.element.addClass(this.cls.visible);

      this.element.trigger("hsg.tooltip.show");

    },

    checkBoundary: function(left, top, width, height) {
        var axis = "";

        if(left < 0 || ((left-$win.scrollLeft())+width) > window.innerWidth) {
           axis += "x";
        }

        if(top < 0 || ((top-$win.scrollTop())+height) > window.innerHeight) {
           axis += "y";
        }

        return axis;
    },

    hide: function() {
      this.element.trigger("hsg.tooltip.hiding");

      $tooltip.stop();

      if (this.options.animation) {
          $tooltip.fadeOut(parseInt(this.options.animation, 10) || 400);

      } else {
          $tooltip.hide();

      }

      $("[data-hsg-tooltip]").removeClass(this.cls.visible);

      this.element.trigger("hsg.tooltip.hide");

    }

  });


  $(function() {
      $tooltip = $('<div class="hsg-tooltip"></div>').appendTo("body");
  });


  // attach events
  $(document).on("click.tooltip.hsg", "[data-hsg-tooltip]", function(e) {
    var obj, ele = $(this);

    e.preventDefault();

    if (!ele.data("tooltip")) {
      obj = HSG.tooltip(ele, HSG.utils.options(ele.attr("data-hsg-tooltip")));
      ele.trigger("click");
    }
  });

})(jQuery, jQuery.HSG, jQuery(window));

;(function($, HSG) {

  "use strict";

  HSG.component("tab", {
    cls: {
      active: "hsg-tab-active",
      header: "hsg-tab-header",
      content: "hsg-tab-content",
      disabled: "hsg-tab-disabled",
      iconStart: "hsg-icon-tab-"
    },

    defaults: {

    },

    init: function() {
      var $this = this;

      if(!this.element.data("tab")) return;

      this.element.trigger("hsg.tab.initiating");

      this.updateIcons();

      this.element.find("." + this.cls.header).on("click", function(e) {
        e.preventDefault();
        $this.open(this);
      });

      this.updateTabPositionForIE();

      this.element.trigger("hsg.tab.init");

      return this;

    },

    updateTabPositionForIE: function() {
      var $this = this;

      if ($(".ie8").length) {
        this.element.children().each(function(i) {
          $(this).find("." + $this.cls.content).css({
            "marginRight": (0-(i * 100)) + "%"
          });
        });
      }
    },

    updateIcons: function() {
      var $this = this, $items = this.element.children();

      this.element.find("[class^='" + this.cls.iconStart + "']").remove();

      $items.filter("." + this.cls.active).find("> a").append( $("<i>", { "class": $this.cls.iconStart + "open" }) );
      $items.not("." + this.cls.active).find("> a").append( $("<i>", { "class": $this.cls.iconStart + "close" }) );
    },

    open: function(tab) {
      tab = isNaN(tab) ? $(tab) : this.element.find(this.options.toggle).eq(tab); // FIX...
      var active = tab, activeLi = tab.parent(); // FIX: dont need active variable??

      this.element.trigger("hsg.tab.opening", [activeLi]);

      if (activeLi.hasClass(this.cls.disabled)) return;

      this.element.children().filter("." + this.cls.active).removeClass(this.cls.active);
      activeLi.addClass(this.cls.active);

      this.updateIcons();

      this.element.trigger("hsg.tab.open", [activeLi]);
    }

  });



  // attach
  $("[data-hsg-tab]").each(function() {
    var obj, ele = $(this);

    if (!ele.data("tab")) {
      obj = HSG.tab(ele, HSG.utils.options(ele.attr("data-hsg-tab")));
    }
  });

})(jQuery, jQuery.HSG);

;(function($, HSG) {

  "use strict";

  HSG.component("cube", {

    cls: {
      content: "hsg-cube-content",
      item: "hsg-cube-item",
      disabled: "hsg-cube-disabled",
      close: "hsg-cube-close",
      active: "hsg-cube-active",
      opening: "hsg-cube-opening"
    },

    defaults: {
      duration: 400
    },

    init: function() {
      var $this = this;

      if(!this.element.data("cube")) return;

      this.element.trigger("hsg.cube.initiating");

      this.element.find("." + this.cls.item).on("click", function(e) {
        e.preventDefault();
        $this.toggle(this);
      });

      this.element.find("." + this.cls.close).on("click", function(e) {
        e.preventDefault();
        $this.close(this);
      });

      this.updateCubesPositionForIE();

      this.element.trigger("hsg.cube.init");

      return this;

    },

    updateCubesPositionForIE: function() {
      var $this = this;

      //TODO: add support for second row
      //TODO: check if i still need this after using selectivizer.js
      // if ($(".ie8").length) {
      //   this.element.children().each(function(i) {
      //     $(this).find("." + $this.cls.content).css({
      //       "marginRight": (0-(i * 100)) + "%"
      //     });
      //   });

      // }
    },

    toggle: function(item) {
      var activeItem = $(item).closest("li");

      if (activeItem.hasClass(this.cls.active)) {
        this.close(item);

      } else {
        this.open(item);
      }
    },

    open: function(item) {
      item = isNaN(item) ? $(item) : this.element.find(this.options.toggle).eq(item);
      var $this = this,
            activeItem = item.closest("li");

      this.element.trigger("hsg.cube.opening", [activeItem]);

      if (activeItem.hasClass(this.cls.disabled)) return;

      // hide all content
      this.element
        .addClass(this.cls.opening)
        .children().removeClass(this.cls.active)
        .find("." + this.cls.content).hide();

      // show active item
      activeItem
        .addClass($this.cls.active)
        .find("." + this.cls.content).slideDown(this.options.duration, function() {
          $this.element.removeClass($this.cls.opening);
        });


      this.element.trigger("hsg.cube.open", [activeItem]);

    },

    close: function(item) {
      item = isNaN(item) ? $(item) : this.element.find(this.options.toggle).eq(item);
      var $this = this,
            activeItem = item.closest("li");

      this.element.trigger("hsg.cube.closing", [activeItem]);

      if (activeItem.hasClass(this.cls.disabled)) return;

      activeItem.find("." + this.cls.content).slideUp(this.options.duration, function() {
        activeItem.removeClass($this.cls.active);
      });

      this.element.trigger("hsg.cube.close", [activeItem]);
    }

  });


  // attach
  $("[data-hsg-cube]").each(function() {
    var obj, ele = $(this);

    if (!ele.data("cube")) {
      obj = HSG.cube(ele, HSG.utils.options(ele.attr("data-hsg-cubes")));
    }
  });

})(jQuery, jQuery.HSG);

;(function($, HSG, $win) {

  "use strict";

  var active = false, $html = $("html");

  HSG.component("modal", {

    cls: {
      open: "hsg-open",
      page: "hsg-modal-page",
      closeBtn: "hsg-modal-close",
      content: "hsg-modal-content"
    },

    defaults: {
      keyboard: true,
      bgclose: true,
      minScrollHeight: 150
    },

    init: function() {
      var $this = this;

      if (!this.element.data("modal")) return;

      this.element.trigger("hsg.modal.initiating");

      if (!this.options.target) {
        this.options.target = $this.element.is("a") ? $this.element.attr("href") : this.element;
      }

      this.modal = $(this.options.target);

      this.element.on("click", function(e) {
        e.preventDefault();
        $this.show();
      });

      this.element.trigger("hsg.modal.init");

      return this;

    },

    show: function() {
      var $this = this;

      if (this.isActive()) return;

      this.element.trigger("hsg.modal.showing");

      if (active) active.hide(true);

      this.modal.removeClass(this.cls.open).show();
      active = this;
      $html.addClass(this.cls.page).height(); // force browser engine redraw
      this.modal.addClass(this.cls.open);

      $html.one("keydown.modal.hsg", function(e) {
        if (active && e.keyCode === 27 && active.options.keyboard) {
          e.preventDefault();
          active.hide();
        }

      });

      this.modal.on("click.modal.hsg", function(e) {
        var target = $(e.target);

        if ((target[0] == $this.modal[0] && $this.options.bgclose) || (target.hasClass($this.cls.closeBtn))) {
            $this.modal.off("click.modal.hsg");
            $this.hide();
        }
      });

      this.element.trigger("hsg.modal.show");

      return this;
    },

    hide: function(force) {
      var $this = this;

      if (!this.isActive()) return;

      this.element.trigger("hsg.modal.hiding");

      if (!force && HSG.support.transition) {
        this.modal.one(HSG.support.transition.end, function() {
          $this._hide();
        }).removeClass($this.cls.open);

      } else {
        this._hide();
      }

      this.element.trigger("hsg.modal.hide");

      return this;
    },

    _hide: function() {
      this.modal.hide().removeClass(this.cls.open);

      $html.removeClass(this.cls.page).css("padding-left", "");

      if (active === this) active = false;
    },

    isActive: function() {
      return (active == this);
    }

  });


  // attach evetns
  $(document).on("click.modal.hsg", "[data-hsg-modal]", function(e) {
    var obj, ele = $(this);

    if (ele.is("a"))  e.preventDefault();

    if (!ele.data("modal")) {
      obj = HSG.modal(ele, HSG.utils.options(ele.attr("data-hsg-button")));
      obj.show();
    }

  });

})(jQuery, jQuery.HSG, jQuery(window));

;(function($, HSG) {

  "use strict";

  HSG.component("loading", {
    cls: {
      load: "hsg-load",
      full: "hsg-load-full",
      loader: "hsg-load-loader",
      content: "hsg-load-content",
      loaded: "hsg-load-loaded"
    },

    defaults: {
    },

    init: function() {
      return this;

    },

    show: function() {
      if (!this.element) return;

      this.element.trigger("hsg.loading.showing");
      this.element.removeClass(this.cls.loaded).show();
      this.element.trigger("hsg.loading.show");

    },

    hide: function(destroy) {
      var $this = this;
      if (!this.element || this.element.hasClass(this.cls.loaded)) return;

      this.element.trigger("hsg.loading.hiding");


      // full page loading
      if (this.element.hasClass(this.cls.full)) {
        this.element.one(HSG.support.animation.end, function() {
          $this.hide();

          if (destroy) {
            $this.element.remove();
          }
        });

      } else { // part page loading
        this.element.find("." + this.cls.loader).hide();
        this.element.find("." + this.cls.content).show();

        if (destroy) {
          $this.element.find("." + this.cls.loader).remove();
        }
      }

      this.element.addClass(this.cls.loaded);

      this.element.trigger("hsg.loading.hide");

    },

    destroy: function() {
      this.element.trigger("hsg.loading.destroying");

      this.hide(true);

      this.element.trigger("hsg.loading.destroy");

    }

  });

})(jQuery, jQuery.HSG);

;(function($, HSG) {

  "use strict";

  HSG.component("nav", {

    cls: {
      open: "hsg-open",
      close: "hsg-close",
      opening: "hsg-opening"
    },

    defaults: {
      duration: 400,
      target: ".hsg-nav"
    },

    item: null,

    init: function() {
      var $this = this;

      if (!this.element.data("nav")) return;

      this.element.trigger("hsg.nav.initiating");

      this.item = $(this.defaults.target).first();

      this.element.on("click.nav.hsg", function(e) {
        e.preventDefault();
        $this.toggle();
      });

      this.element.trigger("hsg.nav.init");

      return this;
    },

    toggle: function() {
      if (this.isVisible()) {

        this.hide();
      } else {

        this.show();
      }
    },

    isVisible: function() {
      return (this.item) ? !this.item.hasClass(this.cls.close) : false;
    },

    show: function() {
      var $this = this;

      if (this.isVisible()) return false;

      this.element.trigger("hsg.nav.showing");

      // this.item.slideDown(this.options.duration, function() {
      //   $(this)
      //     .removeClass($this.cls.opening)
      //     .addClass($this.cls.open);

      //   if ( !HSG.utils.isInView($this.item, {topoffset: 0-$this.item.outerHeight()}) ) {
      //     HSG.utils.scrollTo($this.item);
      //   }
      // });
      //

      this.item.animate({
        height: 400
      }, this.options.duration, function(){
        $(this)
          .removeClass($this.cls.close)
          .removeClass($this.cls.opening);

        if ( !HSG.utils.isInView($this.item, {topoffset: 0-$this.item.outerHeight()}) ) {
          HSG.utils.scrollTo($this.item);
        }
      });

      this.element.trigger("hsg.nav.show");

    },

    hide: function() {
      var $this = this;

      if (!this.isVisible()) return false;

      this.item.trigger("hsg.nav.hiding");

      // this.item.slideUp($this.options.duration, function() {
      //   $(this).removeClass($this.cls.open);
      // });
      //

      this.item.animate({
        height: 1
      }, this.options.duration, function(){
        $(this).addClass($this.cls.close);
      });

      this.item.trigger("hsg.nav.hide");

    }

  });


  // attach events
  $("[data-hsg-nav-toggle]").each(function() {
    var obj, ele = $(this);

    if (!ele.data("nav")) {
      obj = HSG.nav(ele, HSG.utils.options(ele.attr("data-hsg-nav-toggle")));
    }
  });

})(jQuery, jQuery.HSG);
