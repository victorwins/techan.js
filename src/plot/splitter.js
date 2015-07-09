'use strict';

module.exports = function(d3_behavior_drag, d3_event, d3_select, d3_dispatch, accessor_value, plot, plotMixin) {  // Injected dependencies
    function Splitter() { // Closure function
        var p = {},  dispatch = d3_dispatch('mouseenter', 'mouseout', 'mousemove', 'drag', 'dragstart', 'dragend');

        function splitter(g) {
            g.attr('class', 'splitter').append('path');

            var interaction = g.append('g').attr('class', 'interaction').style({ opacity: 0, fill: 'none' })
                .call(plot.interaction.mousedispatch(dispatch));

            interaction.append('path').style('stroke-width', 16);

            splitter.refresh(g);
        }

        splitter.refresh = function(g) {
            refresh(g, p.accessor, p.xScale);
        };

        splitter.drag = function(g) {
            g.selectAll('.interaction path')
                .call(dragBody(dispatch, p.accessor, p.xScale));
        };

        // Mixin 'superclass' methods and variables
        plotMixin(splitter, p)
            .plot(accessor_value())
            .on(dispatch);

        return splitter;
    }

    function dragBody(dispatch, accessor, x) {
        var drag = d3_behavior_drag().origin(function(d) {
            return { x: 0, y: accessor(d) };
        })
            .on('drag', function(d) {
                var value = d3_event().y,
                    g = d3_select(this.parentNode.parentNode); // Go up to the selected items parent only (not the list of items)

                accessor.v(d, value);
                refresh(g, accessor, x);
                dispatch.drag(d);
            });

        return plot.interaction.dragStartEndDispatch(drag, dispatch);
    }

    return Splitter;
};

function refresh(g, accessor, x) {
    g.selectAll('.splitter path').attr('d', splitterPath(accessor, x));
    g.selectAll('.interaction path').attr('d', splitterPath(accessor, x));
}

function splitterPath(accessor, x) {
    return function(d) {
        var path = [],
            range = x.range();

        path.push('M', range[0], accessor(d));
        path.push('L', range[range.length-1], accessor(d));

        return path.join(' ');
    };
}
