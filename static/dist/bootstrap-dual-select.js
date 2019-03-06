var indexOf =
  [].indexOf ||
  function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return -1;
  };

(function($) {
  var addEventsListener,
    dataName,
    destroy,
    getInstanceSelects,
    messages,
    refreshControls,
    refreshOptionsCount,
    refreshSelectedOptions,
    render,
    selectors,
    templates;
  messages = {
    available: "Available",
    selected: "Selected",
    showing: " is showing ",
    filter: "Filter"
  };
  templates = {
    layout: function(options) {
      return [
        '<div class="row dual-select">',
        '<div class="col-md-4 dual-select-container" data-area="unselected">',
        "<h4>",
        "<span>" + messages.available + " " + options.title + "</h4>",
        '<input type="text" placeholder="' +
          messages.filter +
          '" class="form-control filter">',
        '<select multiple="true" class="form-control" style="height: 160px;"></select>',
        "</div>",
        '<div class="col-md-2 center-block control-buttons"></div>',
        '<div class="col-md-4 dual-select-container" data-area="selected">',
        "<h4>",
        "<span>" + messages.selected + " " + options.title + "</span>",
        "</h4>",
        '<input type="text" placeholder="' +
          messages.filter +
          '" class="form-control filter">',
        '<select multiple="true" class="form-control" style="height: 160px;"></select>',
        "</div>",
        "</div>"
      ].join("");
    },
    buttons: {
      allToSelected: [
        '<button type="button" class="btn btn-default btn-success col-md-8 col-md-offset-4">',
        '<i class="fas fa-check"></i>',
        '<span class="glyphicon glyphicon-fast-forward"></span>',
        "</button>"
      ].join(""),
      unselectedToSelected: [
        '<button type="button" class="btn btn-default btn-primary col-md-8 col-md-offset-4">',
        '<i class="fas fa-arrow-right"></i>',
        '<span class="glyphicon glyphicon-step-forward"></span>',
        "</button>"
      ].join(""),
      selectedToUnselected: [
        '<button type="button" class="btn btn-default btn-primary col-md-8 col-md-offset-4">',
        '<i class="fas fa-arrow-left"></i>',
        '<span class="glyphicon glyphicon-step-backward"></span>',
        "</button>"
      ].join(""),
      allToUnselected: [
        '<button type="button" class="btn btn-default btn-danger col-md-8 col-md-offset-4">',
        '<i class="fas fa-trash"></i>',
        '<span class="glyphicon glyphicon-fast-backward"></span>',
        "</button>"
      ].join("")
    }
  };
  $.dualSelect = {
    templates: templates,
    messages: messages,
    defaults: {
      filter: true,
      maxSelectable: 0,
      title: "Items"
    }
  };
  dataName = "dualSelect";
  selectors = {
    unselectedSelect: '.dual-select-container[data-area="unselected"] select',
    selectedSelect: '.dual-select-container[data-area="selected"] select',
    unselectedOptions: "option:not([selected])",
    selectedOptions: "option:selected",
    visibleOptions: "option:visible"
  };
  render = function($select, options) {
    var $btnContainer,
      $instance,
      $selectedOptions,
      $selectedSelect,
      $unselectedOptions,
      $unselectedSelect,
      controlButton,
      controlButtons,
      dataType,
      marginTop,
      ref,
      selectedOptionsValue;
    $instance = $(templates.layout(options));
    controlButtons = {
      allToSelected: "ats",
      unselectedToSelected: "uts",
      selectedToUnselected: "stu",
      allToUnselected: "atu"
    };
    $btnContainer = $instance.find(".control-buttons");
    for (controlButton in controlButtons) {
      dataType = controlButtons[controlButton];
      $(templates.buttons[controlButton])
        .addClass(dataType)
        .data("control", dataType)
        .prop("disabled", true)
        .appendTo($btnContainer);
    }
    marginTop = 80;
    if (!options.title || options.title === "") {
      $instance.find("h4").hide();
      marginTop -= 34;
    }

    $instance
      .find(".control-buttons")
      .css("margin-top", marginTop + "px")
      .css("margin-left", 40 + "px");
    (ref = getInstanceSelects($instance)),
      ($unselectedSelect = ref[0]),
      ($selectedSelect = ref[1]);
    $selectedOptions = $select
      .find(selectors["selectedOptions"])
      .clone()
      .prop("selected", false);
    selectedOptionsValue = $selectedOptions.map(function(index, el) {
      return $(el).val();
    });
    $unselectedOptions = $select
      .children()
      .filter(function(index, el) {
        var ref1;
        return (
          (ref1 = $(el).val()), indexOf.call(selectedOptionsValue, ref1) < 0
        );
      })
      .clone()
      .prop("selected", false);
    $unselectedSelect.append($unselectedOptions);
    $selectedSelect.append($selectedOptions);
    refreshControls(
      $instance,
      false,
      options,
      $unselectedSelect,
      $selectedSelect
    );
    refreshOptionsCount(
      $instance,
      "option",
      $unselectedSelect,
      $selectedSelect
    );
    return $instance;
  };
  getInstanceSelects = function($instance) {
    var $selectedSelect, $unselectedSelect;
    $unselectedSelect = $instance.find(selectors["unselectedSelect"]);
    $selectedSelect = $instance.find(selectors["selectedSelect"]);
    return [$unselectedSelect, $selectedSelect];
  };
  refreshControls = function(
    $instance,
    cancelSelected,
    options,
    $unselectedSelect,
    $selectedSelect
  ) {
    var $buttons,
      counts,
      maxReached,
      ref,
      selectedOptionsCount,
      unselectedOptionsCount;
    $buttons = $instance.find(".control-buttons button");
    maxReached = false;
    if (!($unselectedSelect != null && $selectedSelect != null)) {
      (ref = getInstanceSelects($instance)),
        ($unselectedSelect = ref[0]),
        ($selectedSelect = ref[1]);
    }
    $buttons.prop("disabled", true);
    $unselectedSelect.prop("disabled", false);
    counts = refreshOptionsCount(
      $instance,
      "option",
      $unselectedSelect,
      $selectedSelect
    );
    (unselectedOptionsCount = counts[0]), (selectedOptionsCount = counts[1]);
    if (unselectedOptionsCount > 0) {
      $buttons.filter(".ats").prop("disabled", false);
    }
    if ($unselectedSelect.find(selectors["selectedOptions"]).length > 0) {
      $buttons.filter(".uts").prop("disabled", false);
    }
    if ($selectedSelect.find(selectors["selectedOptions"]).length > 0) {
      $buttons.filter(".stu").prop("disabled", false);
    }
    if (selectedOptionsCount > 0) {
      $buttons.filter(".atu").prop("disabled", false);
    }
    if (options.maxSelectable !== 0) {
      if (selectedOptionsCount >= options.maxSelectable) {
        $buttons.filter(".ats").prop("disabled", true);
        $buttons.filter(".uts").prop("disabled", true);
        $unselectedSelect.prop("disabled", true);
        maxReached = true;
      }
      if (
        $unselectedSelect.find(":selected").length + selectedOptionsCount >
        options.maxSelectable
      ) {
        $buttons.filter(".ats").prop("disabled", true);
        $buttons.filter(".uts").prop("disabled", true);
        maxReached = true;
      }
      if (unselectedOptionsCount > options.maxSelectable) {
        $buttons.filter(".ats").prop("disabled", true);
        maxReached = true;
      }
      if (maxReached) {
        $instance.trigger("maxReached");
      }
    }
    if (cancelSelected) {
      $unselectedSelect.children().prop("selected", false);
      return $selectedSelect.children().prop("selected", false);
    }
  };
  refreshOptionsCount = function(
    $instance,
    optionSelector,
    $unselectedSelect,
    $selectedSelect
  ) {
    var ref, selectedOptionsCount, unselectedOptionsCount;
    if (optionSelector == null) {
      optionSelector = selectors["visibleOptions"];
    }
    if (!($unselectedSelect != null && $selectedSelect != null)) {
      (ref = getInstanceSelects($instance)),
        ($unselectedSelect = ref[0]),
        ($selectedSelect = ref[1]);
    }
    unselectedOptionsCount = $unselectedSelect.find(optionSelector).length;
    selectedOptionsCount = $selectedSelect.find(optionSelector).length;
    $instance
      .find('div[data-area="unselected"] .count')
      .text(unselectedOptionsCount);
    $instance
      .find('div[data-area="selected"] .count')
      .text(selectedOptionsCount);
    return [unselectedOptionsCount, selectedOptionsCount];
  };
  refreshSelectedOptions = function($select, $selectedSelect) {
    var selectedValues;
    selectedValues = $selectedSelect.children().map(function(i, el) {
      return $(el).val();
    });
    $select
      .children()
      .prop("selected", false)
      .filter(function(i, el) {
        var ref;
        return (ref = $(el).val()), indexOf.call(selectedValues, ref) >= 0;
      })
      .prop("selected", true);
    return $select.trigger("change");
  };
  addEventsListener = function($select, $instance, options) {
    var delay, eventName, events, key, keyArray, listener, selector;
    delay = (function() {
      var timer;
      timer = null;
      return function(callback, timeout) {
        clearTimeout(timer);
        return (timer = setTimeout(timeout, callback));
      };
    })();
    events = {
      "change select": function(evt) {
        return refreshControls($instance, false, options);
      },
      "dblclick select": function(evt) {
        var $el;
        $el = $(evt.currentTarget);
        if ($el.parents(".dual-select-container").data("area") === "selected") {
          return $instance.find(".control-buttons .stu").trigger("click");
        }
        return $instance.find(".control-buttons .uts").trigger("click");
      },
      "click .control-buttons button": function(evt) {
        var $el, $selectedSelect, $unselectedSelect, callbacks;
        $unselectedSelect = $instance.find(selectors["unselectedSelect"]);
        $selectedSelect = $instance.find(selectors["selectedSelect"]);
        callbacks = {
          ats: function() {
            return callbacks.uts($unselectedSelect.children());
          },
          uts: function($selectedOptions) {
            if ($selectedOptions == null) {
              $selectedOptions = $unselectedSelect.find("option:selected");
            }
            $selectedOptions.clone().appendTo($selectedSelect);
            return $selectedOptions.remove();
          },
          stu: function($selectedOptions) {
            if ($selectedOptions == null) {
              $selectedOptions = $selectedSelect.find("option:selected");
            }
            $selectedOptions.clone().appendTo($unselectedSelect);
            return $selectedOptions.remove();
          },
          atu: function() {
            return callbacks.stu($selectedSelect.children());
          }
        };
        $el = $(evt.currentTarget);
        callbacks[$el.data("control")]();
        refreshControls($instance, true, options);
        $instance.find(".uts, .stu").prop("disabled", true);
        return refreshSelectedOptions($select, $selectedSelect);
      },
      "keyup input.filter": function(evt) {
        var $el, $instanceSelect;
        $el = $(evt.currentTarget);
        $instanceSelect = null;
        return delay(options.timeout, function() {
          var area, value;
          value = $el
            .val()
            .trim()
            .toLowerCase();
          area = $el.parents(".dual-select-container").data("area");
          $instanceSelect = $instance.find(selectors[area + "Select"]);
          if (value === "") {
            $instanceSelect.children().show();
          } else {
            $instanceSelect
              .children()
              .hide()
              .filter(function(i, option) {
                var $option;
                $option = $(option);
                return (
                  $option
                    .text()
                    .toLowerCase()
                    .indexOf(value) >= 0 || $option.val() === value
                );
              })
              .show();
          }
          return refreshOptionsCount($instance);
        });
      }
    };
    for (key in events) {
      listener = events[key];
      keyArray = key.split(" ");
      eventName = keyArray[0];
      selector = keyArray.slice(1).join(" ");
      $instance.on(eventName + ".delegateEvents", selector, listener);
    }
    return $instance;
  };

  return ($.fn.dualSelect = function(options, selected) {
    var instances;
    $.each(this, function() {
      if (this.nodeName !== "SELECT") {
        throw "dualSelect only accept select element";
      }
      if ($(this).parents(".dual-select").length > 0) {
        throw "dualSelect can not be initizied in dualSelect";
      }
    });
    instances = $.map(this, function(element, index) {
      var $instance, $select, htmlOptions;
      $select = $(element);
      if (options === "destroy") {
        return destroy($select);
      }
      htmlOptions = {
        title: $select.data("title"),
        timeout: 300,
        textLength: $select.data("textLength"),
        moveAllBtn: $select.data("moveAllBtn"),
        maxAllBtn: $select.data("maxAllBtn")
      };
      options = $.extend({}, $.dualSelect.defaults, htmlOptions, options);
      options.maxSelectable = parseInt(options.maxSelectable);
      if (isNaN(options.maxSelectable)) {
        throw "Option maxSelectable must be integer";
      }
      $instance = render($select, options);
      $instance.data("options", options);
      addEventsListener($select, $instance, options);
      $instance.insertAfter($select);
      $select.data(dataName, $instance).hide();
      return $instance[0];
    });
    return $(instances);
  });
})(jQuery);

//# sourceMappingURL=bootstrap-dual-select.js.map
