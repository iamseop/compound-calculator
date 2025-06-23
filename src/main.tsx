import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx'; // App 컴포넌트 임포트
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App /> {/* App 컴포넌트 렌더링 */}
  </React.StrictMode>
);
