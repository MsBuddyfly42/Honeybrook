import React from 'react';import{createRoot}from'react-dom/client';import './api';import PracticeOffice from './app/practice-office';import Bookkeeping from './app/bookkeeping-app';
createRoot(document.getElementById('officeRoot')!).render(location.pathname.endsWith('books.html')?<Bookkeeping/>:<PracticeOffice/>);
