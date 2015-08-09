'use strict';

module.exports = function(d3) {
  var scale = require('../scale')(d3),
      accessor = require('../accessor')(),
      plot = require('./plot')(d3.svg.line, d3.select),
      plotMixin = require('./plotmixin')(d3.scale.linear, scale.financetime),
      line = require('./line'),
      axisannotation = require('./axisannotation')(d3.behavior.drag, d3_event, d3.svg.axis, accessor.value, plot, d3.dispatch, plotMixin);

    var indicatorPlotMixin = function(source, priv) {
        var dispatch = d3.dispatch('mouseenter', 'mouseout', 'dblclick');
        var mixin = plotMixin(source, priv).on(dispatch);
        source.interaction = function(path) {
            path = path.style("pointer-events", "all");
            var withInteraction = path.call(plot.interaction.mousedispatch(dispatch));
            withInteraction.on("dblclick", function(d) {
                console.log("dbclclick");
                dispatch.dblclick(d);
            }, true);
            return withInteraction;
        };
        return mixin;
    };

  return {
    atr: line(accessor.value, plot, indicatorPlotMixin),
    atrtrailingstop: require('./atrtrailingstop')(accessor.atrtrailingstop, plot, indicatorPlotMixin),
    axisannotation: axisannotation,
    candlestick: require('./candlestick')(d3.scale.linear, d3.extent, accessor.ohlc, plot, plotMixin),
    crosshair: require('./crosshair')(d3.select, d3_event, d3.mouse, d3.dispatch, plot, plotMixin),
    ema: line(accessor.value, plot, indicatorPlotMixin),
    ichimoku: require('./ichimoku')(d3.svg.area, accessor.ichimoku, plot, indicatorPlotMixin),
    ohlc: require('./ohlc')(d3.scale.linear, d3.extent, accessor.ohlc, plot, plotMixin),
    close: line(accessor.ohlc, plot, plotMixin),
    volume: require('./volume')(accessor.volume, plot, plotMixin),
    rsi: require('./rsi')(accessor.rsi, plot, indicatorPlotMixin),
    macd: require('./macd')(accessor.macd, plot, indicatorPlotMixin),
    momentum: line(accessor.value, plot, indicatorPlotMixin, true),
    moneyflow: line(accessor.value, plot, indicatorPlotMixin, true),
    sma: line(accessor.value, plot, indicatorPlotMixin),
    supstance: require('./supstance')(d3.behavior.drag, d3_event, d3.select, d3.dispatch, accessor.value, plot, plotMixin),
    trendline: require('./trendline')(d3.behavior.drag, d3_event, d3.select, d3.dispatch, accessor.trendline, plot, plotMixin),
    wilderma: line(accessor.value, plot, plotMixin),
    splitter: require("./splitter")(d3.behavior.drag, d3_event, d3.select, d3.dispatch, accessor.value, plot, plotMixin)
  };
};

function d3_event() {
  return d3.event;
}