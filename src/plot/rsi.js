'use strict';

module.exports = function(accessor_rsi, plot, plotMixin) {  // Injected dependencies
  return function() { // Closure function
    var p = {},  // Container for private, direct access mixed in variables
        rsiLine = plot.pathLine(),
        interactions = [];

    function rsi(g) {
      var group = plot.groupSelect(g, plot.dataMapper.array, p.accessor.d);

      group.entry.append('path').attr('class', 'overbought');
      group.entry.append('path').attr('class', 'middle');
      group.entry.append('path').attr('class', 'oversold');
      rsi.interaction(group.entry.append('path').attr('class', 'rsi'));

      rsi.refresh(g);
    }

    rsi.refresh = function(g) {
      refresh(g, p.accessor, p.xScale, p.yScale, plot, rsiLine);
    };

    function binder() {
      rsiLine.init(p.accessor.d, p.xScale, p.accessor.r, p.yScale);
    }

    // Mixin 'superclass' methods and variables
    plotMixin(rsi, p).plot(accessor_rsi(), binder);
    binder();

    return rsi;
  };
};

function refresh(g, accessor, x, y, plot, rsiLine) {
  g.selectAll('path.overbought').attr('d', plot.horizontalPathLine(accessor.d, x, accessor.ob, y));
  g.selectAll('path.middle').attr('d', plot.horizontalPathLine(accessor.d, x, accessor.m, y));
  g.selectAll('path.oversold').attr('d', plot.horizontalPathLine(accessor.d, x, accessor.os, y));
  g.selectAll('path.rsi').attr('d', rsiLine);
}