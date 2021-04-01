import React from 'react';

interface TriggerHeaderProps {
  level: string;
}

function TriggerHeader({ level }: TriggerHeaderProps) {
  const color = `var(--trigger-${level.toLowerCase()})`;
  return (
    <span style={{fontStyle: "italic"}}>{level}&nbsp;<span style={{color}}>&#x25cf;</span></span>
  );
}

export default TriggerHeader;
