import { useCallback, useState } from "react";

const BROWSER_OFFSET_HOURS = new Date().getTimezoneOffset() / 60;

interface DateTimeInputProps {
  setConfirmedDate: (d: Date) => void;
}

function getDateAndTimeStrings(
  dateTime: Date,
  browserOffset: boolean
): [string, string] {
  // Takes a UTC dateTime string like "2019-03-21T10:58Z" and an
  // offset in hours like 1. Returns a date and time in the timezone
  // with that offset representing the same time.
  const utcTimestamp = new Date(dateTime).getTime();
  const withOffset = utcTimestamp - 3600000 * (
    browserOffset ? BROWSER_OFFSET_HOURS : 0);

  const offsetDate = new Date(withOffset);

  const iso = offsetDate.toISOString();
  return [iso.slice(0, 10), iso.slice(11, 16)];
}

function DateTimeInput(props: DateTimeInputProps) {
  // Keep date and time as strings
  const { setConfirmedDate } = props;
  const [useUTC, setUseUTC] = useState<boolean>(false);

  const [defaultDate, defaultTime] = getDateAndTimeStrings(new Date(), !useUTC);

  const [date, setDate] = useState<string>(defaultDate);
  const [time, setTime] = useState<string>(defaultTime);

  const confirmChangedDate = useCallback(() => {
    // Ugly but I don't know the datetime APIs well enough
    const fakeUtcDateTime = `${date}T${time}Z`;
    let timestamp = new Date(fakeUtcDateTime).getTime();
    if (!useUTC) {
      timestamp += BROWSER_OFFSET_HOURS * 3600000;
    }

    const newUtcDateTime = new Date(timestamp);
    setConfirmedDate(newUtcDateTime);
  }, [useUTC, date, time, setConfirmedDate]);

  return (
    <div>
      <input
        type="date"
        name="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />
      <input
        type="time"
        name="time"
        value={time}
        onChange={(event) => setTime(event.target.value)}
      />
      <select
        name="timezone"
        onChange={(event) => setUseUTC(event.target.value === 'utc')}
        value={useUTC ? 'utc' : 'local'}
      >
        <option key="local" value="local">Local time</option>
        <option key="utc" value="utc">UTC</option>
      </select>
      <input type="button" value="Change" onClick={confirmChangedDate} />
    </div>
  );
}

export default DateTimeInput;
