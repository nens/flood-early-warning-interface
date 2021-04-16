// Get legend from Lizard and render it

import { useLegend } from '../api/hooks';

import Legend from './Legend';

interface LizardRasterLegendProps {
  url: string;
  layer: string;
  styles: string;
}

function LizardRasterLegend({ url, layer, styles }: LizardRasterLegendProps) {
  const legend = useLegend(url, layer, styles);

  if (legend === null) return null;

  const steps = legend.slice(0).reverse().map(
    ({value, color}, idx) => [
      idx === 0 ? `> ${value}m` : `${Math.round(value*10)/10}m`,
      color
    ] as [string, string]
  );

  return <Legend steps={steps}/>;
}

export default LizardRasterLegend;
