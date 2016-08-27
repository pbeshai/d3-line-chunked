import { extent } from 'd3-array';
import { select } from 'd3-selection';
import { curveLinear, line as d3Line } from 'd3-shape';
import { interpolatePath } from 'd3-interpolate-path'; // only needed if using transitions

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
    'stroke-opacity': 0.2,
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
  function renderCircles(initialRender, context, selection, points) {
    let circles = selection.selectAll('circle').data(points, d => d.id);

    // EXIT
    if (context !== selection) {
      const duration = context.duration();

      circles.exit()
        .transition()
        .duration(duration * 0.05)
        .attr('r', 1e-6)
        .remove();
    } else {
      circles.exit().remove();
    }

    // ENTER
    const circlesEnter = circles.enter().append('circle');

    // apply user-provided attrs, using attributes from current line if not provided
    const combinedAttrs = Object.assign({
      fill: lineAttrs.stroke,
      r: lineAttrs['stroke-width'] == null ? undefined : parseFloat(lineAttrs['stroke-width']) + 1,
    }, pointAttrs);
    Object.keys(combinedAttrs).forEach(key => {
      circlesEnter.attr(key, combinedAttrs[key]);
    });
    // ensure `r` is a number (helps to remove 'px' if provided)
    combinedAttrs.r = parseFloat(combinedAttrs.r);

    // apply user-provided styles, using attributes from current line if not provided
    const combinedStyles = Object.assign(pointAttrs.fill == null ? { fill: lineStyles.stroke } : {},
      pointStyles);
    Object.keys(combinedStyles).forEach(key => {
      circlesEnter.style(key, combinedStyles[key]);
    });

    circlesEnter
      .classed('d3-line-chunked-defined-point', true)
      .attr('r', 1e-6) // overrides provided `r value for now
      .attr('cx', d => x(d.data))
      .attr('cy', d => y(d.data));


    // handle with transition
    if ((!initialRender || (initialRender && transitionInitial)) && context !== selection) {
      const duration = context.duration();
      const enterDuration = duration * 0.15;
      // delay sizing up the radius until after the line transition
      circlesEnter
        .transition(context)
        .delay(duration - enterDuration)
        .duration(enterDuration)
        .attr('r', combinedAttrs.r);
    } else {
      circlesEnter.attr('r', combinedAttrs.r);
    }


    // UPDATE
    if (context !== selection) {
      circles = circles.transition(context);
    }
    circles.attr('r', combinedAttrs.r)
      .attr('cx', d => x(d.data))
      .attr('cy', d => y(d.data));
  }

  /**
   * Render the paths for segments and gaps
   */
  function renderPaths(initialRender, context, selection, lineData, segments, [yMin, yMax]) {
    let definedPath = selection.select('.d3-line-chunked-defined');
    let undefinedPath = selection.select('.d3-line-chunked-undefined');

    const clipPathId = 'my-clip-path'; // TODO: dynamic
    let clipPath = selection.select('clipPath');

    // main line function
    const line = d3Line().x(x).y(y).curve(curve);

    // initial render
    if (definedPath.empty()) {
      definedPath = selection.append('path');
      undefinedPath = selection.append('path');
      clipPath = selection.append('defs')
        .append('clipPath')
        .attr('id', clipPathId);
    }

    definedPath.attr('clip-path', `url(#${clipPathId})`);

    // update attached data
    definedPath.datum(lineData);
    undefinedPath.datum(lineData);
    let clipPathRects = clipPath.selectAll('rect').data(segments);


    // set up the clipping paths
    clipPathRects.exit().remove();
    const clipPathRectsEnter = clipPathRects.enter().append('rect')
      .attr('x', d => x(d[0]))
      .attr('width', 0)
      .attr('y', yMin)
      .attr('height', yMax);

    // on initial load, have the width already at max and the line already at full width
    if (initialRender) {
      clipPathRectsEnter
        .attr('width', d => x(d[d.length - 1]) - x(d[0]));

      // have the line load in with a flat y value
      let initialLine = line;
      if (transitionInitial) {
        initialLine = d3Line().x(x).y(yMax).curve(curve);
      }
      definedPath.attr('d', initialLine);
      undefinedPath.attr('d', initialLine);
    }


    // apply user-provided attrs and styles
    Object.keys(lineAttrs).forEach(key => {
      definedPath.attr(key, lineAttrs[key]);
      undefinedPath.attr(key, lineAttrs[key]);
    });
    Object.keys(lineStyles).forEach(key => {
      definedPath.style(key, lineStyles[key]);
      undefinedPath.style(key, lineStyles[key]);
    });
    definedPath.classed('d3-line-chunked-defined', true);

    // overwrite with gap styles and attributes
    Object.keys(gapAttrs).forEach(key => {
      undefinedPath.attr(key, gapAttrs[key]);
    });
    Object.keys(gapStyles).forEach(key => {
      undefinedPath.style(key, gapStyles[key]);
    });
    undefinedPath.classed('d3-line-chunked-undefined', true);

    // merge in updating rects with entering
    clipPathRects = clipPathRects.merge(clipPathRectsEnter);

    // handle transition
    if (context !== selection) {
      definedPath = definedPath.transition(context);
      undefinedPath = undefinedPath.transition(context);
      clipPathRects = clipPathRects.transition(context);
    }

    // after transition, update the clip rect dimensions
    clipPathRects
      .attr('x', d => x(d[0]))
      .attr('width', d => x(d[d.length - 1]) - x(d[0]))
      .attr('y', yMin)
      .attr('height', yMax);


    // update the `d` attribute
    function dTween(d) {
      const previous = select(this).attr('d');
      const current = line(d);
      return interpolatePath(previous, current);
    }

    if (definedPath.attrTween) {
      // use attrTween is available (in transition)
      definedPath.attrTween('d', dTween);
      undefinedPath.attrTween('d', dTween);
    } else {
      definedPath.attr('d', d => line(d));
      undefinedPath.attr('d', d => line(d));
    }
  }

  // the main function that is returned
  function lineChunked(context) {
    const selection = context.selection ? context.selection() : context; // handle transition

    const lineData = selection.datum();
    const segments = computeSegments(lineData);
    const points = segments.filter(segment => segment.length === 1)
      .map(segment => ({
        // use random ID so they are treated as entering/exiting each time
        id: Math.random(),
        data: segment[0],
      }));

    // filter to only defined data to plot the lines
    const filteredLineData = lineData.filter(defined);

    // determine the extent of the y values
    const yExtent = extent(filteredLineData.map(d => y(d)));

    const initialRender = selection.select('.d3-line-chunked-defined').empty();
    renderCircles(initialRender, context, selection, points);
    renderPaths(initialRender, context, selection, filteredLineData, segments, yExtent);
  }

  // ------------------------------------------------
  // Define getters and setters
  // ------------------------------------------------
  function getterSetter({ get, set, setType, asConstant }) {
    return function getSet(newValue) {
      // main setter if setType matches newValue type
      if ((!setType && newValue != null) || (setType && typeof newValue === setType)) {
        set(newValue);
        return lineChunked;

      // setter to constant function if provided
      } else if (asConstant && newValue != null) {
        set(asConstant(newValue));
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

  return lineChunked;
}

