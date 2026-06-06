import { FormEvent, useState } from 'react';
import { login, registerUser } from '../lib/api';
import { User } from '../lib/types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export function LoginForm({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const requestData = isRegister
        ? {
            name,
            username,
            password,
            ...(email.trim() ? { email } : {}),
          }
        : { username, password };
      const result = isRegister ? await registerUser(requestData) : await login(requestData);
      onAuthenticated(result.user);
    } catch (err) {
      setError('ログインまたは登録に失敗しました。');
    }
  };

  return (
    <div className="page-shell">
      <Box component="form" onSubmit={submit} maxWidth={400} mx="auto" display="flex" flexDirection="column" gap={2}>
        <h1>{isRegister ? '新規登録' : 'ログイン'}</h1>
        {isRegister && (
          <TextField label="表示名" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <TextField label="ユーザー名" value={username} onChange={(e) => setUsername(e.target.value)} required />
        {isRegister && (
          <TextField label="メール（任意）" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}
        <TextField label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <div className="error-message">{error}</div>}
        <Button type="submit" variant="contained">{isRegister ? '登録して進む' : 'ログイン'}</Button>
        <Button variant="text" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? '既にアカウントをお持ちですか？ログイン' : 'アカウントがない場合はこちら'}
        </Button>
      </Box>
    </div>
  );
}
