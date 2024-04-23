import React, { useState, useEffect } from 'react';
import './EmbeddingView.css';
import { Button } from 'antd';
import Chart from './Chart';
import { env } from './constants';

const EmbeddingView = ({ run, r, updateShowGroup, updateFilter, resetFilter, showGroup, filters }) => {
  const [x1, setX1] = useState(null);
  const [x2, setX2] = useState(null);
  const [y1, setY1] = useState(null);
  const [y2, setY2] = useState(null);
  const [keepFilter, setKeepFilter] = useState(false);
  const [xMin, setXMin] = useState(null);
  const [xMax, setXMax] = useState(null);
  const [yMin, setYMin] = useState(null);
  const [yMax, setYMax] = useState(null);

  useEffect(() => {
    setX1(null);
    setX2(null);
    setY1(null);
    setY2(null);
    setKeepFilter(false);
  }, [run, r]);

  let spec, parallel_coor_spec, pie_spec;

  spec = {
    "data": {
      "url": "http://localhost:3000/logs/embedding_" + env + ".json"
    },
    "mark": {"type": "point", "filled": true, "size": 10},
    "width": 380,
    "height": 380,
    "params": [
      { "name": "brush", "select": { "type": "interval", "encodings": ["x", "y"], "resolve": "global" } }
    ],
    "encoding": {
      "x": { "field": "x", "type": "quantitative", "title": "Environment", "axis": { "ticks": false, "labels": false } },
      "y": { "field": "y", "type": "quantitative", "title": "Agent", "axis": { "ticks": false, "labels": false } },
      "tooltip": [
        { "field": "key", "title": "run" },
        { "field": "r", "title": "r" },
      ],
    }
  };

  parallel_coor_spec = {
    "data": {
      "url": "http://localhost:3000/logs/embedding_" + env + ".json"
    },
    "width": 380,
    "height": 160,
    "transform": [
      { "filter": "datum['x']>=" + x1 + " && datum['x']<=" + x2 + " && datum['y']>=" + y1 + " && datum['y']<=" + y2 },
      { "window": [{ "op": "count", "as": "index" }] },
      { "fold": ["w1", "w2", "w3"] },
      {
        "joinaggregate": [
          { "op": "min", "field": "value", "as": "min" },
          { "op": "max", "field": "value", "as": "max" }
        ],
        "groupby": ["key"]
      },
      {
        "calculate": "datum.value",
        "as": "norm_val"
      }
    ],
    "layer": [{
      "mark": { "type": "rule", "color": "#ccc" },
      "encoding": { "x": { "field": "key" } }
    }, {
      "mark": "line",
      "encoding": {
        "detail": { "type": "nominal", "field": "index" },
        "opacity": { "value": 0.5 },
        "x": { "type": "nominal", "field": "key" },
        "y": { "type": "quantitative", "field": "norm_val", "scale": { "domain": [0.0, 1.0] }, "axis": null },
        "tooltip": [{
          "type": "quantitative",
          "field": "run"
        }, {
          "type": "quantitative",
          "field": "r"
        }],
      }
    }],
    "config": {
      "axisX": { "domain": false, "labelAngle": 0, "tickColor": "#ccc", "title": null },
      "style": {
        "label": { "baseline": "middle", "align": "right", "dx": -5 },
        "tick": { "orient": "horizontal" }
      }
    }
  };

  if (keepFilter) {
    if (xMin !== null && xMax !== null && yMin !== null && yMax !== null) {
      spec.transform = [
        { filter: `datum.x >= ${xMin}` },
        { filter: `datum.x <= ${xMax}` },
        { filter: `datum.y >= ${yMin}` },
        { filter: `datum.y <= ${yMax}` }
      ];
    }
  } else if (x1 !== null && x2 !== null && y1 !== null && y2 !== null) {
    spec.transform = [
      { filter: `datum.x >= ${x1}` },
      { filter: `datum.x <= ${x2}` },
      { filter: `datum.y >= ${y1}` },
      { filter: `datum.y <= ${y2}` }
    ];
  }

  // Iterate through filters
  for (let i = 0; i < filters.length; i++) {
    spec.transform.push({ filter: filters[i] });
  }

  const handleSignals = (...args) => {
    updateShowGroup(true);
    const x1 = args[1]['x'][0];
    const x2 = args[1]['x'][1];
    const y1 = args[1]['y'][0];
    const y2 = args[1]['y'][1];
    setX1(x1);
    setX2(x2);
    setY1(y1);
    setY2(y2);
  };

  const analyze = () => {
    setKeepFilter(true);
    updateFilter(x1, x2, y1, y2);
  };

  const filter = () => {
    setKeepFilter(false);
    setXMin(x1);
    setXMax(x2);
    setYMin(y1);
    setYMax(y2);
    updateFilter(x1, x2, y1, y2);
  };

  const reset = () => {
    setKeepFilter(false);
    setXMin(null);
    setXMax(null);
    setYMin(null);
    setYMax(null);
    resetFilter();
  };

  let reward_chart = (
    <div style={{ marginLeft: 100 }}>
      <Chart spec={JSON.stringify(pie_spec)} />
    </div>
  );

  if (showGroup) {
    reward_chart = <Chart spec={JSON.stringify(parallel_coor_spec)} handleSignals={handleSignals} />;
  }

  return (
    <div id='reward' className='pane'>
      <div className='header'>Embedding View</div>
      <div style={{ width: 420 }}>
        <div style={{ height: 5 }} />
        <div style={{ marginLeft: 5, fontSize: 16 }}>Behavior embedding</div>
        <Chart spec={JSON.stringify(spec)} handleSignals={handleSignals} />
        <Button style={{ width: 380, marginLeft: 5 }} onClick={analyze}>Analyze</Button>
        <div style={{ height: 5 }} />
        <Button style={{ width: 380, marginLeft: 5 }} onClick={filter}>Filter</Button>
        <div style={{ height: 5 }} />
        <Button style={{ width: 380, marginLeft: 5 }} onClick={reset}>Reset</Button>

        <div style={{ height: 20 }} />

      </div>
    </div>
  );
};

export default EmbeddingView;
