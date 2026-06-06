'use client';

import { useEffect, useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { CalendarPage } from '../components/CalendarPage';
import { getMe, logout } from '../lib/api';
import { User } from '../lib/types';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((response) => setUser(response.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-shell">読み込み中...</div>;
  }

  if (!user) {
    return <LoginForm onAuthenticated={(user) => setUser(user)} />;
  }

  return (
    <div className="page-shell">
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="20px">
        <div>
          <h1>共有カレンダー</h1>
          <p>ようこそ、{user.name} さん</p>
        </div>
        <Button variant="outlined" color="secondary" onClick={() => logout().then(() => setUser(null))}>
          ログアウト
        </Button>
      </Box>
      <CalendarPage currentUser={user} />
    </div>
  );
}
