import { extent } from 'd3-array';
import { select } from 'd3-selection';
import { curveLinear, line as d3Line } from 'd3-shape';
import { interpolatePath } from 'd3-interpolate-path'; // only needed if using transitions

// used to generate IDs for clip paths
let counter = 0;

/**
 * Renders line with potential gaps in the data by styling the gaps differently
 * from the defined areas. Single points are rendered as circles. Transitions are
 * supported.
 */
export default function () {
  const defaultLineAttrs = {
    fill: 'none',
    stroke: '#222',
    'stroke-width': 1.5,
    'stroke-opacity': 1,
  };
  const defaultGapAttrs = {
    'stroke-dasharray': '2 2',
    'stroke-opacity': 0.35,
  };
  const defaultPointAttrs = {
    // read fill and r at render time in case the lineAttrs changed
    // fill: defaultLineAttrs.stroke,
    // r: defaultLineAttrs['stroke-width'],
  };

  const lineChunkName = 'line';
  const gapChunkName = 'gap';

  /**
   * How to access the x attribute of `d`
   */
  let x = d => d[0];

  /**
   * How to access the y attribute of `d`
   */
  let y = d => d[1];

  /**
   * Function to determine if there is data for a given point.
   * @param {Any} d data point
   * @return {Boolean} true if the data is defined for the point, false otherwise
   */
  let defined = () => true;

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
  let isNext = () => true;

  /**
   * Function to determine which chunk this data is within.
   *
   * @param {Any} d data point
   * @param {Any[]} data the full dataset
   * @return {String} The id of the chunk. Defaults to "line"
   */
  let chunk = () => lineChunkName;

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
  let chunkLineResolver = function defaultChunkLineResolver(chunkNameLeft, chunkNameRight, chunkNames) {
    const leftIndex = chunkNames.indexOf(chunkNameLeft);
    const rightIndex = chunkNames.indexOf(chunkNameRight);

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
  let chunkDefinitions = {};

  /**
   * Passed through to d3.line().curve. Default value: d3.curveLinear.
   */
  let curve = curveLinear;

  /**
   * Object mapping style keys to style values to be applied to both
   * defined and undefined lines. Uses syntax similar to d3-selection-multi.
   */
  let lineStyles = {};

  /**
   * Object mapping attr keys to attr values to be applied to both
   * defined and undefined lines. Uses syntax similar to d3-selection-multi.
   */
  let lineAttrs = defaultLineAttrs;

  /**
   * Object mapping style keys to style values to be applied only to the
   * undefined lines. It overrides values provided in lineStyles. Uses
   * syntax similar to d3-selection-multi.
   */
  let gapStyles = {};

  /**
   * Object mapping attr keys to attr values to be applied only to the
   * undefined lines. It overrides values provided in lineAttrs. Uses
   * syntax similar to d3-selection-multi.
   */
  let gapAttrs = defaultGapAttrs;

  /**
   * Object mapping style keys to style values to be applied to points.
   * Uses syntax similar to d3-selection-multi.
   */
  let pointStyles = {};

  /**
   * Object mapping attr keys to attr values to be applied to points.
   * Note that if fill is not defined in pointStyles or pointAttrs, it
   * will be read from the stroke color on the line itself.
   * Uses syntax similar to d3-selection-multi.
   */
  let pointAttrs = defaultPointAttrs;

  /**
   * Flag to set whether to transition on initial render or not. If true,
   * the line starts out flat and transitions in its y value. If false,
   * it just immediately renders.
   */
  let transitionInitial = true;

  /**
   * An array `[xMin, xMax]` specifying the minimum and maximum x pixel values
   * (e.g., `xScale.range()`). If defined, the undefined line will extend to
   * the the values provided, otherwise it will end at the last defined points.
   */
  let extendEnds;

  /**
   * Function to determine how to access the line data array from the passed in data
   * Defaults to the identity data => data.
   * @param {Any} data line dataset
   * @return {Array} The array of data points for that given line
   */
  let accessData = data => data;

  /**
   * A flag specifying whether to render in debug mode or not.
   */
  let debug = false;


  /**
   * Logs warnings if the chunk definitions uses 'style' or 'attr' instead of
   * 'styles' or 'attrs'
   */
  function validateChunkDefinitions() {
    Object.keys(chunkDefinitions).forEach(key => {
      const def = chunkDefinitions[key];
      if (def.style != null) {
        console.warn(`Warning: chunkDefinitions expects "styles", but found "style" in ${key}`, def);
      }
      if (def.attr != null) {
        console.warn(`Warning: chunkDefinitions expects "attrs", but found "attr" in ${key}`, def);
      }
      if (def.pointStyle != null) {
        console.warn(`Warning: chunkDefinitions expects "pointStyles", but found "pointStyle" in ${key}`, def);
      }
      if (def.pointAttr != null) {
        console.warn(`Warning: chunkDefinitions expects "pointAttrs", but found "pointAttr" in ${key}`, def);
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
    const chunkDefNames = Object.keys(chunkDefinitions);
    let prependLine = true;
    let prependGap = true;

    // if using chunk definition order, only prepend line/gap if they aren't in the
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
    }

    // remove duplicates and return
    return chunkDefNames.filter((d, i, a) => a.indexOf(d) === i);
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
      let startNewSegment = true;

      // helper for adding to a segment / creating a new one
      function addToSegment(segments, d) {
        // if we are starting a new segment, start it with this point
        if (startNewSegment) {
          segments.push([d]);
          startNewSegment = false;

        // otherwise add to the last segment
        } else {
          const lastSegment = segments[segments.length - 1];
          lastSegment.push(d);
        }
      }

      const segments = segment.reduce((segments, d, i) => {
        const dChunkName = chunk(d);
        const dPrev = segment[i - 1];
        const dNext = segment[i + 1];

        // if it matches name, add to the segment
        if (dChunkName === chunkName) {
          addToSegment(segments, d);
        } else {
          // check if this point belongs in the previous chunk:
          let added = false;
          // doesn't match chunk name, but does it go in the segment? as the end?
          if (dPrev) {
            const segmentChunkName = chunkLineResolver(chunk(dPrev), dChunkName, chunkNames);

            // if it is supposed to be in this chunk, add it in
            if (segmentChunkName === chunkName) {
              addToSegment(segments, d);
              added = true;
              startNewSegment = false;
            }
          }

          // doesn't belong in previous, so does it belong in next?
          if (!added && dNext != null) {
            // check if this point belongs in the next chunk
            const nextSegmentChunkName = chunkLineResolver(dChunkName, chunk(dNext), chunkNames);

            // if it's supposed to be in the next chunk, create it
            if (nextSegmentChunkName === chunkName) {
              segments.push([d]);
              added = true;
              startNewSegment = false;
            } else {
              startNewSegment = true;
            }

          // not previous or next
          } else if (!added) {
            startNewSegment = true;
          }
        }


        return segments;
      }, []);

      return segments;
    }

    const chunkNames = getChunkNames(true);

    const chunkSegments = definedSegments.reduce((carry, segment) => {
      const newSegments = splitSegment(segment, chunkNames);
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
    let startNewSegment = true;

    // split into segments of continuous data
    const segments = lineData.reduce((segments, d) => {
      // skip if this point has no data
      if (!defined(d)) {
        startNewSegment = true;
        return segments;
      }

      // if we are starting a new segment, start it with this point
      if (startNewSegment) {
        segments.push([d]);
        startNewSegment = false;

      // otherwise see if we are adding to the last segment
      } else {
        const lastSegment = segments[segments.length - 1];
        const lastDatum = lastSegment[lastSegment.length - 1];
        // if we expect this point to come next, add it to the segment
        if (isNext(lastDatum, d)) {
          lastSegment.push(d);

        // otherwise create a new segment
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
  function applyAttrsAndStyles(selection, evaluatedDefinition, point = false) {
    const attrsKey = point ? 'pointAttrs' : 'attrs';
    const stylesKey = point ? 'pointStyles' : 'styles';

    // apply user-provided attrs
    Object.keys(evaluatedDefinition[attrsKey]).forEach((attr) => {
      selection.attr(attr, evaluatedDefinition[attrsKey][attr]);
    });

    // apply user-provided styles
    Object.keys(evaluatedDefinition[stylesKey]).forEach((style) => {
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
    function evaluateAttrsOrStyles(input = {}) {
      return Object.keys(input).reduce((output, key) => {
        let val = input[key];

        if (typeof val === 'function') {
          val = val(d, i);
        }

        output[key] = val;
        return output;
      }, {});
    }

    const evaluated = {};

    // get the list of chunks to create evaluated definitions for
    const chunks = getChunkNames();

    // for each chunk, evaluate the attrs and styles to use for lines and points
    chunks.forEach(chunkName => {
      const chunkDef = chunkDefinitions[chunkName] || {};
      const evaluatedChunk = {
        styles: Object.assign({},
          evaluateAttrsOrStyles(lineStyles),
          evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).styles),
          chunkName === gapChunkName ? evaluateAttrsOrStyles(gapStyles) : undefined,
          evaluateAttrsOrStyles(chunkDef.styles)),
        attrs: Object.assign({},
          evaluateAttrsOrStyles(lineAttrs),
          evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).attrs),
          chunkName === gapChunkName ? evaluateAttrsOrStyles(gapAttrs) : undefined,
          evaluateAttrsOrStyles(chunkDef.attrs)),
      };

      // set point attrs. defaults read from this chunk's line settings.
      const basePointAttrs = {
        fill: evaluatedChunk.attrs.stroke,
        r: evaluatedChunk.attrs['stroke-width'] == null ?
          undefined :
          parseFloat(evaluatedChunk.attrs['stroke-width']) + 1,
      };

      evaluatedChunk.pointAttrs = Object.assign(basePointAttrs,
        evaluateAttrsOrStyles(pointAttrs),
        evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).pointAttrs),
        evaluateAttrsOrStyles(chunkDef.pointAttrs));

      // ensure `r` is a number (helps to remove 'px' if provided)
      if (evaluatedChunk.pointAttrs.r != null) {
        evaluatedChunk.pointAttrs.r = parseFloat(evaluatedChunk.pointAttrs.r);
      }

      // set point styles. if no fill attr set, use the line style stroke. otherwise read from the attr.
      const basePointStyles = (chunkDef.pointAttrs && chunkDef.pointAttrs.fill != null) ? {} : {
        fill: evaluatedChunk.styles.stroke,
      };

      evaluatedChunk.pointStyles = Object.assign(basePointStyles,
        evaluateAttrsOrStyles(pointStyles),
        evaluateAttrsOrStyles((chunkDefinitions[lineChunkName] || {}).pointStyles),
        evaluateAttrsOrStyles(chunkDef.pointStyles));

      evaluated[chunkName] = evaluatedChunk;
    });

    return evaluated;
  }


  /**
   * Render the points for when segments have length 1.
   */
  function renderCircles(initialRender, transition, context, root, points, evaluatedDefinition,
      className) {
    const primaryClassName = className.split(' ')[0];
    let circles = root.selectAll(`.${primaryClassName}`).data(points, d => d.id);

    // read in properties about the transition if we have one
    const transitionDuration = transition ? context.duration() : 0;
    const transitionDelay = transition ? context.delay() : 0;

    // EXIT
    if (transition) {
      circles.exit()
        .transition()
        .delay(transitionDelay)
        .duration(transitionDuration * 0.05)
        .attr('r', 1e-6)
        .remove();
    } else {
      circles.exit().remove();
    }

    // ENTER
    const circlesEnter = circles.enter().append('circle');

    // apply user-provided attrs, using attributes from current line if not provided
    applyAttrsAndStyles(circlesEnter, evaluatedDefinition, true);

    circlesEnter
      .classed(className, true)
      .attr('r', 1e-6) // overrides provided `r value for now
      .attr('cx', d => x(d.data))
      .attr('cy', d => y(d.data));


    // handle with transition
    if ((!initialRender || (initialRender && transitionInitial)) && transition) {
      const enterDuration = transitionDuration * 0.15;

      // delay sizing up the radius until after the line transition
      circlesEnter
        .transition(context)
        .delay(transitionDelay + (transitionDuration - enterDuration))
        .duration(enterDuration)
        .attr('r', evaluatedDefinition.pointAttrs.r);
    } else {
      circlesEnter.attr('r', evaluatedDefinition.pointAttrs.r);
    }


    // UPDATE
    if (transition) {
      circles = circles.transition(context);
    }
    circles.attr('r', evaluatedDefinition.pointAttrs.r)
      .attr('cx', d => x(d.data))
      .attr('cy', d => y(d.data));
  }

  function renderClipRects(initialRender, transition, context, root, segments,
      [xMin, xMax], [yMin, yMax], evaluatedDefinition, path, clipPathId) {
    // TODO: issue with assigning IDs to clipPath elements. need to update how we select/create them
    // need reference to path element to set stroke-width property
    const clipPath = root.select(`#${clipPathId}`);
    let gDebug = root.select('.d3-line-chunked-debug');

    // set up debug group
    if (debug && gDebug.empty()) {
      gDebug = root.append('g').classed('d3-line-chunked-debug', true);
    } else if (!debug && !gDebug.empty()) {
      gDebug.remove();
    }

    let clipPathRects = clipPath.selectAll('rect').data(segments);
    let debugRects;
    if (debug) {
      debugRects = gDebug.selectAll('rect').data(segments);
    }

    // get stroke width to avoid having the clip rects clip the stroke
    // See https://github.com/pbeshai/d3-line-chunked/issues/2
    const strokeWidth = parseFloat(evaluatedDefinition.styles['stroke-width']
      || path.style('stroke-width') // reads from CSS too
      || evaluatedDefinition.attrs['stroke-width']);
    const strokeWidthClipAdjustment = strokeWidth;
    const clipRectY = yMin - strokeWidthClipAdjustment;
    const clipRectHeight = (yMax + strokeWidthClipAdjustment) - (yMin - strokeWidthClipAdjustment);

    // compute the currently visible area pairs of [xStart, xEnd] for each clip rect
    // if no clip rects, the whole area is visible.
    let visibleArea;

    if (transition) {
      // select previous rects
      const previousRects = clipPath.selectAll('rect').nodes();
      // no previous rects = visible area is everything
      if (!previousRects.length) {
        visibleArea = [[xMin, xMax]];
      } else {
        visibleArea = previousRects.map(rect => {
          const selectedRect = select(rect);
          const xStart = parseFloat(selectedRect.attr('x'));
          const xEnd = parseFloat(selectedRect.attr('width')) + xStart;
          return [xStart, xEnd];
        });
      }

      // set up the clipping paths
      // animate by shrinking width to 0 and setting x to the mid point
      let nextVisibleArea;
      if (!segments.length) {
        nextVisibleArea = [[0, 0]];
      } else {
        nextVisibleArea = segments.map(d => {
          const xStart = x(d[0]);
          const xEnd = x(d[d.length - 1]);
          return [xStart, xEnd];
        });
      }

      // compute the start and end x values for a data point based on maximizing visibility
      // around the middle of the rect.
      function visibleStartEnd(d, visibleArea) { // eslint-disable-line no-inner-declarations
        const xStart = x(d[0]);
        const xEnd = x(d[d.length - 1]);
        const xMid = xStart + ((xEnd - xStart) / 2);
        const visArea = visibleArea.find(area => area[0] <= xMid && xMid <= area[1]);

        // set width to overlapping visible area
        if (visArea) {
          return [Math.max(visArea[0], xStart), Math.min(xEnd, visArea[1])];
        }

        // return xEnd - xStart;
        return [xMid, xMid];
      }

      function exitRect(rect) { // eslint-disable-line no-inner-declarations
        rect
          .attr('x', d => visibleStartEnd(d, nextVisibleArea)[0])
          .attr('width', d => {
            const [xStart, xEnd] = visibleStartEnd(d, nextVisibleArea);
            return xEnd - xStart;
          });
      }

      function enterRect(rect) { // eslint-disable-line no-inner-declarations
        rect
          .attr('x', d => visibleStartEnd(d, visibleArea)[0])
          .attr('width', d => {
            const [xStart, xEnd] = visibleStartEnd(d, visibleArea);
            return xEnd - xStart;
          })
          .attr('y', clipRectY)
          .attr('height', clipRectHeight);
      }

      clipPathRects.exit().transition(context).call(exitRect).remove();
      const clipPathRectsEnter = clipPathRects.enter().append('rect').call(enterRect);
      clipPathRects = clipPathRects.merge(clipPathRectsEnter);
      clipPathRects = clipPathRects.transition(context);

      // debug rects should match clipPathRects
      if (debug) {
        debugRects.exit().transition(context).call(exitRect).remove();
        const debugRectsEnter = debugRects.enter().append('rect')
          .style('fill', 'rgba(255, 0, 0, 0.3)')
          .style('stroke', 'rgba(255, 0, 0, 0.6)')
          .call(enterRect);

        debugRects = debugRects.merge(debugRectsEnter);
        debugRects = debugRects.transition(context);
      }

    // not in transition
    } else {
      clipPathRects.exit().remove();
      const clipPathRectsEnter = clipPathRects.enter().append('rect');
      clipPathRects = clipPathRects.merge(clipPathRectsEnter);

      if (debug) {
        debugRects.exit().remove();
        const debugRectsEnter = debugRects.enter().append('rect')
          .style('fill', 'rgba(255, 0, 0, 0.3)')
          .style('stroke', 'rgba(255, 0, 0, 0.6)');
        debugRects = debugRects.merge(debugRectsEnter);
      }
    }

    // after transition, update the clip rect dimensions
    function updateRect(rect) {
      rect.attr('x', d => {
        // if at the edge, adjust for stroke width
        const val = x(d[0]);
        if (val === xMin) {
          return val - strokeWidthClipAdjustment;
        }
        return val;
      })
      .attr('width', d => {
        // if at the edge, adjust for stroke width to prevent clipping it
        let valMin = x(d[0]);
        let valMax = x(d[d.length - 1]);
        if (valMin === xMin) {
          valMin -= strokeWidthClipAdjustment;
        }
        if (valMax === xMax) {
          valMax += strokeWidthClipAdjustment;
        }

        return valMax - valMin;
      })
      .attr('y', clipRectY)
      .attr('height', clipRectHeight);
    }

    clipPathRects.call(updateRect);
    if (debug) {
      debugRects.call(updateRect);
    }
  }

  /**
   * Helper function to draw the actual path
   */
  function renderPath(initialRender, transition, context, root, lineData,
      evaluatedDefinition, line, initialLine, className, clipPathId) {
    let path = root.select(`.${className.split(' ')[0]}`);

    // initial render
    if (path.empty()) {
      path = root.append('path');
    }
    const pathSelection = path;

    if (clipPathId) {
      path.attr('clip-path', `url(#${clipPathId})`);
    }

    // handle animations for initial render
    if (initialRender) {
      path.attr('d', initialLine(lineData));
    }

    // apply user defined styles and attributes
    applyAttrsAndStyles(path, evaluatedDefinition);

    path.classed(className, true);

    // handle transition
    if (transition) {
      path = path.transition(context);
    }

    if (path.attrTween) {
      // use attrTween is available (in transition)
      path.attrTween('d', function dTween() {
        const previous = select(this).attr('d');
        const current = line(lineData);
        return interpolatePath(previous, current);
      });
    } else {
      path.attr('d', () => line(lineData));
    }

    // can't return path since it might have the transition
    return pathSelection;
  }

  /**
   * Helper to get the line functions to use to draw the lines. Possibly
   * updates the line data to be in [x, y] format if extendEnds is true.
   *
   * @return {Object} { line, initialLine, lineData }
   */
  function getLineFunctions(lineData, initialRender, yDomain) { // eslint-disable-line no-unused-vars
    const yMax = yDomain[1];

    // main line function
    let line = d3Line().x(x).y(y).curve(curve);
    let initialLine;

    // if the user specifies to extend ends for the undefined line, add points to the line for them.
    if (extendEnds && lineData.length) {
      // we have to process the data here since we don't know how to format an input object
      // we use the [x, y] format of a data point
      const processedLineData = lineData.map(d => [x(d), y(d)]);
      lineData = [
        [extendEnds[0], processedLineData[0][1]],
        ...processedLineData,
        [extendEnds[1], processedLineData[processedLineData.length - 1][1]],
      ];

      // this line function works on the processed data (default .x and .y read the [x,y] format)
      line = d3Line().curve(curve);
    }

    // handle animations for initial render
    if (initialRender) {
      // have the line load in with a flat y value
      initialLine = line;
      if (transitionInitial) {
        initialLine = d3Line().x(x).y(yMax).curve(curve);

        // if the user extends ends, we should use the line that works on that data
        if (extendEnds) {
          initialLine = d3Line().y(yMax).curve(curve);
        }
      }
    }

    return {
      line,
      initialLine: initialLine || line,
      lineData,
    };
  }

  function initializeClipPath(chunkName, root) {
    if (chunkName === gapChunkName) {
      return undefined;
    }

    let defs = root.select('defs');
    if (defs.empty()) {
      defs = root.append('defs');
    }

    // className = d3-line-chunked-clip-chunkName
    const className = `d3-line-chunked-clip-${chunkName}`;
    let clipPath = defs.select(`.${className}`);

    // initial render
    if (clipPath.empty()) {
      clipPath = defs.append('clipPath')
        .attr('class', className)
        .attr('id', `d3-line-chunked-clip-${chunkName}-${counter++}`);
    }

    return clipPath.attr('id');
  }

  /**
   * Render the lines: circles, paths, clip rects for the given (data, lineIndex)
   */
  function renderLines(initialRender, transition, context, root, data, lineIndex) {
    // use the accessor if provided (e.g. if the data is something like
    // `{ results: [[x,y], [[x,y], ...]}`)
    const lineData = accessData(data);

    // filter to only defined data to plot the lines
    const filteredLineData = lineData.filter(defined);

    // determine the extent of the y values
    const yExtent = extent(filteredLineData.map(d => y(d)));

    // determine the extent of the x values to handle stroke-width adjustments on
    // clipping rects. Do not use extendEnds here since it can clip the line ending
    // in an unnatural way, it's better to just show the end.
    const xExtent = extent(filteredLineData.map(d => x(d)));

    // evaluate attrs and styles for the given dataset
    // pass in the raw data and index for computing attrs and styles if they are functinos
    const evaluatedDefinitions = evaluateDefinitions(data, lineIndex);

    // update line functions and data depending on animation and render circumstances
    const lineResults = getLineFunctions(filteredLineData, initialRender, yExtent);

    // lineData possibly updated if extendEnds is true since we normalize to [x, y] format
    const { line, initialLine, lineData: modifiedLineData } = lineResults;

    // for each chunk type, render a line
    const chunkNames = getChunkNames();

    const definedSegments = computeDefinedSegments(lineData);

    // for each chunk, draw a line, circles and clip rect
    chunkNames.forEach(chunkName => {
      const clipPathId = initializeClipPath(chunkName, root);

      let className = `d3-line-chunked-chunk-${chunkName}`;
      if (chunkName === lineChunkName) {
        className = `d3-line-chunked-defined ${className}`;
      } else if (chunkName === gapChunkName) {
        className = `d3-line-chunked-undefined ${className}`;
      }

      // get the eval defs for this chunk name
      const evaluatedDefinition = evaluatedDefinitions[chunkName];

      const path = renderPath(initialRender, transition, context, root, modifiedLineData,
        evaluatedDefinition, line, initialLine, className, clipPathId);

      if (chunkName !== gapChunkName) {
        // compute the segments and points for this chunk type
        const segments = computeChunkedSegments(chunkName, definedSegments);
        const points = segments.filter(segment => segment.length === 1)
          .map(segment => ({
            // use random ID so they are treated as entering/exiting each time
            id: x(segment[0]),
            data: segment[0],
          }));

        const circlesClassName = className.split(' ').map(name => `${name}-point`).join(' ');
        renderCircles(initialRender, transition, context, root, points,
          evaluatedDefinition, circlesClassName);

        renderClipRects(initialRender, transition, context, root, segments, xExtent,
          yExtent, evaluatedDefinition, path, clipPathId);
      }
    });

    // ensure all circles are at the top
    root.selectAll('circle').raise();
  }

  // the main function that is returned
  function lineChunked(context) {
    if (!context) {
      return;
    }
    const selection = context.selection ? context.selection() : context; // handle transition

    if (!selection || selection.empty()) {
      return;
    }

    let transition = false;
    if (selection !== context) {
      transition = true;
    }

    selection.each(function each(data, lineIndex) {
      const root = select(this);

      const initialRender = root.select('.d3-line-chunked-defined').empty();
      renderLines(initialRender, transition, context, root, data, lineIndex);
    });

    // provide warning about wrong attr/defs
    validateChunkDefinitions();
  }

  // ------------------------------------------------
  // Define getters and setters
  // ------------------------------------------------
  function getterSetter({ get, set, setType, asConstant }) {
    return function getSet(newValue) {
      if (arguments.length) {
        // main setter if setType matches newValue type
        if ((!setType && newValue != null) || (setType && typeof newValue === setType)) {
          set(newValue);

        // setter to constant function if provided
        } else if (asConstant && newValue != null) {
          set(asConstant(newValue));
        }

        return lineChunked;
      }

      // otherwise ignore value/no value provided, so use getter
      return get();
    };
  }

  // define `x([x])`
  lineChunked.x = getterSetter({
    get: () => x,
    set: (newValue) => { x = newValue; },
    setType: 'function',
    asConstant: (newValue) => () => +newValue, // d3 v4 uses +, so we do too
  });

  // define `y([y])`
  lineChunked.y = getterSetter({
    get: () => y,
    set: (newValue) => { y = newValue; },
    setType: 'function',
    asConstant: (newValue) => () => +newValue,
  });

  // define `defined([defined])`
  lineChunked.defined = getterSetter({
    get: () => defined,
    set: (newValue) => { defined = newValue; },
    setType: 'function',
    asConstant: (newValue) => () => !!newValue,
  });

  // define `isNext([isNext])`
  lineChunked.isNext = getterSetter({
    get: () => isNext,
    set: (newValue) => { isNext = newValue; },
    setType: 'function',
    asConstant: (newValue) => () => !!newValue,
  });

  // define `chunk([chunk])`
  lineChunked.chunk = getterSetter({
    get: () => chunk,
    set: (newValue) => { chunk = newValue; },
    setType: 'function',
    asConstant: (newValue) => () => newValue,
  });

  // define `chunkLineResolver([chunkLineResolver])`
  lineChunked.chunkLineResolver = getterSetter({
    get: () => chunkLineResolver,
    set: (newValue) => { chunkLineResolver = newValue; },
    setType: 'function',
  });

  // define `chunkDefinitions([chunkDefinitions])`
  lineChunked.chunkDefinitions = getterSetter({
    get: () => chunkDefinitions,
    set: (newValue) => { chunkDefinitions = newValue; },
    setType: 'object',
  });

  // define `curve([curve])`
  lineChunked.curve = getterSetter({
    get: () => curve,
    set: (newValue) => { curve = newValue; },
    setType: 'function',
  });

  // define `lineStyles([lineStyles])`
  lineChunked.lineStyles = getterSetter({
    get: () => lineStyles,
    set: (newValue) => { lineStyles = newValue; },
    setType: 'object',
  });

  // define `gapStyles([gapStyles])`
  lineChunked.gapStyles = getterSetter({
    get: () => gapStyles,
    set: (newValue) => { gapStyles = newValue; },
    setType: 'object',
  });

  // define `pointStyles([pointStyles])`
  lineChunked.pointStyles = getterSetter({
    get: () => pointStyles,
    set: (newValue) => { pointStyles = newValue; },
    setType: 'object',
  });

  // define `lineAttrs([lineAttrs])`
  lineChunked.lineAttrs = getterSetter({
    get: () => lineAttrs,
    set: (newValue) => { lineAttrs = newValue; },
    setType: 'object',
  });

  // define `gapAttrs([gapAttrs])`
  lineChunked.gapAttrs = getterSetter({
    get: () => gapAttrs,
    set: (newValue) => { gapAttrs = newValue; },
    setType: 'object',
  });

  // define `pointAttrs([pointAttrs])`
  lineChunked.pointAttrs = getterSetter({
    get: () => pointAttrs,
    set: (newValue) => { pointAttrs = newValue; },
    setType: 'object',
  });

  // define `transitionInitial([transitionInitial])`
  lineChunked.transitionInitial = getterSetter({
    get: () => transitionInitial,
    set: (newValue) => { transitionInitial = newValue; },
    setType: 'boolean',
  });

  // define `extendEnds([extendEnds])`
  lineChunked.extendEnds = getterSetter({
    get: () => extendEnds,
    set: (newValue) => { extendEnds = newValue; },
    setType: 'object', // should be an array
  });

  // define `accessData([accessData])`
  lineChunked.accessData = getterSetter({
    get: () => accessData,
    set: (newValue) => { accessData = newValue; },
    setType: 'function',
    asConstant: (newValue) => d => d[newValue],
  });


  // define `debug([debug])`
  lineChunked.debug = getterSetter({
    get: () => debug,
    set: (newValue) => { debug = newValue; },
    setType: 'boolean',
  });

  return lineChunked;
}

