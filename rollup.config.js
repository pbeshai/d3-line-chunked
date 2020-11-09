import babel from '@rollup/plugin-babel';

var globals = {
  'd3-array': 'd3',
  'd3-interpolate': 'd3',
  'd3-interpolate-path': 'd3',
  'd3-shape': 'd3',
  'd3-selection': 'd3',
  'd3-transition': 'd3',
};

export default {
  input: 'index.js',
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ],
  external: Object.keys(globals),
  output: [
    { extend: true, name: 'd3', format: 'umd', file: 'build/d3-line-chunked.js', globals, },
    { extend: true, name: 'd3', format: 'umd', file: 'example/d3-line-chunked.js', globals, },
  ]
};
