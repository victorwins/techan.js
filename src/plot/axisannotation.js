'use strict';

/**
 * TODO Refactor this to techan.plot.annotation.axis()?
 */
module.exports = function(d3_behavior_drag, d3_event, d3_svg_axis, accessor_value, plot, d3_dispatch, plotMixin) {  // Injected dependencies
  return function() { // Closure function
    var p = {},
        axis = d3_svg_axis(),
        format,
        wireLength,
        point = 4,
        height = 14,
        width = 50,
        text,
        actionText,
        action,
        dragAction,
        dispatch = d3_dispatch('mouseenter', 'mouseout', 'mousemove', 'drag', 'dragstart', 'dragend'),
        translate = [0, 0];

    function annotation(g) {
      var gTranslate = g.selectAll('g.translate').data(plot.dataMapper.array).enter()
        .append('g').attr('class', 'translate');

      annotation.refresh(g);
    }

    annotation.refresh = function(g) {
      var fmt = format ? format : (axis.tickFormat() ? axis.tickFormat() : axis.scale().tickFormat());
      refresh(g, plot, p.accessor, axis, fmt, height, width, wireLength, text, actionText, action, dispatch, point, translate);
    };

    annotation.axis = function(_) {
      if(!arguments.length) return axis;
      axis = _;
      return annotation;
    };

    annotation.format = function(_) {
      if(!arguments.length) return format;
      format = _;
      return annotation;
    };

    annotation.height = function(_) {
      if(!arguments.length) return height;
      height = _;
      return annotation;
    };

    annotation.width = function(_) {
      if(!arguments.length) return width;
      width = _;
      return annotation;
    };

    annotation.wireLength = function(_) {
        if(!arguments.length) return wireLength;
        wireLength = _;
        return annotation;
    };

      annotation.action = function(_, _2) {
          if(!arguments.length) return actionText;
          actionText = _;
          action = _2;
          return annotation;
      };

      annotation.text = function(_) {
          if(!arguments.length) return text;
          text = _;
          return annotation;
      };

      annotation.drag = function(g) {
        g.selectAll('.draghandle path')
            .call(dragBody(dispatch, p.accessor, axis.scale(), function() {
                annotation.refresh(g);
            }));
      };

    annotation.translate = function(_) {
      if(!arguments.length) return translate;
      translate = _;
      return annotation;
    };

      function dragBody(dispatch, accessor, y, refresher) {
          var drag = d3_behavior_drag().origin(function(d) {
              return { x: 0, y: y(accessor(d)) };
          }).on('drag', function(d) {
              var ev = d3_event();
              var value = y.invert(ev.y);
              var dd = {};
              accessor.v(dd, value);
              dispatch.drag(dd);
          });
          return plot.interaction.dragStartEndDispatch(drag, dispatch);
      }

      plotMixin(annotation, p).accessor(accessor_value()).on(dispatch);

    return annotation;
  };
};

function refresh(g, plot, accessor, axis, format, height, width, wireLength, text, buttonText, buttonAction, dispatch, point, translate) {
    var neg = axis.orient() === 'left' || axis.orient() === 'top' ? -1 : 1,
        translateSelection = g.select('g.translate'),
        dataGroup = plot.groupSelect(translateSelection, filterInvalidValues(accessor, axis.scale()));

    if (wireLength) {
        dataGroup.entry.append('path').attr("class", "wire");
    }

    if(text !== "") {
        dataGroup.entry.append('path').attr("class", "bg");
        dataGroup.entry.append('text').attr("class", "label");
        var dragHandle = dataGroup.entry.append('g').attr('class', 'draghandle').style({ opacity: 0, fill: 'none' })
            .call(plot.interaction.mousedispatch(dispatch));
        dragHandle.append('path').style({'pointer-events': 'all'});
    }

    if(buttonText) {
        dataGroup.entry.append('rect').attr("class", "button");
        dataGroup.entry.append('text').attr("class", "button");
        var interaction = dataGroup.entry.append('g').attr('class', 'interaction').style({ opacity: 0, fill: 'none' })
            .call(plot.interaction.mousedispatch(dispatch));
        interaction.append('rect').style({'pointer-events': 'all'});
    }

    translateSelection.attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ')');
    if (wireLength) {
        if (axis.orient() === 'left' || axis.orient() === 'right') {
            dataGroup.selection.selectAll('path.wire').attr('d', horizontalPathLine(accessor, axis, wireLength, height, neg));
        }
    }
    if(text !== "") {
        dataGroup.selection.selectAll('path.bg').
            attr('d', backgroundPath(accessor, axis, height, width, point, neg));
        dataGroup.selection.selectAll('text.label').text(text || textValue(accessor, format)).
            call(textAttributes, accessor, axis, neg);
        dataGroup.selection.selectAll('.draghandle path').
            attr('d', backgroundPath(accessor, axis, height, width, point, neg));
    }
    if(buttonText) {
        dataGroup.selection.selectAll('rect.button').
            call(closeButtonAttributes, accessor, axis, neg, height);
        dataGroup.selection.selectAll('text.button').text(buttonText).
            call(closeTextAttributes, accessor, axis, neg, height);
        dataGroup.selection.selectAll('.interaction rect').
            on("mousedown", buttonAction).
            call(closeButtonAttributes, accessor, axis, neg, height);
    }
}

function filterInvalidValues(accessor, scale) {
  return function(data) {
    var range = scale.range(),
        start = range[0],
        end = range[range.length - 1];

    range = start < end ? [start, end] : [end, start];

    return data.filter(function (d) {
      if (!accessor(d)) return false;
      var value = scale(accessor(d));
      return value && !isNaN(value) && range[0] <= value && value <= range[1];
    });
  };
}

function textAttributes(text, accessor, axis, neg) {
  var scale = axis.scale();

  switch(axis.orient()) {
    case 'left':
    case 'right':
      text.attr({
        x: neg*(Math.max(axis.innerTickSize(), 0) + axis.tickPadding()),
        y: textPosition(accessor, scale),
        dy: '.32em'
      }).style('text-anchor', neg < 0 ? 'end' : 'start');
      break;
    case 'top':
    case 'bottom':
      text.attr({
        x: textPosition(accessor, scale),
        y: neg*(Math.max(axis.innerTickSize(), 0) + axis.tickPadding()),
        dy: neg < 0 ? '0em' : '.72em'
      }).style('text-anchor', 'middle');
      break;
  }
}

function closeTextAttributes(text, accessor, axis, neg, dimension) {
    var scale = axis.scale();

    switch(axis.orient()) {
        case 'left':
        case 'right':
            text.attr({
                x: - neg*dimension / 2,
                y: textPosition(accessor, scale),
                dy: '.32em'
            }).style('text-anchor', 'middle');
            break;
        case 'top':
        case 'bottom':
            break; // TODO
    }
}

function closeButtonAttributes(rect, accessor, axis, neg, dimension) {
    var scale = axis.scale();

    switch(axis.orient()) {
        case 'left':
        case 'right':
            rect.attr({
                x: - neg*dimension,
                y: buttonPosition(accessor, scale, dimension),
                width: dimension - 1,
                height: dimension
            });
            break;
        case 'top':
        case 'bottom':
            break; // TODO
    }
}

function buttonPosition(accessor, scale, dimension) {
    return function(d) {
        return scale(accessor(d)) - dimension / 2;
    };
}

function textPosition(accessor, scale) {
  return function(d) {
    return scale(accessor(d));
  };
}

function textValue(accessor, format) {
  return function(d) {
    return format(accessor(d));
  };
}

function horizontalPathLine(accessor, axis, wireLength, height, neg) {
    return function(d) {
        if(!d) return "M 0 0";
        var scale = axis.scale(),
            value = scale(accessor(d));
        return ['M', 0, value, 'h', - neg * wireLength].join(' ');
    };
}

function backgroundPath(accessor, axis, height, width, point, neg) {
  return function(d) {
    var scale = axis.scale(),
        value = scale(accessor(d)),
        pt = point;

    var radius = 4;
    var tickSize = Math.max(0, axis.innerTickSize()) + axis.tickPadding();

    switch(axis.orient()) {
      case 'left':
      case 'right':
          return "M" + neg + "," + value  +
              " v" + neg * (-height / 2) +
              " h" + neg * (width + tickSize) +
              " a" + radius + "," + radius + " 0 0 1 " + neg * radius + "," + neg * radius +
              " v" + neg * (height - 2 * radius) +
              " a" + radius + "," + radius + " 0 0 1 " + - neg * radius + "," + neg * radius +
              " h" + neg * (-tickSize - width) +
              " z";
      case 'top':
      case 'bottom':
        return "M" + value  + ",0" +
              " h" + (width / 2) +
              " v" + (height + tickSize - radius) +
              " a" + radius + "," + radius + " 0 0 1 " + - radius + "," + radius +
              " h" + (- width + 2 * radius) +
              " a" + radius + "," + radius + " 0 0 1 " + - radius + "," + - radius +
              " v" + (- tickSize - height + radius) +
              " z";

      default: throw "Unsupported axis.orient() = " + axis.orient();
    }
  };
}

function buttonBackgroundPath(accessor, axis, dimension, neg) {
    return function(d) {
        var scale = axis.scale(),
            value = scale(accessor(d));
        switch(axis.orient()) {
            case 'left':
            case 'right':
                return "M" + -neg + "," + value  +
                    " v" + neg * (-dimension / 2) +
                    " h" + neg * (-dimension) +
                    " v" + neg * dimension +
                    " h" + neg * dimension +
                    " z";
            default: throw "Unsupported axis.orient() = " + axis.orient();
        }
    };
}

