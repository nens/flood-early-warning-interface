import styles from "./MapSelectBox.module.css";

interface MapMultipleSelectBoxProps {
  title: string;
  options: [string, string][];
  currentValues: string[];
  setValues: React.Dispatch<React.SetStateAction<string[]>>;
}

function MapMultipleSelectBox({ title, options, currentValues, setValues }: MapMultipleSelectBoxProps) {
  return (
    <select
      name="mapMultipleSelectBox"
      className={styles.MapSelectBox}
      onChange={e => setValues(values => {
        // Remove the value from the list if it has already been selected
				if (values.includes(e.target.value)) {
					return values.filter(value => value !== e.target.value)
				};
        // Add new value to the list of currentValues
				return Array.from(new Set(values.concat(e.target.value)));
			})}
    >
      {options.map((option) => (
        <option key={option[0]} value={option[0]}>
          {option[1]}
          {" "}
          {option[1] !== title && currentValues.includes(option[1]) ? "✔" : null}
        </option>
      ))}
    </select>
  );
}

export default MapMultipleSelectBox;
