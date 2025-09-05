import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Suspense } from 'react';

function RoutesWrapper() {
  return useRoutes(routes);
}

function App() {
  return (
    <ErrorBoundary fallback={<h2>页面加载失败，请重试</h2>}>
      <Suspense fallback={<div>加载中...</div>}>
        <BrowserRouter >
          <RoutesWrapper />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
    
  );
}

export default App
