/* eslint-disable */
/**
 * File to generate a path for a variety of different conditions
 */
(function (d3) {
  var exampleWidth = 300;
  var exampleHeight = 100;

  var x = d3.scaleLinear().domain([0, 10]).range([10, exampleWidth - 10]);
  var y = d3.scaleLinear().domain([0, 4]).range([exampleHeight - 10, 10]);

  var transitionDuration = 2500;
  var transitionDebug = false;

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
      render: function typicalExampleWithCurve(root) {
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
      render: function manyPointsAllDefined(root) {
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
      render: function undefinedAtEnds(root) {
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
      render: function undefinedAtEndsExtendEnds(root) {
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
      render: function topBottomEdges(root) {
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
      render: function dataLength1(root) {
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
      render: function emptyData(root) {
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
      render: function oneDefinedPoint(root) {
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
      render: function manyPointsUndefined(root) {
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
      label: 'Typical with accessData',
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .accessData(data => data.results);

        var data = { results: [[0, 1], [1, 2], [2, null], [3, null], [4, 1], [5, null], [6, 2], [7, 3], [8, null], [9, 1], [10, 1]] };

        g.datum(data).call(chunked);
      },
    },
    {
      label: 'Different styled chunks',
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .chunkDefinitions({
            line: {
              styles: {
                stroke: '#0bb',
              },
            },
            gap: {
              styles: {
                stroke: 'none'
              }
            },
            chunk1: {
              styles: {
                'stroke-dasharray': '2, 2',
                'stroke-opacity': 0.35,
              },
              pointStyles: {
                'fill': '#fff',
                'stroke': '#0bb',
              }
            }
          })
          .chunk(function (d) { return d[1] > 1 ? 'chunk1' : 'line'; });

        var data = [[0, 2], [1, 1], [2, 2], [3, null], [3.5, 1], [4, 0.8], [4.5, null], [5, 1], [6, 2], [7, 1], [7.5, 1], [8, null], [9, 2], [10, null]];

        g.datum(data).call(chunked);
      },
    },
    {
      label: 'Different styled chunks 2',
      render: function typicalExample(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        const chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .chunkDefinitions({
            line: {
              styles: { stroke: 'red' },
            },
            gap: {
              styles: { stroke: 'silver' },
            },
            chunk1: {
              styles: { stroke: 'blue' },
            },
          })
          .chunk(function (d) { return d[1] > 1 ? 'chunk1' : 'line'; });

        const data = [[0, 2], [1, 1], [2, 2], [3, null], [4, 1], [5, 2], [6, 1], [7, 1], [8, null], [9, 2], [10, null]];

        g.datum(data).call(chunked);
      },
    },
    {
      label: 'Transition: transitionInitial=true',
      transition: true,
      render: function transitionInitialTrue(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(transitionDebug)
          .transitionInitial(true);

        var data = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(data).transition().duration(transitionDuration).call(chunked);
      },
    },
    {
      label: 'Transition: full to missing',
      transition: true,
      render: function fullToMissing(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [[0, 1], [2, 2], [4, 1], [6, 2], [8, 2], [9, 0]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Transition: from point',
      transition: true,
      render: function fromPoint(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [[5, 1]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Transition: from point + extendEnds',
      transition: true,
      render: function fromPointExtendEnds(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .extendEnds(x.range())
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [[5, 1]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Transition: gap to line',
      transition: true,
      render: function gapToLine(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(transitionDebug)
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
      render: function fewToMany(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .isNext(function (prev, curr) { return curr[0] === prev[0] + 1; })
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [[0, 1], [1, 2], [7, 0], [8, 1], [9, 0], [10, 1]];
        var dataEnd = [[0, 1], [1, 2], [3, 0], [4, 1], [6, 3], [7, 2], [9, 1], [10, 1]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Transition: end segment overlap',
      transition: true,
      render: function endSegmentOverlap(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var x = d3
          .scaleLinear()
          .domain([3, 19])
          .range([10, exampleWidth - 10]);

        var y = d3
          .scaleLinear()
          .domain([2, 230])
          .range([exampleHeight - 10, 10]);

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d.x); })
          .y(function (d) { return y(d.y); })
          .defined(function (d) { return d.y != null; })
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [{"x":3,"y":13,"v":160},{"x":4,"y":230,"v":93},{"x":5,"v":149},{"x":6,"y":4,"v":207},{"x":7,"y":21,"v":96},{"x":8,"y":2,"v":128},{"x":9,"y":6,"v":151},{"x":10,"y":14,"v":224},{"x":11,"v":70},{"x":12,"y":36,"v":104},{"x":13,"y":9,"v":190},{"x":14,"v":202},{"x":15,"y":5,"v":67},{"x":16,"y":5,"v":177},{"x":17,"y":25,"v":79},{"x":18,"y":3,"v":201},{"x":19,"y":34,"v":125}];
        var dataEnd = [{"x":3,"y":63,"v":110},{"x":4,"y":16,"v":133},{"x":5,"y":45,"v":143},{"x":6,"y":3,"v":284},{"x":7,"y":6,"v":150},{"x":8,"y":22,"v":233},{"x":9,"v":207},{"x":10,"y":173,"v":109},{"x":11,"y":110,"v":80},{"x":12,"y":17,"v":133},{"x":13,"y":11,"v":192},{"x":14,"y":2,"v":131},{"x":15,"v":117},{"x":16,"y":149,"v":111},{"x":17,"y":99,"v":149},{"x":18,"y":20,"v":145},{"x":19,"y":10,"v":127}];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Multiple lines',
      transition: true,
      render: function endSegmentOverlap(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var x = d3
          .scaleLinear()
          .domain([3, 19])
          .range([10, exampleWidth - 10]);

        var y = d3
          .scaleLinear()
          .domain([2, 250])
          .range([exampleHeight - 10, 10]);

        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d.x); })
          .y(function (d) { return y(d.y); })
          .defined(function (d) { return d.y != null; })
          .debug(transitionDebug)
          .lineStyles({
            stroke: (d, i) => color(i),
          })
          .transitionInitial(true);

        var dataStart = [[{"x":0,"y":42,"v":93},{"x":1,"y":7,"v":216},{"x":2,"y":5,"v":174},{"x":3,"y":5,"v":105},{"x":4,"y":12,"v":235},{"x":5,"y":108,"v":137},{"x":6,"v":36},{"x":7,"y":146,"v":122},{"x":8,"y":115,"v":223},{"x":9,"v":192},{"x":10,"y":145,"v":114},{"x":11,"y":21,"v":130},{"x":12,"v":64},{"x":13,"v":158},{"x":14,"y":58,"v":226},{"x":15,"y":7,"v":215},{"x":16,"y":44,"v":141},{"x":17,"y":5,"v":126},{"x":18,"y":39,"v":144},{"x":19,"y":28,"v":134}],
          [{"x":0,"y":38,"v":166},{"x":1,"y":11,"v":197},{"x":2,"y":38,"v":80},{"x":3,"y":19,"v":222},{"x":4,"v":140},{"x":5,"y":23,"v":100},{"x":6,"y":13,"v":161},{"x":7,"y":47,"v":152},{"x":8,"v":145},{"x":9,"v":143},{"x":10,"y":16,"v":51},{"x":11,"y":17,"v":180},{"x":12,"y":9,"v":148},{"x":13,"v":196},{"x":14,"y":24,"v":207},{"x":15,"y":2,"v":19},{"x":16,"y":4,"v":165},{"x":17,"v":77},{"x":18,"y":123,"v":108},{"x":19,"y":81,"v":234}],
          [{"x":0,"y":32,"v":155},{"x":1,"y":13,"v":192},{"x":2,"y":7,"v":157},{"x":3,"y":100,"v":176},{"x":4,"v":106},{"x":5,"y":10,"v":209},{"x":6,"y":26,"v":19},{"x":7,"v":109},{"x":8,"y":7,"v":247},{"x":9,"y":11,"v":172},{"x":10,"y":236,"v":115},{"x":11,"y":1,"v":91},{"x":12,"y":3,"v":180},{"x":13,"y":19,"v":195},{"x":14,"v":46},{"x":15,"y":3,"v":211},{"x":16,"v":183},{"x":17,"v":148},{"x":18,"y":60,"v":181},{"x":19,"y":10,"v":119}]];

        var dataEnd = [[{"x":0,"y":63,"v":276},{"x":1,"y":30,"v":230},{"x":2,"y":4,"v":139},{"x":3,"y":35,"v":93},{"x":4,"y":1,"v":265},{"x":5,"y":131,"v":206},{"x":6,"y":49,"v":65},{"x":7,"y":10,"v":183},{"x":8,"v":186},{"x":9,"y":36,"v":175},{"x":10,"y":31,"v":28},{"x":11,"y":2,"v":137},{"x":12,"y":15,"v":52},{"x":13,"y":8,"v":200},{"x":14,"y":8,"v":125},{"x":15,"y":79,"v":161},{"x":16,"y":55,"v":241},{"x":17,"y":1,"v":173},{"x":18,"y":6,"v":137},{"x":19,"y":27,"v":120}],
          [{"x":0,"y":5,"v":153},{"x":1,"y":36,"v":244},{"x":2,"y":43,"v":57},{"x":3,"y":15,"v":102},{"x":4,"y":281,"v":228},{"x":5,"y":16,"v":174},{"x":6,"y":41,"v":32},{"x":7,"y":45,"v":144},{"x":8,"v":115},{"x":9,"y":27,"v":99},{"x":10,"y":115,"v":190},{"x":11,"v":113},{"x":12,"y":26,"v":154},{"x":13,"y":26,"v":131},{"x":14,"v":211},{"x":15,"v":192},{"x":16,"y":48,"v":103},{"x":17,"y":4,"v":126},{"x":18,"y":6,"v":141},{"x":19,"y":23,"v":187}]];


        function updateChart(data) {
          var binding = g.selectAll('g').data(data);
          var entering = binding.enter().append('g');
          binding.merge(entering)
            .transition().duration(transitionDuration / 3)
            .call(chunked);
          binding.exit().remove();
        }

        updateChart(dataStart);

        setTimeout(function () {
          updateChart(dataEnd);
          setTimeout(function () {
            updateChart(dataStart);
          }, transitionDuration / 2);
        }, transitionDuration / 2);

      },
    },
    {
      label: 'Transition: null to null',
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

        g.datum(data).call(chunked).transition().call(chunked);
      },
    },
    {
      label: 'Transition: has point same X location',
      transition: true,
      render: function fromPoint(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];
        var dataEnd = [[0, 1], [2, 2], [4, 1], [5, null], [6, 0], [7, null], [8, 2], [9, 0]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },
    {
      label: 'Transition: transition has delay',
      transition: true,
      render: function fromPoint(root) {
        var g = root.append('svg')
          .attr('width', exampleWidth)
          .attr('height', exampleHeight)
          .append('g');

        var chunked = d3.lineChunked()
          .x(function (d) { return x(d[0]); })
          .y(function (d) { return y(d[1]); })
          .defined(function (d) { return d[1] !== null; })
          .isNext(function (prev, curr) { return curr[0] === prev[0] + 1; })
          .debug(transitionDebug)
          .transitionInitial(false);

        var dataStart = [[0, 1], [2, 2], [4, 1], [5, null], [6, 2], [7, null], [8, 2], [9, 0]];
        var dataEnd = [[0, 1], [1, 2], [3, 0], [4, 1], [6, 3], [7, 2], [9, 1], [10, 1]];

        g.datum(dataStart).call(chunked);
        setTimeout(function () {
          g.datum(dataEnd).transition().delay(2000).duration(transitionDuration).call(chunked);
        }, transitionDuration / 4);
      },
    },

  ];



  // render the gallery
  var galleryRoot = d3.select('.example-gallery');

  // append transition timing slider
  var transitionSlider = galleryRoot.append('div');
  transitionSlider.append('strong').text('Transition Duration')
  var transitionSliderValue = transitionSlider.append('span').text(transitionDuration)
    .style('margin-left', '10px');
  transitionSlider.append('input')
    .style('display', 'block')
    .attr('type', 'range')
    .attr('min', 0)
    .attr('max', 5000)
    .attr('value', transitionDuration)
    .on('change', function () {
      transitionDuration = parseFloat(this.value);
      transitionSliderValue.text(transitionDuration);
    });
  var transitionDebugControl = transitionSlider.append('label');
  transitionDebugControl.append('input')
    .attr('type', 'checkbox')
    .attr('checked', transitionDebug ? true : null)
    .on('change', function () {
      transitionDebug = this.checked;
    });
  transitionDebugControl.append('span')
    .text('Debug');


  examples.forEach(function (example) {
    var div = galleryRoot.append('div').attr('class', 'example');

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