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
   * Helper function to compute the contiguous segments of the data
   * @param {Array} lineData the line data
   * @return {Array} An array of segments (subarrays) of the line data
   */
  function computeSegments(lineData) {
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
   * Render the points for when segments have length 1.
   */
  function renderCircles(initialRender, transition, context, root, points, evaluatedAttrs,
      evaluatedStyles) {
    let circles = root.selectAll('circle').data(points, d => d.id);

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
    const combinedAttrs = Object.assign({
      fill: evaluatedAttrs.line.stroke,
      r: evaluatedAttrs.line['stroke-width'] == null ? undefined :
        parseFloat(evaluatedAttrs.line['stroke-width']) + 1,
    }, evaluatedAttrs.point);
    Object.keys(combinedAttrs).forEach(key => {
      circlesEnter.attr(key, combinedAttrs[key]);
    });
    // ensure `r` is a number (helps to remove 'px' if provided)
    combinedAttrs.r = parseFloat(combinedAttrs.r);

    // apply user-provided styles, using attributes from current line if not provided
    const combinedStyles = Object.assign(evaluatedAttrs.point.fill == null ?
        { fill: evaluatedStyles.line.stroke } : {},
      evaluatedStyles.point);
    Object.keys(combinedStyles).forEach(key => {
      circlesEnter.style(key, combinedStyles[key]);
    });

    circlesEnter
      .classed('d3-line-chunked-defined-point', true)
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
        .attr('r', combinedAttrs.r);
    } else {
      circlesEnter.attr('r', combinedAttrs.r);
    }


    // UPDATE
    if (transition) {
      circles = circles.transition(context);
    }
    circles.attr('r', combinedAttrs.r)
      .attr('cx', d => x(d.data))
      .attr('cy', d => y(d.data));
  }

  function getClipPathId(increment) {
    const id = `d3-line-chunked-clip-path-${counter}`;
    if (increment) {
      counter += 1;
    }

    return id;
  }

  function renderClipRects(initialRender, transition, context, root, lineData,
      segments, [xMin, xMax], [yMin, yMax], evaluatedAttrs, evaluatedStyles) {
    const clipPathId = getClipPathId(true);
    let clipPath = root.select('clipPath');
    let gDebug = root.select('.d3-line-chunked-debug');

    // set up debug group
    if (debug && gDebug.empty()) {
      gDebug = root.append('g').classed('d3-line-chunked-debug', true);
    } else if (!debug && !gDebug.empty()) {
      gDebug.remove();
    }

    // initial render
    if (clipPath.empty()) {
      clipPath = root.append('defs')
        .append('clipPath')
        .attr('id', clipPathId);
    } else {
      clipPath.attr('id', clipPathId);
    }

    let clipPathRects = clipPath.selectAll('rect').data(segments);
    let debugRects;
    if (debug) {
      debugRects = gDebug.selectAll('rect').data(segments);
    }

    // get stroke width to avoid having the clip rects clip the stroke
    // See https://github.com/pbeshai/d3-line-chunked/issues/2
    const strokeWidth = parseFloat(evaluatedStyles.line['stroke-width']
      || root.select('.d3-line-chunked-defined').style('stroke-width')
      || evaluatedAttrs.line['stroke-width']);
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
   * Helper function that applies attrs and styles to the specified path based on
   * the types provided.
   *
   * @param {Object} path The d3 selected path
   * @param {Object} evaluatedAttrs The evaluated attributes obj (output from evaluate())
   * @param {Object} evaluatedStyles The evaluated styles obj (output from evaluate())
   * @param {String[]} types The types of attrs/styles to apply to the path. Should
   *   correspond to keys within evaluatedAttrs/Styles (e.g., ['line', 'gap']).
   * @return {void}
   */
  function applyAttrsAndStyles(path, evaluatedAttrs, evaluatedStyles, types) {
    types.forEach((type) => {
      // apply user-provided attrs
      Object.keys(evaluatedAttrs[type]).forEach((attr) => {
        path.attr(attr, evaluatedAttrs[type][attr]);
      });

      // apply user-provided styles
      Object.keys(evaluatedStyles[type]).forEach((style) => {
        path.style(style, evaluatedStyles[type][style]);
      });
    });
  }

  /**
   * Helper function to draw the actual path
   */
  function renderPath(initialRender, transition, context, root, lineData,
      segments, evaluatedAttrs, evaluatedStyles, line, initialLine, className,
      applyTypes, clipPathId) {
    let path = root.select(`.${className}`);

    // initial render
    if (path.empty()) {
      path = root.append('path');
    }

    if (clipPathId) {
      path.attr('clip-path', `url(#${getClipPathId(false)})`);
    }

    // handle animations for initial render
    if (initialRender) {
      path.attr('d', initialLine(lineData));
    }

    // apply user defined styles and attributes
    applyAttrsAndStyles(path, evaluatedAttrs, evaluatedStyles, applyTypes);

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
  }

  /**
   * Helper to get the line functions to use to draw the lines. Possibly
   * updates the line data to be in [x, y] format if extendEnds is true.
   *
   * @return {Object} { line, initialLine, lineData }
   */
  function getLineFunctions(lineData, initialRender, [yMin, yMax]) { // eslint-disable-line no-unused-vars
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

  /**
   * Render the paths for segments and gaps
   */
  function renderPaths(initialRender, transition, context, root, lineData,
      segments, xDomain, yDomain, evaluatedAttrs, evaluatedStyles) {
    // update line functions and data depending on animation and render circumstances
    const lineResults = getLineFunctions(lineData, initialRender, yDomain);
    const { line, initialLine } = lineResults;

    // possibly updated if extendEnds is true since we normalize to [x, y] format
    lineData = lineResults.lineData;

    renderPath(initialRender, transition, context, root, lineData,
      segments, evaluatedAttrs, evaluatedStyles, line, initialLine,
      'd3-line-chunked-defined', ['line'], getClipPathId(false));

    renderPath(initialRender, transition, context, root, lineData,
      segments, evaluatedAttrs, evaluatedStyles, line, initialLine,
      'd3-line-chunked-undefined', ['line', 'gap']);
  }

  /**
   * Helper function to process any attrs or styles passed in as functions
   * using the provided `d` and `i`
   *
   * @param {Object} lineInput lineAttrs or lineStyles
   * @param {Object} gapInput gapAttrs or gapStyles
   * @param {Object} pointInput pointAttrs or pointStyles
   * @param {Object|Array} d the input data
   * @param {Number} i the index for this dataset
   * @return {Object} { line, gap, point }
   */
  function evaluate(lineInput, gapInput, pointInput, d, i) {
    function evalInput(input) {
      return Object.keys(input).reduce((output, key) => {
        let val = input[key];

        if (typeof val === 'function') {
          val = val(d, i);
        }

        output[key] = val;
        return output;
      }, {});
    }

    return {
      line: evalInput(lineInput),
      gap: evalInput(gapInput),
      point: evalInput(pointInput),
    };
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

      // use the accessor if provided (e.g. if the data is something like
      // `{ results: [[x,y], [[x,y], ...]}`)
      const lineData = accessData(data);

      const segments = computeSegments(lineData);
      const points = segments.filter(segment => segment.length === 1)
        .map(segment => ({
          // use random ID so they are treated as entering/exiting each time
          id: x(segment[0]),
          data: segment[0],
        }));

      // filter to only defined data to plot the lines
      const filteredLineData = lineData.filter(defined);

      // determine the extent of the y values
      const yExtent = extent(filteredLineData.map(d => y(d)));

      // determine the extent of the x values to handle stroke-width adjustments on
      // clipping rects. Do not use extendEnds here since it can clip the line ending
      // in an unnatural way, it's better to just show the end.
      const xExtent = extent(filteredLineData.map(d => x(d)));

      // evaluate attrs and styles for the given dataset
      const evaluatedAttrs = evaluate(lineAttrs, gapAttrs, pointAttrs, data, lineIndex);
      const evaluatedStyles = evaluate(lineStyles, gapStyles, pointStyles, data, lineIndex);

      const initialRender = root.select('.d3-line-chunked-defined').empty();
       // pass in the raw data and index for computing attrs and styles if they are functinos
      renderCircles(initialRender, transition, context, root, points,
        evaluatedAttrs, evaluatedStyles);
      renderPaths(initialRender, transition, context, root, filteredLineData, segments,
        xExtent, yExtent, evaluatedAttrs, evaluatedStyles);
      renderClipRects(initialRender, transition, context, root, filteredLineData, segments,
        xExtent, yExtent, evaluatedAttrs, evaluatedStyles);
    });
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

