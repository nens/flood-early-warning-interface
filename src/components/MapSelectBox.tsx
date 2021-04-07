import styles from './MapSelectBox.module.css';

interface MapSelectBoxProps {
  options: [string, string][];
  currentValue: string | null;
  setValue: (value: string) => void;
}

function MapSelectBox({ options, currentValue, setValue }: MapSelectBoxProps) {
  return (
    <select
      name="mapSelectBox"
      onChange={(e) => setValue(e.target.value)}
      className={styles.MapSelectBox}
      value={currentValue || undefined}
    >
      {options.map((option) => (
        <option key={option[0]} value={option[0]}>
          {option[1]}
        </option>
      ))}
    </select>
  );
}

export default MapSelectBox;
