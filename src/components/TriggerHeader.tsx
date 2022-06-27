interface TriggerHeaderProps {
  level: string;
  configColor?: string;
}

function TriggerHeader({ level, configColor }: TriggerHeaderProps) {
  const color = `var(--trigger-${level.toLowerCase()})`;

  return (
    <span style={{ fontStyle: "italic" }}>
      {level}&nbsp;
      <span
        style={{
          color: configColor ?? color,
          background: level.toLowerCase() === "white" ? "var(--primary-color)" : undefined,
        }}
      >
        &#x25cf;
      </span>
    </span>
  );
}

export default TriggerHeader;
