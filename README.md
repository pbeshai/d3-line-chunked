# d3-line-chunked

[![npm version](https://badge.fury.io/js/d3-line-chunked.svg)](https://badge.fury.io/js/d3-line-chunked)

A d3 plugin that renders a line with potential gaps in the data by styling the gaps differently
from the defined areas. Single points are rendered as circles. Transitions are supported.

Demo: http://peterbeshai.com/vis/d3-line-chunked/

![d3-line-chunked demo](https://cloud.githubusercontent.com/assets/793847/18028989/5aa2ee0c-6c59-11e6-88ef-143a79715cc6.gif)

## Example Usage

```js
var lineChunked = d3.lineChunked()
  .x(function (d) { return x(d.x); })
  .y(function (d) { return y(d.y); })
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

## API Reference

*This will eventually be filled in. For now, see the source code.*

<a href="#lineChunked" name="lineChunked">#</a> <b>lineChunked</b>()
