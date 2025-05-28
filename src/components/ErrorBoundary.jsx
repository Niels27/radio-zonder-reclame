import React from 'react';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (event) => {
      setHasError(true);
      setError(event.error);
    };

    const handleUnhandledRejection = (event) => {
      setHasError(true);
      setError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-radio-darker text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>          <h1 className="text-2xl font-bold mb-4">Oeps! Er is iets misgegaan</h1>
          <p className="text-radio-secondary mb-6">
            De applicatie heeft een onverwachte fout ondervonden. Dit kan komen door een netwerkprobleem of browser compatibiliteit.
          </p>
          <div className="bg-radio-dark p-4 rounded-lg mb-6 text-left">
            <h3 className="font-medium mb-2">Fout Details:</h3>
            <code className="text-sm text-red-400 break-all">
              {error?.message || 'Onbekende fout opgetreden'}
            </code>
          </div>
          <div className="space-y-3">            <button
              onClick={resetError}
              className="w-full px-4 py-2 bg-radio-accent hover:bg-radio-accent-hover text-white rounded-lg transition-colors"
            >
              Opnieuw Proberen
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Pagina Herladen
            </button>
          </div>
          <p className="text-xs text-radio-secondary mt-4">
            Als het probleem aanhoudt, probeer je browser cache te wissen of gebruik een andere browser.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;
