import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ViewportMode, CanvasBg, ActiveSection } from '../types';

export interface WorkbenchContextValue {
  activeSection: ActiveSection;
  setActiveSection: (sec: ActiveSection) => void;
  activeComponentId: string;
  setActiveComponentId: (id: string) => void;
  currentProps: Record<string, any>;
  setCurrentProps: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setPropValue: (key: string, value: any) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  viewport: ViewportMode;
  setViewport: (v: ViewportMode) => void;
  canvasBg: CanvasBg;
  setCanvasBg: (bg: CanvasBg) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

export const WorkbenchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('component');
  const [activeComponentId, setActiveComponentId] = useState<string>('button');
  const [currentProps, setCurrentProps] = useState<Record<string, any>>({});
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [canvasBg, setCanvasBg] = useState<CanvasBg>('canvas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const setPropValue = (key: string, value: any) => {
    setCurrentProps((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <WorkbenchContext.Provider
      value={{
        activeSection,
        setActiveSection,
        activeComponentId,
        setActiveComponentId,
        currentProps,
        setCurrentProps,
        setPropValue,
        theme,
        setTheme,
        viewport,
        setViewport,
        canvasBg,
        setCanvasBg,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </WorkbenchContext.Provider>
  );
};

export const useWorkbench = () => {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error('useWorkbench must be used within a WorkbenchProvider');
  return ctx;
};
