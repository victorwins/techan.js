'use strict';

/**
 * TODO Refactor this to techan.plot.annotation.axis()?
 */
module.exports = function(d3_svg_axis, accessor_value, plot, plotMixin) {  // Injected dependencies
  return function() { // Closure function
    var p = {},
        axis = d3_svg_axis(),
        format,
        wireLength,
        point = 4,
        height = 14,
        width = 50,
        translate = [0, 0];

    function annotation(g) {
      g.selectAll('g.translate').data(plot.dataMapper.array).enter()
        .append('g').attr('class', 'translate');

      annotation.refresh(g);
    }

    annotation.refresh = function(g) {
      var fmt = format ? format : (axis.tickFormat() ? axis.tickFormat() : axis.scale().tickFormat());
      refresh(g, plot, p.accessor, axis, fmt, height, width, wireLength, point, translate);
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

    annotation.translate = function(_) {
      if(!arguments.length) return translate;
      translate = _;
      return annotation;
    };

    plotMixin(annotation, p).accessor(accessor_value());

    return annotation;
  };
};

function refresh(g, plot, accessor, axis, format, height, width, wireLength, point, translate) {
    var neg = axis.orient() === 'left' || axis.orient() === 'top' ? -1 : 1,
        translateSelection = g.select('g.translate'),
        dataGroup = plot.groupSelect(translateSelection, filterInvalidValues(accessor, axis.scale()));
    dataGroup.entry.append('path').attr("class", "bg");
    if (wireLength) {
        dataGroup.entry.append('path').attr("class", "wire");
    }
    dataGroup.entry.append('text');

    translateSelection.attr('transform', 'translate(' + translate[0] + ',' + translate[1] + ')');
    dataGroup.selection.selectAll('path.bg').attr('d', backgroundPath(accessor, axis, height, width, point, neg));
    if (wireLength) {
        if (axis.orient() === 'left' || axis.orient() === 'right') {
            dataGroup.selection.selectAll('path.wire').attr('d', horizontalPathLine(accessor, axis, wireLength, height, neg));
        }
    }
    dataGroup.selection.selectAll('text').text(textValue(accessor, format)).call(textAttributes, accessor, axis, neg);
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
          return "M" + 0 + "," + value  +
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