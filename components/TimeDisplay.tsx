// client/components/TimeDisplay.tsx
import React, { useEffect, useState } from 'react';

interface TimeDisplayProps {
  timestamp: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ timestamp }) => {
  const [formattedTime, setFormattedTime] = useState<string>(timestamp);

  useEffect(() => {
    // When on the client, update the formatted time
    setFormattedTime(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);

  return <span suppressHydrationWarning>{formattedTime}</span>;
};

export default TimeDisplay;
