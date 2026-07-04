const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, DATE_TIME_FORMAT_OPTIONS).format(new Date(iso));
}
