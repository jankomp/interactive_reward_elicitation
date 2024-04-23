import React from 'react';
import { Vega } from 'react-vega';

const Chart = ({ spec, handleSignals }) => {
  const parsedSpec = JSON.parse(spec);

  return (
    <div>
      <Vega spec={parsedSpec} actions={false} signalListeners={{ "brush": handleSignals }} />
    </div>
  );
};

export default Chart;
