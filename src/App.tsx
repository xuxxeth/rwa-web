import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Suspense, useEffect } from 'react';
import storage from './utils/storage';
import { useTranslation } from './hooks/useTranslation';

function RoutesWrapper() {
  return useRoutes(routes);
}

function App() {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const lng = storage.getItem('CA_LANGUAGE') || 'en'
    i18n.changeLanguage(lng)
  }, [i18n])
  return (
    <ErrorBoundary fallback={<h2>{t('pageError')}</h2>}>
      <Suspense fallback={<div>{t('Loading')}...</div>}>
        <BrowserRouter >
          <RoutesWrapper />
        </BrowserRouter>
      </Suspense>
    </ErrorBoundary>
    
  );
}

export default App
