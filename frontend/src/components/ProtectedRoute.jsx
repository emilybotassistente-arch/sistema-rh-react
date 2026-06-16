import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Future: add auth check (token, session, etc.)
  // For now, always allow access
  return children;
}
