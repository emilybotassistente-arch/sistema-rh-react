import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext({});

export function AppProvider({ children }) {
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearToast = () => setToast(null);

  return (
    <AppContext.Provider
      value={{
        empresaSelecionada,
        setEmpresaSelecionada,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
