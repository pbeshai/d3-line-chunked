# d3-line-chunked

[![npm version](https://badge.fury.io/js/d3-line-chunked.svg)](https://badge.fury.io/js/d3-line-chunked)

A d3 plugin that renders a line with potential gaps in the data by styling the gaps differently from the defined areas. It also provides the ability to style arbitrary chunks of the defined data differently. Single points are rendered as circles and transitions are supported.

Blog: [Showing Missing Data in Line Charts](https://bocoup.com/weblog/showing-missing-data-in-line-charts)

Demo: http://peterbeshai.com/vis/d3-line-chunked/

![d3-line-chunked-demo](https://cloud.githubusercontent.com/assets/793847/18075172/806683f4-6e40-11e6-96bc-e0250adf0529.gif)

## Example Usage

```js
var lineChunked = d3.lineChunked()
  .x(function (d) { return xScale(d.x); })
  .y(function (d) { return yScale(d.y); })
  .curve(d3.curveLinear)
  .defined(function (d) { return d.y != null; })
  .lineStyles({
    stroke: '#0bb',
  });

d3.select('svg')
  .append('g')
    .datum(lineData)
    .transition()
    .duration(1000)
    .call(lineChunked);
```

### Example with multiple lines

```js
var lineChunked = d3.lineChunked()
  .x(function (d) { return xScale(d.x); })
  .y(function (d) { return yScale(d.y); })
  .defined(function (d) { return d.y != null; })
  .lineStyles({
    stroke: (d, i) => colorScale(i),
  });

var data = [
  [{ 'x': 0, 'y': 42 }, { 'x': 1, 'y': 76 }, { 'x': 2, 'y': 54 }],
  [{ 'x': 0, 'y': 386 }, { 'x': 1 }, { 'x': 2, 'y': 38 }, { 'x': 3, 'y': 192 }],
  [{ 'x': 0, 'y': 325 }, { 'x': 1, 'y': 132 }, { 'x': 2 }, { 'x': 3, 'y': 180 }]
];

// bind data
var binding = d3.select('svg').selectAll('g').data(data);

// append a `<g>` for each line
var entering = binding.enter().append('g');

// call lineChunked on enter + update
binding.merge(entering)
  .transition()
  .call(lineChunked);

// remove `<g>` when exiting
binding.exit().remove();
```

## Development

Get rollup watching for changes and rebuilding

```bash
npm run watch
```

Run a web server in the example directory

```bash
cd example
php -S localhost:8000
```

Go to http://localhost:8000


## Installing

If you use NPM, `npm install d3-line-chunked`. Otherwise, download the [latest release](https://github.com/pbeshai/d3-line-chunked/releases/latest).

Note that this project relies on the following d3 features and plugins:
- [d3-array](https://github.com/d3/d3-array)
- [d3-selection](https://github.com/d3/d3-selection)
- [d3-shape](https://github.com/d3/d3-interpolate)

If you are using transitions, you will also need:
- [d3-interpolate](https://github.com/d3/d3-interpolate)
- [d3-interpolate-path](https://github.com/pbeshai/d3-interpolate-path) (plugin)

The only thing not included in the default d3 v4 build is the plugin [d3-interpolate-path](https://github.com/pbeshai/d3-interpolate-path). You'll need to get that [separately](https://github.com/pbeshai/d3-interpolate-path#installing).

## API Reference

<a href="#lineChunked" name="lineChunked">#</a> d3.**lineChunked**()

Constructs a new generator for chunked lines with the default settings.


<a href="#_lineChunked" name="_lineChunked">#</a> *lineChunked*(*context*)

Render the chunked line to the given *context*, which may be either a [d3 selection](https://github.com/d3/d3-selection)
of SVG containers (either SVG or G elements) or a corresponding [d3 transition](https://github.com/d3/d3-transition). Reads the data for the line from the `datum` property on the  container.


<a href="#lineChunked_x" name="lineChunked_x">#</a> *lineChunked*.**x**([*x*])

Define an accessor for getting the `x` value for a data point. See [d3 line.x](https://github.com/d3/d3-shape#line_x) for details.


<a href="#lineChunked_y" name="lineChunked_y">#</a> *lineChunked*.**y**([*y*])

Define an accessor for getting the `y` value for a data point. See [d3 line.y](https://github.com/d3/d3-shape#line_y) for details.


<a href="#lineChunked_curve" name="lineChunked_curve">#</a> *lineChunked*.**curve**([*curve*])

Get or set the [d3 curve factory](https://github.com/d3/d3-shape#curves) for the line. See [d3 line.curve](https://github.com/d3/d3-shape#line_curve) for details.
Define an accessor for getting the `curve` value for a data point. See [d3 line.curve](https://github.com/d3/d3-shape#line_curve) for details.


<a href="#lineChunked_defined" name="lineChunked_defined">#</a> *lineChunked*.**defined**([*defined*])

Get or set *defined*, a function that given a data point (`d`) returns `true` if the data is defined for that point and `false` otherwise. This function is important for determining where gaps are in the data when your data includes points without data in them.

For example, if your data contains attributes `x` and `y`, but no `y` when there is no data available, you might set *defined* as follows:

```js
// sample data
var data = [{ x: 1, y: 10 }, { x: 2 }, { x: 3 }, { x: 4, y: 15 }, { x: 5, y: 12 }];

// returns true if d has a y value set
function defined(d) {
  return d.y != null;
}
```

It is only necessary to define this if your dataset includes entries for points without data.

The default returns `true` for all points.



<a href="#lineChunked_isNext" name="lineChunked_isNext">#</a> *lineChunked*.**isNext**([*isNext*])

Get or set *isNext*, a function to determine if a data point follows the previous. This function enables detecting gaps in the data when there is an unexpected jump.

For example, if your data contains attributes `x` and `y`, and does not include points with missing data, you might set **isNext** as follows:


```js
// sample data
var data = [{ x: 1, y: 10 }, { x: 4, y: 15 }, { x: 5, y: 12 }];

// returns true if current datum is 1 `x` ahead of previous datum
function isNext(previousDatum, currentDatum) {
  var expectedDelta = 1;
  return (currentDatum.x - previousDatum.x) === expectedDelta;
}
```

It is only necessary to define this if your data doesn't explicitly include gaps in it.

The default returns `true` for all points.


<a href="#lineChunked_transitionInitial" name="lineChunked_transitionInitial">#</a> *lineChunked*.**transitionInitial**([*transitionInitial*])

Get or set *transitionInitial*, a boolean flag that indicates whether to perform a transition on initial render or not. If true and the *context* that *lineChunked* is called in is a transition, then the line will animate its y value on initial render. If false, the line will appear rendered immediately with no animation on initial render. This does not affect any subsequent renders and their respective transitions.

The default value is `true`.

<a href="#lineChunked_extendEnds" name="lineChunked_extendEnds">#</a> *lineChunked*.**extendEnds**([*[xMin, xMax]*])

Get or set *extendEnds*, an array `[xMin, xMax]` specifying the minimum and maximum x pixel values
(e.g., `xScale.range()`). If defined, the undefined line will extend to the values provided,
otherwise it will end at the last defined points.


<a href="#lineChunked_accessData" name="lineChunked_accessData">#</a> *lineChunked*.**accessData**([*accessData*])

Get or set *accessData*, a function that specifies how to map from a dataset entry to the array of line data. This is only useful if your input data doesn't use the standard form of `[point1, point2, point3, ...]`. For example, if you pass in your data as `{ results: [point1, point2, point3, ...] }`, you would want to set accessData to `data => data.results`. For convenience, if your accessData function simply accesses a key of an object, you can pass it in directly: `accessData('results')` is equivalent to `accessData(data => data.results)`.

The default value is the identity function `data => data`.


<a href="#lineChunked_lineStyles" name="lineChunked_lineStyles">#</a> *lineChunked*.**lineStyles**([*lineStyles*])

Get or set *lineStyles*, an object mapping style keys to style values to be applied to both defined and undefined lines. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_styles).



<a href="#lineChunked_lineAttrs" name="lineChunked_lineAttrs">#</a> *lineChunked*.**lineAttrs**([*lineAttrs*])

Get or set *lineAttrs*, an object mapping attribute keys to attribute values to be applied to both defined and undefined lines. The passed in *lineAttrs* are merged with the defaults. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_attrs).

The default attrs are:

```js
{
  fill: 'none',
  stroke: '#222',
  'stroke-width': 1.5,
  'stroke-opacity': 1,
}
```



<a href="#lineChunked_gapStyles" name="lineChunked_gapStyles">#</a> *lineChunked*.**gapStyles**([*gapStyles*])

Get or set *gapStyles*, an object mapping style keys to style values to be applied only to undefined lines. It overrides values provided in *lineStyles*. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_styles).



<a href="#lineChunked_gapAttrs" name="lineChunked_gapAttrs">#</a> *lineChunked*.**gapAttrs**([*gapAttrs*])

Get or set *gapAttrs*, an object mapping attribute keys to attribute values to be applied only to undefined lines. It overrides values provided in *lineAttrs*. The passed in *gapAttrs* are merged with the defaults. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_attrs).

The default attrs are:

```js
{
  'stroke-dasharray': '2 2',
  'stroke-opacity': 0.2,
}
```


<a href="#lineChunked_pointStyles" name="lineChunked_pointStyles">#</a> *lineChunked*.**pointStyles**([*pointStyles*])

Get or set *pointStyles*, an object mapping style keys to style values to be applied to points. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_styles).



<a href="#lineChunked_pointAttrs" name="lineChunked_pointAttrs">#</a> *lineChunked*.**pointAttrs**([*pointAttrs*])

Get or set *pointAttrs*, an object mapping attr keys to attr values to be applied to points (circles). Note that if fill is not defined in *pointStyles* or *pointAttrs*, it will be read from the stroke color on the line itself. Uses syntax similar to [d3-selection-multi](https://github.com/d3/d3-selection-multi#selection_attrs).



<a href="#lineChunked_chunk" name="lineChunked_chunk">#</a> *lineChunked*.**chunk**([*chunk*])

Get or set *chunk*, a function that given a data point (`d`) returns the name of the chunk it belongs to. This is necessary if you want to have multiple styled chunks of the defined data. There are two reserved chunk names: `"line"` for the default line for defined data, and `"gap"` for undefined data. It is not recommended that you use `"gap"` in this function. The default value maps all data points to `"line"`.

For example, if you wanted all points with y values less than 10 to be in the `"below-threshold"` chunk, you could do the following:

```js
// sample data
var data = [{ x: 1, y: 5 }, { x: 2, y: 8 }, { x: 3, y: 12 }, { x: 4, y: 15 }, { x: 5, y: 6 }];

// inspects the y value to determine which chunk to use.
function chunk(d) {
  return d.y < 10 ? 'below-threshold' : 'line';
}
```


<a href="#lineChunked_chunkLineResolver" name="lineChunked_chunkLineResolver">#</a> *lineChunked*.**chunkLineResolver**([*chunkLineResolver*])

Get or set *chunkLineResolver*, a function that decides what chunk the line should be rendered in when given two adjacent defined points that may or may not be in the same chunk via `chunk()`. The function takes three parameters:

  * chunkNameLeft (*String*): The name of the chunk for the point on the left
  * chunkNameRight (*String*): The name of the chunk for the point on the right
  * chunkNames (*String[]*): The ordered list of chunk names from chunkDefinitions

It returns the name of the chunk that the line segment should be rendered in. By default it uses the order of the keys in the chunkDefinition object..

For example, if you wanted all lines between two different chunks to use the styling of the chunk that the left point belongs to, you could define *chunkLineResolver* as follows:

```js
// always take the chunk of the item on the left
function chunkLineResolver(chunkNameA, chunkNameB, chunkNames) {
  return chunkNameA;
}
```


<a href="#lineChunked_chunkDefinitions" name="lineChunked_chunkDefinitions">#</a> *lineChunked*.**chunkDefinitions**([*chunkDefinitions*])

Get or set *chunkDefinitions*, an object mapping chunk names to styling and attribute assignments for each chunk. The format is as follows:

```
{
  chunkName1: {
    styles: {},
    attrs: {},
    pointStyles: {},
    pointAttrs: {},
  },
  ...
}
```

Note that by using the reserved chunk names `"line"` and `"gap"`, you can accomplish the equivalent of setting `lineStyles`, `lineAttrs`, `gapStyles`, `gapAttrs`, `pointStyles`, and `pointAttrs` individually. Chunks default to reading settings defined for the chunk `"line"` (or by `lineStyles`, `lineAttrs`), so you can place base styles for  all chunks there and not have to duplicate them.

Full multiple chunks example:

```js
const lineChunked = d3.lineChunked()
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
    'below-threshold': {
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
  .chunk(function (d) { return d[1] < 2 ? 'below-threshold' : 'line'; });
```
