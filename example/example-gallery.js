/* eslint-disable */
/**
 * File to generate a path for a variety of different conditions
 */
var d3 = window.d3;

var exampleWidth = 300;
var exampleHeight = 200;

var x = d3.scaleLinear().domain([0, 10]).range([10, exampleWidth - 10]);
var y = d3.scaleLinear().domain([0, 4]).range([exampleHeight - 10, 10]);

var examples = [
  {
    label: 'Typical',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3], [8, null], [9, 1], [10, 1]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Typical with curve',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .curve(d3.curveMonotoneX)
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3], [8, null], [9, 1], [10, 1]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Many points, all defined',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, 1], [2, 2], [4, 1], [10, 0]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Many points, undefined at ends',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .lineStyles({ 'stroke-width': '10px' })
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, null], [1, null], [2, 1], [3, 3], [4, 2], [5, 2], [6, 0], [7, 1], [8, 1], [9, null], [10, null]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Lines along top and bottom edges',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; })
        .lineStyles({ 'stroke-width': 4 });

      var data = [[0, 0], [4, 0], [5, 2], [6, 2], [7, 4], [10, 4]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Data length 1',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, 1]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Empty Data',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'One undefined point',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, null]];

      g.datum(data).call(chunked);
    },
  },
  {
    label: 'Many points, all undefined',
    render: function typicalExample(root) {
      var g = root.append('svg')
        .attr('width', exampleWidth)
        .attr('height', exampleHeight)
        .append('g');

      var chunked = d3.lineChunked()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return x(d[1]); })
        .defined(function (d) { return d[1] !== null; });

      var data = [[0, null], [1, null], [2, null], [3, null]];

      g.datum(data).call(chunked);
    },
  },
];



// render the gallery
var galleryRoot = d3.select('.example-gallery');
examples.forEach(function (example) {
  var div = galleryRoot.append('div');
  div.append('h3')
    .text(example.label);

  example.render(div);
});
