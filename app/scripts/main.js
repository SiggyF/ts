/* jshint devel:true */
'use strict';
var margin = {top: 20, right: 60, bottom: 30, left: 20},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// bisect date variables
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var x = d3.time.scale()
        .range([0, width]);

var y = d3.scale.linear()
        .range([height, 0]);

var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickSize(-height, 0)
        .tickPadding(6);

var yAxis = d3.svg.axis()
        .scale(y)
        .orient('right')
        .tickSize(-width)
        .tickPadding(6);

var line = d3.svg.line()
        .interpolate('linear')
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

var svg = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


function update(){
    var startDate = x.invert(0);
    var endDate = x.invert(width);
    var url = 'http://localhost:5000?start=' +
            startDate.toISOString()  +
            '&end=' +
            endDate.toISOString();
    console.log(url);
    d3.json(url , function(error, data) {
        data.forEach(function(d) {
            d.date = new Date(d.t);
            d.value = +d.h;
        });
        console.log('new data', data);
        y
            .domain([d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })]);

        svg.select('path.line')
            .data([data])
            .attr('d', line);
        svg.select('g.x.axis').call(xAxis);
        svg.select('g.y.axis')
            .transition()
            .duration(500)
            .call(yAxis);

        function mousemoved() {
            var position = d3.mouse(this);
            var x0 = x.invert(position[0]);
            var i = bisectDate(data, x0, 1);
            d3.select('#circle')
                .attr('cx', x(data[i].date))
                .attr('cy', y(data[i].value));
            d3.select('#date').text(data[i].date);
            d3.select('#value').text(data[i].value);
        }
        svg.on('mousemove', mousemoved);

    });
}

function draw() {
    svg.select('g.x.axis').call(xAxis);
    svg.select('g.y.axis').call(yAxis);
    svg.select('path.line').attr('d', line);
}


var zoom = d3.behavior.zoom()
        .on('zoom',
            function(){
                var startDate = x.invert(0);
                var endDate = x.invert(width);
                draw();
            }
           )
        .on('zoomend', update);

svg
    .append('circle')
    .attr('id', 'circle')
    .attr('r', 4.5);

var gradient = svg.append('defs').append('linearGradient')
        .attr('id', 'gradient')
        .attr('x2', '0%')
        .attr('y2', '100%');

gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#fff')
    .attr('stop-opacity', .5);

gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#999')
    .attr('stop-opacity', 1);

svg.append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr('x', x(0))
    .attr('y', y(1))
    .attr('width', x(1) - x(0))
    .attr('height', y(0) - y(1));

svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(' + width + ',0)');

svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')');

svg.append('path')
    .attr('class', 'line')
    .attr('clip-path', 'url(#clip)');

svg.append('rect')
    .attr('class', 'pane')
    .attr('width', width)
    .attr('height', height)
    .call(zoom);


x.domain([new Date(new Date() - 3600*24*31*12*1000), new Date()]);
update();
zoom.x(x);
// d3.json('http://localhost:5000', function(error, data) {
//     data.forEach(function(d) {
//         d.date = new Date(d.t);
//         d.value = +d.h;
//     });
//     x.domain([new Date(data[0].t), new Date(data[data.length-1].t)]);
//     y.domain([d3.min(data, function(d) { return d.value; }), d3.max(data, function(d) { return d.value; })]);
//     zoom.x(x);

//     svg.select('path.line').data([data]);
//     draw();
// });


