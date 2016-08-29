/* eslint-disable */
/**
 * File to generate a path for a variety of different conditions
 */
(function (d3) {
  var exampleWidth = 300;
  var exampleHeight = 100;

  var x = d3.scaleLinear().domain([0, 10]).range([10, exampleWidth - 10]);
  var y = d3.scaleLinear().domain([0, 4]).range([exampleHeight - 10, 10]);

  var transitionDuration = 5000;

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
          .y(function (d) { return y(d[1]); })
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
          .y(function (d) { return y(d[1]); })
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
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; });

        var data = [[0, 1], [2, 2], [4, 1], [10, 0]];

        g.datum(data).call(chunked);
      },
    },
    {
      label: 'Undefined at ends',
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .lineStyles({ 'stroke-width': '10px' })
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; });

        var data = [[0, null], [1, null], [2, 1], [3, 3], [4, 2], [5, 2], [6, 0], [7, 1], [8, 1], [9, null], [10, null]];

        g.datum(data).call(chunked);
      },
    },
    {
      label: 'Undefined at ends + extendEnds',
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .extendEnds(x.range());

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
          .y(function (d) { return y(d[1]); })
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
          .y(function (d) { return y(d[1]); })
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
          .y(function (d) { return y(d[1]); })
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
          .y(function (d) { return y(d[1]); })
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
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; });

        var data = [[0, null], [1, null], [2, null], [3, null]];

        g.datum(data).call(chunked);
      },
    },
    {
      label: 'Transition: transitionInitial=true',
      transition: true,
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(true)
          .transitionInitial(true);

        var data = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(data).transition().duration(transitionDuration).call(chunked);
      },
    },
    {
      label: 'Transition: full to missing',
      transition: true,
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(true)
          .transitionInitial(false);

        var dataStart = [[0, 1], [2, 2], [4, 1], [6, 2], [8, 2], [9, 0]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked).datum(dataEnd).transition().duration(transitionDuration).call(chunked);
      },
    },
    {
      label: 'Transition: from point',
      transition: true,
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(true)
          .transitionInitial(false);

        var dataStart = [[5, 1]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked).datum(dataEnd).transition().duration(transitionDuration).call(chunked);
      },
    },
    {
      label: 'Transition: from point + extendEnds',
      transition: true,
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .extendEnds(x.range())
          .debug(true)
          .transitionInitial(false);

        var dataStart = [[5, 1]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked).datum(dataEnd).transition().duration(transitionDuration).call(chunked);
      },
    },
    {
      label: 'Transition: line to gap',
      transition: true,
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(true)
          .transitionInitial(false);

        var dataStart = [[0, 1], [2, 2], [4, 1], [5, null], [8, 2], [9, 0]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [6, 2], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Transition: few -> many segments',
      transition: true,
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .isNext(function (prev, curr) { return curr[0] === prev[0] + 1; })
          .debug(true)
          .transitionInitial(false);

        var dataStart = [[0, 1], [1, 2], [7, 0], [8, 1], [9, 0], [10, 1]];
        var dataEnd = [[0, 1], [1, 2], [3, 0], [4, 1], [6, 3], [7, 2], [9, 1], [10, 1]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
  ];



  // render the gallery
  var galleryRoot = d3.select('.example-gallery');
  examples.forEach(function (example) {
    var div = galleryRoot.append('div');

    if (example.transition) {
      div.append('button')
        .style('float', 'right')
        .text('Play')
        .on('click', function () {
          div.select('svg').remove();
          example.render(div);
        });
    }

    div.append('h3')
      .text(example.label);



    example.render(div);
  });
})(window.d3);