// components/ErrorBoundary.jsx - Top-level wrapper around the app.
// Currently a pass-through: its full-screen error fallback (which was triggered by global
// 'error' / 'unhandledrejection' events) has been disabled. Kept as a component so App.jsx's
// structure stays stable and a real (class-based) error boundary can be dropped in later.

const ErrorBoundary = ({ children }) => children;

export default ErrorBoundary;
