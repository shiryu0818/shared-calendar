export type User = {
  id: string;
  name: string;
  username?: string;
  email?: string;
  color?: string;
};

export type CalendarData = {
  id: string;
  name: string;
  owner: { id: string; name: string };
  role: string;
};

export type EventData = {
  id: string;
  date: string;
  type: string;
  title: string;
  memo?: string;
  tag?: string;
  color?: string;
  visibility: string;
  calendarId: string;
  user: { id: string; name: string };
  sharedUserIds: string[];
};
