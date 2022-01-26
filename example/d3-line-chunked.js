(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-selection'), require('d3-shape'), require('d3-interpolate-path')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-selection', 'd3-shape', 'd3-interpolate-path'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}, global.d3, global.d3, global.d3, global.d3));
}(this, (function (exports, d3Array, d3Selection, d3Shape, d3InterpolatePath) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // used to generate IDs for clip paths

  var counter = 0;
  /**
   * Renders line with potential gaps in the data by styling the gaps differently
   * from the defined areas. Single points are rendered as circles. Transitions are
   * supported.
   */

  function render() {
    var defaultLineAttrs = {
      fill: 'none',
      stroke: '#222',
      'stroke-width': 1.5,
      'stroke-opacity': 1
    };
    var defaultGapAttrs = {
      'stroke-dasharray': '2 2',
      'stroke-opacity': 0.35
    };
    var defaultPointAttrs = {// read fill and r at render time in case the lineAttrs changed
      // fill: defaultLineAttrs.stroke,
      // r: defaultLineAttrs['stroke-width'],
    };
    var lineChunkName = 'line';
    var gapChunkName = 'gap';
    /**
     * How to access the x attribute of `d`
     */

    var x = function x(d) {
      return d[0];
    };
    /**
     * How to access the y attribute of `d`
     */


    var y = function y(d) {
      return d[1];
    };
    /**
     * Function to determine if there is data for a given point.
     * @param {Any} d data point
     * @return {Boolean} true if the data is defined for the point, false otherwise
     */


    var defined = function defined() {
      return true;
    };
    /**
     * Function to determine if there a point follows the previous. This functions
     * enables detecting gaps in the data when there is an unexpected jump. For
     * instance, if you have time data for every day and the previous data point
     * is for January 5, 2016 and the current data point is for January 12, 2016,
     * then there is data missing for January 6-11, so this function would return
     * true.
     *
     * It is only necessary to define this if your data doesn't explicitly include
     * gaps in it.
     *
     * @param {Any} previousDatum The previous data point
     * @param {Any} currentDatum The data point under consideration
     * @return {Boolean} true If the data is defined for the point, false otherwise
     */


    var isNext = function isNext() {
      return true;
    };
    /**
     * Function to determine which chunk this data is within.
     *
     * @param {Any} d data point
     * @param {Any[]} data the full dataset
     * @return {String} The id of the chunk. Defaults to "line"
     */


    var chunk = function chunk() {
      return lineChunkName;
    };
    /**
     * Decides what line the chunk should be in when given two defined points
     * in different chunks. Uses the order provided by the keys of chunkDefinition
     * if not specified, with `line` and `gap` prepended to the list if not
     * in the chunkDefinition object.
     *
     * @param {String} chunkNameLeft The name of the chunk for the point on the left
     * @param {String} chunkNameRight The name of the chunk for the point on the right
     * @param {String[]} chunkNames the ordered list of chunk names from chunkDefinitions
     * @return {String} The name of the chunk to assign the line segment between the two points to.
     */


    var chunkLineResolver = function defaultChunkLineResolver(chunkNameLeft, chunkNameRight, chunkNames) {
      var leftIndex = chunkNames.indexOf(chunkNameLeft);
      var rightIndex = chunkNames.indexOf(chunkNameRight);
      return leftIndex > rightIndex ? chunkNameLeft : chunkNameRight;
    };
    /**
     * Object specifying how to set style and attributes for each chunk.
     * Format is an object:
     *
     * {
     *   chunkName1: {
     *     styles: {},
     *     attrs: {},
     *     pointStyles: {},
     *     pointAttrs: {},
     *   },
     *   ...
     * }
     */


    var chunkDefinitions = {};
    /**
     * Passed through to d3.line().curve. Default value: d3.curveLinear.
     */

    var curve = d3Shape.curveLinear;
    /**
     * Object mapping style keys to style values to be applied to both
     * defined and undefined lines. Uses syntax similar to d3-selection-multi.
     */

    var lineStyles = {};
    /**
     * Object mapping attr keys to attr values to be applied to both
     * defined and undefined lines. Uses syntax similar to d3-selection-multi.
     */

    var lineAttrs = defaultLineAttrs;
    /**
     * Object mapping style keys to style values to be applied only to the
     * undefined lines. It overrides values provided in lineStyles. Uses
     * syntax similar to d3-selection-multi.
     */

    var gapStyles = {};
    /**
     * Object mapping attr keys to attr values to be applied only to the
     * undefined lines. It overrides values provided in lineAttrs. Uses
     * syntax similar to d3-selection-multi.
     */

    var gapAttrs = defaultGapAttrs;
    /**
     * Object mapping style keys to style values to be applied to points.
     * Uses syntax similar to d3-selection-multi.
     */

    var pointStyles = {};
    /**
     * Object mapping attr keys to attr values to be applied to points.
     * Note that if fill is not defined in pointStyles or pointAttrs, it
     * will be read from the stroke color on the line itself.
     * Uses syntax similar to d3-selection-multi.
     */

    var pointAttrs = defaultPointAttrs;
    /**
     * Flag to set whether to transition on initial render or not. If true,
     * the line starts out flat and transitions in its y value. If false,
     * it just immediately renders.
     */

    var transitionInitial = true;
    /**
     * An array `[xMin, xMax]` specifying the minimum and maximum x pixel values
     * (e.g., `xScale.range()`). If defined, the undefined line will extend to
     * the the values provided, otherwise it will end at the last defined points.
     */

    var extendEnds;
    /**
     * Function to determine how to access the line data array from the passed in data
     * Defaults to the identity data => data.
     * @param {Any} data line dataset
     * @return {Array} The array of data points for that given line
     */

    var accessData = function accessData(data) {
      return data;
    };
    /**
     * A flag specifying whether to render in debug mode or not.
     */


    var debug = false;
    /**
     * Logs warnings if the chunk definitions uses 'style' or 'attr' instead of
     * 'styles' or 'attrs'
     */

    function validateChunkDefinitions() {
      Object.keys(chunkDefinitions).forEach(function (key) {
        var def = chunkDefinitions[key];

        if (def.style != null) {
          console.warn("Warning: chunkDefinitions expects \"styles\", but found \"style\" in ".concat(key), def);
        }

        if (def.attr != null) {
          console.warn("Warning: chunkDefinitions expects \"attrs\", but found \"attr\" in ".concat(key), def);
        }

        if (def.pointStyle != null) {
          console.warn("Warning: chunkDefinitions expects \"pointStyles\", but found \"pointStyle\" in ".concat(key), def);
        }

        if (def.pointAttr != null) {
          console.warn("Warning: chunkDefinitions expects \"pointAttrs\", but found \"pointAttr\" in ".concat(key), def);
        }
      });
    }
    /**
     * Helper to get the chunk names that are defined. Prepends
     * line, gap to the start of the array unless useChunkDefOrder
     * is specified. In this case, it only prepends if they are
     * not specified in the chunk definitions.
     */


    function getChunkNames(useChunkDefOrder) {
      var chunkDefNames = Object.keys(chunkDefinitions);
      var prependLine = true;
      var prependGap = true; // if using chunk definition order, only prepend line/gap if they aren't in the
      // chunk definition.

      if (useChunkDefOrder) {
        prependLine = !chunkDefNames.includes(lineChunkName);
        prependGap = !chunkDefNames.includes(gapChunkName);
      }

      if (prependGap) {
        chunkDefNames.unshift(gapChunkName);
      }

      if (prependLine) {
        chunkDefNames.unshift(lineChunkName);
      } // remove duplicates and return


      return chunkDefNames.filter(function (d, i, a) {
        return a.indexOf(d) === i;
      });
    }
    /**
     * Helper function to compute the contiguous segments of the data
     * @param {String} chunkName the chunk name to match. points not matching are removed.
     *   if undefined, uses 'line'.
     * @param {Array} definedSegments An array of segments (subarrays) of the defined line data (output from
     *   computeDefinedSegments)
     * @return {Array} An array of segments (subarrays) of the chunk line data
     */


    function computeChunkedSegments(chunkName, definedSegments) {
      // helper to split a segment into sub-segments based on the chunk name
      function splitSegment(segment, chunkNames) {
        var startNewSegment = true; // helper for adding to a segment / creating a new one

        function addToSegment(segments, d) {
          // if we are starting a new segment, start it with this point
          if (startNewSegment) {
            segments.push([d]);
            startNewSegment = false; // otherwise add to the last segment
          } else {
            var lastSegment = segments[segments.length - 1];
            lastSegment.push(d);
          }
        }

        var segments = segment.reduce(function (segments, d, i) {
          var dChunkName = chunk(d);
          var dPrev = segment[i - 1];
          var dNext = segment[i + 1]; // if it matches name, add to the segment

          if (dChunkName === chunkName) {
            addToSegment(segments, d);
          } else {
            // check if this point belongs in the previous chunk:
            var added = false; // doesn't match chunk name, but does it go in the segment? as the end?

            if (dPrev) {
              var segmentChunkName = chunkLineResolver(chunk(dPrev), dChunkName, chunkNames); // if it is supposed to be in this chunk, add it in

              if (segmentChunkName === chunkName) {
                addToSegment(segments, d);
                added = true;
                startNewSegment = false;
              }
            } // doesn't belong in previous, so does it belong in next?


            if (!added && dNext != null) {
              // check if this point belongs in the next chunk
              var nextSegmentChunkName = chunkLineResolver(dChunkName, chunk(dNext), chunkNames); // if it's supposed to be in the next chunk, create it

              if (nextSegmentChunkName === chunkName) {
                segments.push([d]);
                added = true;
                startNewSegment = false;
              } else {
                startNewSegment = true;
              } // not previous or next

            } else if (!added) {
              startNewSegment = true;
            }
          }

          return segments;
        }, []);
        return segments;
      }

      var chunkNames = getChunkNames(true);
      var chunkSegments = definedSegments.reduce(function (carry, segment) {
        var newSegments = splitSegment(segment, chunkNames);

        if (newSegments && newSegments.length) {
          return carry.concat(newSegments);
        }

        return carry;
      }, []);
      return chunkSegments;
    }
    /**
     * Helper function to compute the contiguous segments of the data
     * @param {Array} lineData the line data
     * @param {String} chunkName the chunk name to match. points not matching are removed.
     *   if undefined, uses 'line'.
     * @return {Array} An array of segments (subarrays) of the line data
     */


    function computeDefinedSegments(lineData) {
      var startNewSegment = true; // split into segments of continuous data

      var segments = lineData.reduce(function (segments, d) {
        // skip if this point has no data
        if (!defined(d)) {
          startNewSegment = true;
          return segments;
        } // if we are starting a new segment, start it with this point


        if (startNewSegment) {
          segments.push([d]);
          startNewSegment = false; // otherwise see if we are adding to the last segment
        } else {
          var lastSegment = segments[segments.length - 1];
          var lastDatum = lastSegment[lastSegment.length - 1]; // if we expect this point to come next, add it to the segment

          if (isNext(lastDatum, d)) {
            lastSegment.push(d); // otherwise create a new segment
          } else {
            segments.push([d]);
          }
        }

        return segments;
      }, []);
      return segments;
    }
    /**
     * Helper function that applies attrs and styles to the specified selection.
     *
     * @param {Object} selection The d3 selection
     * @param {Object} evaluatedDefinition The evaluated styles and attrs obj (part of output from evaluateDefinitions())
     * @param {Boolean} point if true, uses pointAttrs and pointStyles, otherwise attrs and styles (default: false).
     * @return {void}
     */


    function applyAttrsAndStyles(selection, evaluatedDefinition) {
      var point = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var attrsKey = point ? 'pointAttrs' : 'attrs';
      var stylesKey = point ? 'pointStyles' : 'styles'; // apply user-provided attrs

      Object.keys(evaluatedDefinition[attrsKey]).forEach(function (attr) {
        selection.attr(attr, evaluatedDefinition[attrsKey][attr]);
      }); // apply user-provided styles

      Object.keys(evaluatedDefinition[stylesKey]).forEach(function (style) {
        selection.style(style, evaluatedDefinition[stylesKey][style]);
      });
    }
    /**
     * For the selected line, evaluate the definitions objects. This is necessary since
     * some of the style/attr values are functions that need to be evaluated per line.
     *
     * In general, the definitions are added in this order:
     *
     * 1. definition from lineStyle, lineAttrs, pointStyles, pointAttrs
     * 2. if it is the gap line, add in gapStyles, gapAttrs
     * 3. definition from chunkDefinitions
     *
     * Returns an object matching the form of chunkDefinitions:
     * {
     *   line: { styles, attrs, pointStyles, pointAttrs },
     *   gap: { styles, attrs }
     *   chunkName1: { styles, attrs, pointStyles, pointAttrs },
     *   ...
     * }
     */


    function evaluateDefinitions(d, i) {
      // helper to evaluate an object of attr or style definitions
      function evaluateAttrsOrStyles() {
        var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return Object.keys(input).reduce(function (output, key) {
          var val = input[key];

          if (typeof val === 'function') {
            val = val(d, i);
          }

          output[key] = val;
          return output;
        }, {});
      }

      var evaluated = {}; // get the list of chunks to create evaluated definitions for

      var chunks = getChunkNames(); // for each chunk, evaluate the attrs and styles to use for lines and points

      chunks.forEach(function (chunkName) {
        var chunkDef = chunkDefinitions[chunkName] || {};
        var evaluatedChunk = {
          styles: _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, evaluateAttrsOrStyles(lineStyles)), evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).styles)), chunkName === gapChunkName ? evaluateAttrsOrStyles(gapStyles) : undefined), evaluateAttrsOrStyles(chunkDef.styles)),
          attrs: _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, evaluateAttrsOrStyles(lineAttrs)), evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).attrs)), chunkName === gapChunkName ? evaluateAttrsOrStyles(gapAttrs) : undefined), evaluateAttrsOrStyles(chunkDef.attrs))
        }; // set point attrs. defaults read from this chunk's line settings.

        var basePointAttrs = {
          fill: evaluatedChunk.attrs.stroke,
          r: evaluatedChunk.attrs['stroke-width'] == null ? undefined : parseFloat(evaluatedChunk.attrs['stroke-width']) + 1
        };
        evaluatedChunk.pointAttrs = Object.assign(basePointAttrs, evaluateAttrsOrStyles(pointAttrs), evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).pointAttrs), evaluateAttrsOrStyles(chunkDef.pointAttrs)); // ensure `r` is a number (helps to remove 'px' if provided)

        if (evaluatedChunk.pointAttrs.r != null) {
          evaluatedChunk.pointAttrs.r = parseFloat(evaluatedChunk.pointAttrs.r);
        } // set point styles. if no fill attr set, use the line style stroke. otherwise read from the attr.


        var basePointStyles = chunkDef.pointAttrs && chunkDef.pointAttrs.fill != null ? {} : {
          fill: evaluatedChunk.styles.stroke
        };
        evaluatedChunk.pointStyles = Object.assign(basePointStyles, evaluateAttrsOrStyles(pointStyles), evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).pointStyles), evaluateAttrsOrStyles(chunkDef.pointStyles));
        evaluated[chunkName] = evaluatedChunk;
      });
      return evaluated;
    }
    /**
     * Render the points for when segments have length 1.
     */


    function renderCircles(initialRender, transition, context, root, points, evaluatedDefinition, className) {
      var primaryClassName = className.split(' ')[0];
      var circles = root.selectAll(".".concat(primaryClassName)).data(points, function (d) {
        return d.id;
      }); // read in properties about the transition if we have one

      var transitionDuration = transition ? context.duration() : 0;
      var transitionDelay = transition ? context.delay() : 0; // EXIT

      if (transition) {
        circles.exit().transition().delay(transitionDelay).duration(transitionDuration * 0.05).attr('r', 1e-6).remove();
      } else {
        circles.exit().remove();
      } // ENTER


      var circlesEnter = circles.enter().append('circle'); // apply user-provided attrs, using attributes from current line if not provided

      applyAttrsAndStyles(circlesEnter, evaluatedDefinition, true);
      circlesEnter.classed(className, true).attr('r', 1e-6) // overrides provided `r value for now
      .attr('cx', function (d) {
        return x(d.data);
      }).attr('cy', function (d) {
        return y(d.data);
      }); // handle with transition

      if ((!initialRender || initialRender && transitionInitial) && transition) {
        var enterDuration = transitionDuration * 0.15; // delay sizing up the radius until after the line transition

        circlesEnter.transition(context).delay(transitionDelay + (transitionDuration - enterDuration)).duration(enterDuration).attr('r', evaluatedDefinition.pointAttrs.r);
      } else {
        circlesEnter.attr('r', evaluatedDefinition.pointAttrs.r);
      } // UPDATE


      if (transition) {
        circles = circles.transition(context);
      }

      circles.attr('r', evaluatedDefinition.pointAttrs.r).attr('cx', function (d) {
        return x(d.data);
      }).attr('cy', function (d) {
        return y(d.data);
      });
    }

    function renderClipRects(initialRender, transition, context, root, segments, _ref, _ref2, evaluatedDefinition, path, clipPathId) {
      var _ref3 = _slicedToArray(_ref, 2),
          xMin = _ref3[0],
          xMax = _ref3[1];

      var _ref4 = _slicedToArray(_ref2, 2),
          yMin = _ref4[0],
          yMax = _ref4[1];

      // TODO: issue with assigning IDs to clipPath elements. need to update how we select/create them
      // need reference to path element to set stroke-width property
      var clipPath = root.select("#".concat(clipPathId));
      var gDebug = root.select('.d3-line-chunked-debug'); // set up debug group

      if (debug && gDebug.empty()) {
        gDebug = root.append('g').classed('d3-line-chunked-debug', true);
      } else if (!debug && !gDebug.empty()) {
        gDebug.remove();
      }

      var clipPathRects = clipPath.selectAll('rect').data(segments);
      var debugRects;

      if (debug) {
        debugRects = gDebug.selectAll('rect').data(segments);
      } // get stroke width to avoid having the clip rects clip the stroke
      // See https://github.com/pbeshai/d3-line-chunked/issues/2


      var strokeWidth = parseFloat(evaluatedDefinition.styles['stroke-width'] || path.style('stroke-width') || // reads from CSS too
      evaluatedDefinition.attrs['stroke-width']);
      var strokeWidthClipAdjustment = strokeWidth;
      var clipRectY = yMin - strokeWidthClipAdjustment;
      var clipRectHeight = yMax + strokeWidthClipAdjustment - (yMin - strokeWidthClipAdjustment); // compute the currently visible area pairs of [xStart, xEnd] for each clip rect
      // if no clip rects, the whole area is visible.

      var visibleArea;

      if (transition) {
        // compute the start and end x values for a data point based on maximizing visibility
        // around the middle of the rect.
        var visibleStartEnd = function visibleStartEnd(d, visibleArea) {
          // eslint-disable-line no-inner-declarations
          var xStart = x(d[0]);
          var xEnd = x(d[d.length - 1]);
          var xMid = xStart + (xEnd - xStart) / 2;
          var visArea = visibleArea.find(function (area) {
            return area[0] <= xMid && xMid <= area[1];
          }); // set width to overlapping visible area

          if (visArea) {
            return [Math.max(visArea[0], xStart), Math.min(xEnd, visArea[1])];
          } // return xEnd - xStart;


          return [xMid, xMid];
        };

        var exitRect = function exitRect(rect) {
          // eslint-disable-line no-inner-declarations
          rect.attr('x', function (d) {
            return visibleStartEnd(d, nextVisibleArea)[0];
          }).attr('width', function (d) {
            var _visibleStartEnd = visibleStartEnd(d, nextVisibleArea),
                _visibleStartEnd2 = _slicedToArray(_visibleStartEnd, 2),
                xStart = _visibleStartEnd2[0],
                xEnd = _visibleStartEnd2[1];

            return xEnd - xStart;
          });
        };

        var enterRect = function enterRect(rect) {
          // eslint-disable-line no-inner-declarations
          rect.attr('x', function (d) {
            return visibleStartEnd(d, visibleArea)[0];
          }).attr('width', function (d) {
            var _visibleStartEnd3 = visibleStartEnd(d, visibleArea),
                _visibleStartEnd4 = _slicedToArray(_visibleStartEnd3, 2),
                xStart = _visibleStartEnd4[0],
                xEnd = _visibleStartEnd4[1];

            return xEnd - xStart;
          }).attr('y', clipRectY).attr('height', clipRectHeight);
        };

        // select previous rects
        var previousRects = clipPath.selectAll('rect').nodes(); // no previous rects = visible area is everything

        if (!previousRects.length) {
          visibleArea = [[xMin, xMax]];
        } else {
          visibleArea = previousRects.map(function (rect) {
            var selectedRect = d3Selection.select(rect);
            var xStart = parseFloat(selectedRect.attr('x'));
            var xEnd = parseFloat(selectedRect.attr('width')) + xStart;
            return [xStart, xEnd];
          });
        } // set up the clipping paths
        // animate by shrinking width to 0 and setting x to the mid point


        var nextVisibleArea;

        if (!segments.length) {
          nextVisibleArea = [[0, 0]];
        } else {
          nextVisibleArea = segments.map(function (d) {
            var xStart = x(d[0]);
            var xEnd = x(d[d.length - 1]);
            return [xStart, xEnd];
          });
        }

        clipPathRects.exit().transition(context).call(exitRect).remove();
        var clipPathRectsEnter = clipPathRects.enter().append('rect').call(enterRect);
        clipPathRects = clipPathRects.merge(clipPathRectsEnter);
        clipPathRects = clipPathRects.transition(context); // debug rects should match clipPathRects

        if (debug) {
          debugRects.exit().transition(context).call(exitRect).remove();
          var debugRectsEnter = debugRects.enter().append('rect').style('fill', 'rgba(255, 0, 0, 0.3)').style('stroke', 'rgba(255, 0, 0, 0.6)').call(enterRect);
          debugRects = debugRects.merge(debugRectsEnter);
          debugRects = debugRects.transition(context);
        } // not in transition

      } else {
        clipPathRects.exit().remove();

        var _clipPathRectsEnter = clipPathRects.enter().append('rect');

        clipPathRects = clipPathRects.merge(_clipPathRectsEnter);

        if (debug) {
          debugRects.exit().remove();

          var _debugRectsEnter = debugRects.enter().append('rect').style('fill', 'rgba(255, 0, 0, 0.3)').style('stroke', 'rgba(255, 0, 0, 0.6)');

          debugRects = debugRects.merge(_debugRectsEnter);
        }
      } // after transition, update the clip rect dimensions


      function updateRect(rect) {
        rect.attr('x', function (d) {
          // if at the edge, adjust for stroke width
          var val = x(d[0]);

          if (val === xMin) {
            return val - strokeWidthClipAdjustment;
          }

          return val;
        }).attr('width', function (d) {
          // if at the edge, adjust for stroke width to prevent clipping it
          var valMin = x(d[0]);
          var valMax = x(d[d.length - 1]);

          if (valMin === xMin) {
            valMin -= strokeWidthClipAdjustment;
          }

          if (valMax === xMax) {
            valMax += strokeWidthClipAdjustment;
          }

          return valMax - valMin;
        }).attr('y', clipRectY).attr('height', clipRectHeight);
      }

      clipPathRects.call(updateRect);

      if (debug) {
        debugRects.call(updateRect);
      }
    }
    /**
     * Helper function to draw the actual path
     */


    function renderPath(initialRender, transition, context, root, lineData, evaluatedDefinition, line, initialLine, className, clipPathId) {
      var path = root.select(".".concat(className.split(' ')[0])); // initial render

      if (path.empty()) {
        path = root.append('path');
      }

      var pathSelection = path;

      if (clipPathId) {
        path.attr('clip-path', "url(#".concat(clipPathId, ")"));
      } // handle animations for initial render


      if (initialRender) {
        path.attr('d', initialLine(lineData));
      } // apply user defined styles and attributes


      applyAttrsAndStyles(path, evaluatedDefinition);
      path.classed(className, true); // handle transition

      if (transition) {
        path = path.transition(context);
      }

      if (path.attrTween) {
        // use attrTween is available (in transition)
        path.attrTween('d', function dTween() {
          var previous = d3Selection.select(this).attr('d');
          var current = line(lineData);
          return d3InterpolatePath.interpolatePath(previous, current);
        });
      } else {
        path.attr('d', function () {
          return line(lineData);
        });
      } // can't return path since it might have the transition


      return pathSelection;
    }
    /**
     * Helper to get the line functions to use to draw the lines. Possibly
     * updates the line data to be in [x, y] format if extendEnds is true.
     *
     * @return {Object} { line, initialLine, lineData }
     */


    function getLineFunctions(lineData, initialRender, yDomain) {
      // eslint-disable-line no-unused-vars
      var yMax = yDomain[1]; // main line function

      var line = d3Shape.line().x(x).y(y).curve(curve);
      var initialLine; // if the user specifies to extend ends for the undefined line, add points to the line for them.

      if (extendEnds && lineData.length) {
        // we have to process the data here since we don't know how to format an input object
        // we use the [x, y] format of a data point
        var processedLineData = lineData.map(function (d) {
          return [x(d), y(d)];
        });
        lineData = [[extendEnds[0], processedLineData[0][1]]].concat(_toConsumableArray(processedLineData), [[extendEnds[1], processedLineData[processedLineData.length - 1][1]]]); // this line function works on the processed data (default .x and .y read the [x,y] format)

        line = d3Shape.line().curve(curve);
      } // handle animations for initial render


      if (initialRender) {
        // have the line load in with a flat y value
        initialLine = line;

        if (transitionInitial) {
          initialLine = d3Shape.line().x(x).y(yMax).curve(curve); // if the user extends ends, we should use the line that works on that data

          if (extendEnds) {
            initialLine = d3Shape.line().y(yMax).curve(curve);
          }
        }
      }

      return {
        line: line,
        initialLine: initialLine || line,
        lineData: lineData
      };
    }

    function initializeClipPath(chunkName, root) {
      if (chunkName === gapChunkName) {
        return undefined;
      }

      var defs = root.select('defs');

      if (defs.empty()) {
        defs = root.append('defs');
      } // className = d3-line-chunked-clip-chunkName


      var className = "d3-line-chunked-clip-".concat(chunkName);
      var clipPath = defs.select(".".concat(className)); // initial render

      if (clipPath.empty()) {
        clipPath = defs.append('clipPath').attr('class', className).attr('id', "d3-line-chunked-clip-".concat(chunkName, "-").concat(counter));
        counter += 1;
      }

      return clipPath.attr('id');
    }
    /**
     * Render the lines: circles, paths, clip rects for the given (data, lineIndex)
     */


    function renderLines(initialRender, transition, context, root, data, lineIndex) {
      // use the accessor if provided (e.g. if the data is something like
      // `{ results: [[x,y], [[x,y], ...]}`)
      var lineData = accessData(data); // filter to only defined data to plot the lines

      var filteredLineData = lineData.filter(defined); // determine the extent of the y values

      var yExtent = d3Array.extent(filteredLineData.map(function (d) {
        return y(d);
      })); // determine the extent of the x values to handle stroke-width adjustments on
      // clipping rects. Do not use extendEnds here since it can clip the line ending
      // in an unnatural way, it's better to just show the end.

      var xExtent = d3Array.extent(filteredLineData.map(function (d) {
        return x(d);
      })); // evaluate attrs and styles for the given dataset
      // pass in the raw data and index for computing attrs and styles if they are functinos

      var evaluatedDefinitions = evaluateDefinitions(data, lineIndex); // update line functions and data depending on animation and render circumstances

      var lineResults = getLineFunctions(filteredLineData, initialRender, yExtent); // lineData possibly updated if extendEnds is true since we normalize to [x, y] format

      var line = lineResults.line,
          initialLine = lineResults.initialLine,
          modifiedLineData = lineResults.lineData; // for each chunk type, render a line

      var chunkNames = getChunkNames();
      var definedSegments = computeDefinedSegments(lineData); // for each chunk, draw a line, circles and clip rect

      chunkNames.forEach(function (chunkName) {
        var clipPathId = initializeClipPath(chunkName, root);
        var className = "d3-line-chunked-chunk-".concat(chunkName);

        if (chunkName === lineChunkName) {
          className = "d3-line-chunked-defined ".concat(className);
        } else if (chunkName === gapChunkName) {
          className = "d3-line-chunked-undefined ".concat(className);
        } // get the eval defs for this chunk name


        var evaluatedDefinition = evaluatedDefinitions[chunkName];
        var path = renderPath(initialRender, transition, context, root, modifiedLineData, evaluatedDefinition, line, initialLine, className, clipPathId);

        if (chunkName !== gapChunkName) {
          // compute the segments and points for this chunk type
          var segments = computeChunkedSegments(chunkName, definedSegments);
          var points = segments.filter(function (segment) {
            return segment.length === 1;
          }).map(function (segment) {
            return {
              // use random ID so they are treated as entering/exiting each time
              id: x(segment[0]),
              data: segment[0]
            };
          });
          var circlesClassName = className.split(' ').map(function (name) {
            return "".concat(name, "-point");
          }).join(' ');
          renderCircles(initialRender, transition, context, root, points, evaluatedDefinition, circlesClassName);
          renderClipRects(initialRender, transition, context, root, segments, xExtent, yExtent, evaluatedDefinition, path, clipPathId);
        }
      }); // ensure all circles are at the top

      root.selectAll('circle').raise();
    } // the main function that is returned


    function lineChunked(context) {
      if (!context) {
        return;
      }

      var selection = context.selection ? context.selection() : context; // handle transition

      if (!selection || selection.empty()) {
        return;
      }

      var transition = false;

      if (selection !== context) {
        transition = true;
      }

      selection.each(function each(data, lineIndex) {
        var root = d3Selection.select(this);
        var initialRender = root.select('.d3-line-chunked-defined').empty();
        renderLines(initialRender, transition, context, root, data, lineIndex);
      }); // provide warning about wrong attr/defs

      validateChunkDefinitions();
    } // ------------------------------------------------
    // Define getters and setters
    // ------------------------------------------------


    function getterSetter(_ref5) {
      var get = _ref5.get,
          set = _ref5.set,
          setType = _ref5.setType,
          asConstant = _ref5.asConstant;
      return function getSet(newValue) {
        if (arguments.length) {
          // main setter if setType matches newValue type
          // eslint-disable-next-line valid-typeof
          if (!setType && newValue != null || setType && _typeof(newValue) === setType) {
            set(newValue); // setter to constant function if provided
          } else if (asConstant && newValue != null) {
            set(asConstant(newValue));
          }

          return lineChunked;
        } // otherwise ignore value/no value provided, so use getter


        return get();
      };
    } // define `x([x])`


    lineChunked.x = getterSetter({
      get: function get() {
        return x;
      },
      set: function set(newValue) {
        x = newValue;
      },
      setType: 'function',
      asConstant: function asConstant(newValue) {
        return function () {
          return +newValue;
        };
      } // d3 v4 uses +, so we do too

    }); // define `y([y])`

    lineChunked.y = getterSetter({
      get: function get() {
        return y;
      },
      set: function set(newValue) {
        y = newValue;
      },
      setType: 'function',
      asConstant: function asConstant(newValue) {
        return function () {
          return +newValue;
        };
      }
    }); // define `defined([defined])`

    lineChunked.defined = getterSetter({
      get: function get() {
        return defined;
      },
      set: function set(newValue) {
        defined = newValue;
      },
      setType: 'function',
      asConstant: function asConstant(newValue) {
        return function () {
          return !!newValue;
        };
      }
    }); // define `isNext([isNext])`

    lineChunked.isNext = getterSetter({
      get: function get() {
        return isNext;
      },
      set: function set(newValue) {
        isNext = newValue;
      },
      setType: 'function',
      asConstant: function asConstant(newValue) {
        return function () {
          return !!newValue;
        };
      }
    }); // define `chunk([chunk])`

    lineChunked.chunk = getterSetter({
      get: function get() {
        return chunk;
      },
      set: function set(newValue) {
        chunk = newValue;
      },
      setType: 'function',
      asConstant: function asConstant(newValue) {
        return function () {
          return newValue;
        };
      }
    }); // define `chunkLineResolver([chunkLineResolver])`

    lineChunked.chunkLineResolver = getterSetter({
      get: function get() {
        return chunkLineResolver;
      },
      set: function set(newValue) {
        chunkLineResolver = newValue;
      },
      setType: 'function'
    }); // define `chunkDefinitions([chunkDefinitions])`

    lineChunked.chunkDefinitions = getterSetter({
      get: function get() {
        return chunkDefinitions;
      },
      set: function set(newValue) {
        chunkDefinitions = newValue;
      },
      setType: 'object'
    }); // define `curve([curve])`

    lineChunked.curve = getterSetter({
      get: function get() {
        return curve;
      },
      set: function set(newValue) {
        curve = newValue;
      },
      setType: 'function'
    }); // define `lineStyles([lineStyles])`

    lineChunked.lineStyles = getterSetter({
      get: function get() {
        return lineStyles;
      },
      set: function set(newValue) {
        lineStyles = newValue;
      },
      setType: 'object'
    }); // define `gapStyles([gapStyles])`

    lineChunked.gapStyles = getterSetter({
      get: function get() {
        return gapStyles;
      },
      set: function set(newValue) {
        gapStyles = newValue;
      },
      setType: 'object'
    }); // define `pointStyles([pointStyles])`

    lineChunked.pointStyles = getterSetter({
      get: function get() {
        return pointStyles;
      },
      set: function set(newValue) {
        pointStyles = newValue;
      },
      setType: 'object'
    }); // define `lineAttrs([lineAttrs])`

    lineChunked.lineAttrs = getterSetter({
      get: function get() {
        return lineAttrs;
      },
      set: function set(newValue) {
        lineAttrs = newValue;
      },
      setType: 'object'
    }); // define `gapAttrs([gapAttrs])`

    lineChunked.gapAttrs = getterSetter({
      get: function get() {
        return gapAttrs;
      },
      set: function set(newValue) {
        gapAttrs = newValue;
      },
      setType: 'object'
    }); // define `pointAttrs([pointAttrs])`

    lineChunked.pointAttrs = getterSetter({
      get: function get() {
        return pointAttrs;
      },
      set: function set(newValue) {
        pointAttrs = newValue;
      },
      setType: 'object'
    }); // define `transitionInitial([transitionInitial])`

    lineChunked.transitionInitial = getterSetter({
      get: function get() {
        return transitionInitial;
      },
      set: function set(newValue) {
        transitionInitial = newValue;
      },
      setType: 'boolean'
    }); // define `extendEnds([extendEnds])`

    lineChunked.extendEnds = getterSetter({
      get: function get() {
        return extendEnds;
      },
      set: function set(newValue) {
        extendEnds = newValue;
      },
      setType: 'object' // should be an array

    }); // define `accessData([accessData])`

    lineChunked.accessData = getterSetter({
      get: function get() {
        return accessData;
      },
      set: function set(newValue) {
        accessData = newValue;
      },
      setType: 'function',
      asConstant: function asConstant(newValue) {
        return function (d) {
          return d[newValue];
        };
      }
    }); // define `debug([debug])`

    lineChunked.debug = getterSetter({
      get: function get() {
        return debug;
      },
      set: function set(newValue) {
        debug = newValue;
      },
      setType: 'boolean'
    });
    return lineChunked;
  }

  exports.lineChunked = render;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
