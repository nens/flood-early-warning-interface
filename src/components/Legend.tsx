import cssStyles from "./Legend.module.css";

interface LegendProps {
  steps: [string, string][];
}

function hexToR(h: string) {
  return parseInt(cutHex(h).substring(0, 2), 16);
}
function hexToG(h: string) {
  return parseInt(cutHex(h).substring(2, 4), 16);
}
function hexToB(h: string) {
  return parseInt(cutHex(h).substring(4, 6), 16);
}
function cutHex(h: string) {
  return h.charAt(0) === "#" ? h.substring(1, 7) : h;
}

function getCorrectTextColor(hex: string) {
  let threshold = 130;
  // ^^ About half of 256. Lower threshold equals more dark text on dark background

  let hRed = hexToR(hex);
  let hGreen = hexToG(hex);
  let hBlue = hexToB(hex);

  let cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;
  if (cBrightness > threshold) {
    return "#000000";
  } else {
    return "#ffffff";
  }
}

function Legend({ steps }: LegendProps) {
  return (
    <div className={cssStyles.Legend}>
      <span className={cssStyles.LegendTitle}>Legend</span>
      <ul className={cssStyles.LegendUl}>
        {steps.map(([value, color], idx) => (
          <li
            className={cssStyles.LegendStep}
            key={`${color}${idx}`}
            style={{
              background: color,
              color: getCorrectTextColor(color),
            }}
          >
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Legend;
