/*

TODO

- refactor renderPoints and renderPaths
- refactor computeSegments and gapsAndSegments
- use attrs for defaults
- add styling support to points
- write tests


*/

import { select } from 'd3-selection';
import { curveLinear, line as d3Line } from 'd3-shape';
import { interpolatePath } from 'd3-interpolate-path'; // only needed if using transitions
/**
 * Renders line with potential gaps in data as a series of <path> segments
 * segments and gaps can be styled separately
 * points (segments of length 1) can be styled separately
 *
 * transitions supported.
 */

function computeSegments(lineData) {
  let startNewSegment = true;

  // we expect x to increment by this amount. if it does not,
  // then data is missing.
  function isExpectedNext(previousDatum, currentDatum) {
    const expectedXIncrement = 1;
    return (currentDatum.x === previousDatum.x + expectedXIncrement);
  }

  // split into segments of continuous data
  const segments = lineData.reduce((segments, d) => {
    // skip if this point has no data
    if (d.y == null) {
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
      if (isExpectedNext(lastDatum, d)) {
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


function gapsAndSegments(segments) {
  // TODO: handle start and end gaps

  const combined = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const currSegment = segments[i];
    const nextSegment = segments[i + 1];

    const gap = [currSegment[currSegment.length - 1], nextSegment[0]];
    combined.push({ type: 'segment', data: currSegment });
    combined.push({ type: 'gap', data: gap });
  }
  combined.push({ type: 'segment', data: segments[segments.length - 1] });

  return combined;
}

export default function () {
  const defaultLineAttrs = {
    class: 'chunk-segment',
    fill: 'none',
    stroke: '#222',
    'stroke-width': '1.5px',
    'stroke-opacity': 1,
  };
  const defaultGapAttrs = {
    class: 'chunk-gap',
    'stroke-dasharray': '2 2',
    'stroke-opacity': 0.2,
  };
  const defaultPointAttrs = {
    class: 'chunk-defined-point',
    // read fill and r at render time in case the lineAttrs changed
    // fill: defaultLineAttrs.stroke,
    // r: defaultLineAttrs['stroke-width'],
  };

  let x = d => d[0];
  let y = d => d[1];
  let defined = () => true;
  let curve = curveLinear;
  let lineStyles = {};
  let lineAttrs = defaultLineAttrs;
  let gapStyles = {};
  let gapAttrs = defaultGapAttrs;
  let pointStyles = {};
  let pointAttrs = defaultPointAttrs;

  /**
   * Render the points for when segments have length 1.
   */
  function renderCircles(context, selection, points) {
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
      r: lineAttrs['stroke-width'],
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
      .attr('r', 1e-6) // overrides provided `r value for now
      .attr('cx', d => x(d.data))
      .attr('cy', d => y(d.data));


    // handle with transition
    if (context !== selection) {
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
   * Helper function to merge objects defining attributes or styles
   * for lines and gaps.
   * @param {Object} paths d3 selection of paths to apply to
   * @param {String} type `attr` or `style` - how to apply these
   * @param {Object} line
   * @param {Object} gap
   * @return {Object} The merged object that switches based on d.type
   */
  function mergeAndApply(paths, type, lineObj, gapObj) {
    // apply user-provided styles
    const lineKeys = Object.keys(lineObj);
    const gapKeys = Object.keys(gapObj);
    const combinedKeys = lineKeys.concat(gapKeys.filter(key => !lineKeys.includes(key)));

    combinedKeys.forEach(key => {
      const lineValue = lineObj[key];
      const gapValue = gapObj[key] == null ? lineValue : gapObj[key];

      paths[type](key, d => (d.type === 'segment' ? lineValue : gapValue));
    });
  }

  /**
   * Render the paths for segments and gaps
   */
  function renderPaths(context, selection, segmentsAndGaps) {
    let paths = selection.selectAll('path').data(segmentsAndGaps);

    // EXIT
    paths.exit().remove();

    // ENTER
    paths = paths.merge(paths.enter().append('path'));

    // ENTER + UPDATE - paths
    // apply user-provided attrs and styles
    mergeAndApply(paths, 'attr', lineAttrs, gapAttrs);
    mergeAndApply(paths, 'style', lineStyles, gapStyles);

    // handle transition
    if (context !== selection) {
      paths = paths.transition(context);
    }

    // update the `d` attribute
    const line = d3Line().x(x).y(y).curve(curve);
    if (paths.attrTween) {
      // use attrTween is available (in transition)
      paths.attrTween('d', function dTween(d) {
        const previous = select(this).attr('d');
        const current = line(d.data);
        return interpolatePath(previous, current);
      });
    } else {
      paths.attr('d', d => line(d.data));
    }
  }

  // the main function that is returned
  function lineChunked(context) {
    const selection = context.selection ? context.selection() : context; // handle transition

    const lineData = selection.datum();
    const segments = computeSegments(lineData);
    const segmentsAndGaps = gapsAndSegments(segments);
    const points = segments.filter(segment => segment.length === 1)
      .map(segment => ({
        // use the position as the ID so we can have proper transitions
        id: segmentsAndGaps.findIndex(d => d.data === segment),
        data: segment[0],
      }));

    renderCircles(context, selection, points);
    renderPaths(context, selection, segmentsAndGaps);
  }

  // ------------------------------------------------
  // Define getters and setters
  // ------------------------------------------------
  function getterSetter({ get, set, setType, asConstant }) {
    return function getSet(newValue) {
      // main setter if setType matches newValue type
      if (typeof newValue === setType) {
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

  return lineChunked;
}

