'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { getCalendars, getEvents, createEvent } from '../lib/api';
import { CalendarData, EventData, User } from '../lib/types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });

export function CalendarPage({ currentUser }: { currentUser: User }) {
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({ type: 'schedule', title: '', memo: '', tag: '', color: '#1976d2', visibility: 'public', sharedUserIds: '' });
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [calendarPlugins, setCalendarPlugins] = useState<any[]>([]);
  const [calendarLocale, setCalendarLocale] = useState<any | null>(null);

  const calendarEvents = useMemo(
    () => events.map((event) => ({ title: event.title, date: event.date.slice(0, 10), backgroundColor: event.color || '#1976d2', borderColor: event.color || '#1976d2' })),
    [events],
  );

  useEffect(() => {
    getCalendars().then((res) => {
      setCalendars(res.calendars);
      if (res.calendars.length > 0) {
        setSelectedCalendar(res.calendars[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    Promise.all([
      import('@fullcalendar/daygrid'),
      import('@fullcalendar/interaction'),
      import('@fullcalendar/core/locales/ja'),
    ]).then(([dayGrid, interaction, jaLocale]) => {
      setCalendarPlugins([dayGrid.default, interaction.default]);
      setCalendarLocale(jaLocale.default || jaLocale);
    });
  }, []);

  useEffect(() => {
    if (!selectedCalendar) return;
    getEvents(selectedCalendar, month).then((res) => setEvents(res.events));
  }, [selectedCalendar, month]);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedCalendar) return;
    await createEvent({
      calendarId: selectedCalendar,
      date: selectedDate,
      ...formData,
      sharedUserIds: formData.sharedUserIds ? formData.sharedUserIds.split(',').map((id) => id.trim()) : [],
    });
    setOpen(false);
    setFormData({ type: 'schedule', title: '', memo: '', tag: '', color: '#1976d2', visibility: 'public', sharedUserIds: '' });
    getEvents(selectedCalendar, month).then((res) => setEvents(res.events));
  };

  return (
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap" marginBottom={2} alignItems="center">
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>カレンダー</InputLabel>
          <Select value={selectedCalendar || ''} label="カレンダー" onChange={(e) => setSelectedCalendar(e.target.value)}>
            {calendars.map((calendar) => (
              <MenuItem key={calendar.id} value={calendar.id}>{calendar.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="表示月" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Button variant="contained" onClick={() => setOpen(true)} disabled={!selectedCalendar}>イベントを追加</Button>
      </Box>

      <Box sx={{ border: '1px solid #ddd', borderRadius: 2, overflow: 'hidden', minHeight: 500 }}>
        {typeof window !== 'undefined' && calendarPlugins.length > 0 && calendarLocale ? (
            <FullCalendar
              plugins={calendarPlugins}
              initialView="dayGridMonth"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
              buttonText={{ today: '今日', month: '月', listMonth: 'リスト' }}
              locale="ja"
              locales={[calendarLocale]}
              events={calendarEvents}
              dateClick={handleDateClick}
            />
        ) : (
          <div>カレンダーを読み込んでいます...</div>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>イベントを追加</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 16, width: 400, mt: 1 }}>
          <TextField label="日付" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} fullWidth />
          <FormControl fullWidth>
            <InputLabel>種別</InputLabel>
            <Select value={formData.type} label="種別" onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
              <MenuItem value="schedule">予定</MenuItem>
              <MenuItem value="off">休み</MenuItem>
              <MenuItem value="memo">メモ</MenuItem>
            </Select>
          </FormControl>
          <TextField label="タイトル" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} fullWidth />
          <TextField label="詳細メモ" multiline minRows={3} value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} fullWidth />
          <TextField label="タグ" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} fullWidth />
          <TextField label="色" type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} fullWidth />
          <FormControl fullWidth>
            <InputLabel>公開範囲</InputLabel>
            <Select value={formData.visibility} label="公開範囲" onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}>
              <MenuItem value="public">全員公開</MenuItem>
              <MenuItem value="private">自分のみ</MenuItem>
              <MenuItem value="custom">一部ユーザー</MenuItem>
            </Select>
          </FormControl>
          {formData.visibility === 'custom' && (
            <TextField
              label="共有ユーザーID（CSV）"
              value={formData.sharedUserIds}
              onChange={(e) => setFormData({ ...formData, sharedUserIds: e.target.value })}
              fullWidth
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
