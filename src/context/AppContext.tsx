import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Property, Lead, BusinessSettings, PropertyStatus, LeadStatus, Project, NavigationTab, PublicTab, AppMode } from '../types';
import { INITIAL_PROPERTIES, INITIAL_LEADS, INITIAL_SETTINGS, INITIAL_PROJECTS } from '../data/initialData';

export type { NavigationTab, PublicTab, AppMode };

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  // Public vs Admin Portal Mode
  currentMode: AppMode;
  setCurrentMode: (mode: AppMode) => void;
  publicTab: PublicTab;
  setPublicTab: (tab: PublicTab) => void;

  // Buyer Shortlisted Plots
  savedPlotIds: string[];
  toggleSavePlot: (plotId: string) => void;
  isPlotSaved: (plotId: string) => boolean;

  // Authentication & Session
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  login: (email?: string) => void;
  logout: () => void;

  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Projects / Layouts & Active Context Filter
  projects: Project[];
  selectedProjectId: string; // 'all' | project.id
  selectedProject: Project | null;
  setSelectedProjectId: (id: string) => void;

  // Project Modals & View Drawer
  editingProject: Project | null;
  isProjectModalOpen: boolean;
  openAddProjectModal: () => void;
  openEditProjectModal: (project: Project) => void;
  closeProjectModal: () => void;

  viewingProject: Project | null;
  isProjectDetailOpen: boolean;
  projectDetailInitialMode: 'overview' | 'grid';
  openProjectDetail: (project: Project, initialMode?: 'overview' | 'grid') => void;
  closeProjectDetail: () => void;

  // Project CRUD
  saveProject: (project: Omit<Project, 'id'> & { id?: string }) => void;
  deleteProject: (projectId: string) => void;

  // Raw & Filtered Data
  properties: Property[]; // Raw all properties
  filteredProperties: Property[]; // Context filtered by selectedProjectId
  leads: Lead[]; // Raw all leads
  filteredLeads: Lead[]; // Context filtered by selectedProjectId
  settings: BusinessSettings;

  // Modals & Drawers
  selectedProperty: Property | null;
  isPropertyDrawerOpen: boolean;
  openPropertyDrawer: (property: Property) => void;
  closePropertyDrawer: () => void;

  editingProperty: Property | null;
  isPropertyModalOpen: boolean;
  openAddPropertyModal: (defaultProjectId?: string) => void;
  openEditPropertyModal: (property: Property) => void;
  closePropertyModal: () => void;

  selectedLead: Lead | null;
  isLeadModalOpen: boolean;
  openLeadDrawer: (lead: Lead) => void;
  closeLeadDrawer: () => void;

  // CRUD Operations
  updatePropertyStatus: (propertyId: string, status: PropertyStatus) => void;
  saveProperty: (property: Omit<Property, 'id'> & { id?: string }) => void;
  deleteProperty: (propertyId: string) => void;

  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addLeadNote: (leadId: string, noteText: string) => void;
  saveLead: (lead: Omit<Lead, 'id' | 'timestamp'> & { id?: string }) => void;
  deleteLead: (leadId: string) => void;

  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  resetToMasterData: () => void;

  // Notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Metrics (dynamically computed for selected project)
  stats: {
    totalProperties: number;
    availableUnits: number;
    activeLeads: number;
    soldReservedUnits: number;
    totalValueLakhs: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: 'kriyaa_projects_v4',
  SELECTED_PROJECT: 'kriyaa_selected_project_v4',
  PROPERTIES: 'kriyaa_properties_v4',
  LEADS: 'kriyaa_leads_v4',
  SETTINGS: 'kriyaa_settings_v4',
  AUTH_TOKEN: 'kriyaa_auth_token_v4',
  SAVED_PLOTS: 'kriyaa_saved_plots_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Public Customer Website vs Authenticated Admin Management Portal
  const [currentMode, setCurrentMode] = useState<AppMode>('public');
  const [publicTab, setPublicTab] = useState<PublicTab>('home');

  // Buyer Shortlisted / Saved Plots
  const [savedPlotIds, setSavedPlotIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_PLOTS);
      return saved ? JSON.parse(saved) : ['prop-1', 'prop-2'];
    } catch {
      return ['prop-1', 'prop-2'];
    }
  });

  const toggleSavePlot = (plotId: string) => {
    setSavedPlotIds((prev) => {
      const isAlreadySaved = prev.includes(plotId);
      const updated = isAlreadySaved
        ? prev.filter((id) => id !== plotId)
        : [...prev, plotId];

      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_PLOTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      showToast(
        isAlreadySaved ? 'Removed from My Plots' : 'Plot added to My Plots!',
        isAlreadySaved ? 'info' : 'success'
      );
      return updated;
    });
  };

  const isPlotSaved = (plotId: string) => savedPlotIds.includes(plotId);

  // Authentication & Session State (Admin only)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return Boolean(savedToken && savedToken.startsWith('session_'));
    } catch {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  // Selected Project Context Filter ('all' or specific projectId)
  const [selectedProjectId, setSelectedProjectIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PROJECT);
      return saved || 'proj-golden-city';
    } catch {
      return 'proj-golden-city';
    }
  });

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PROJECT, id);
    } catch (e) {
      console.error(e);
    }
  };

  const selectedProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Project View / Detail Drawer State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [projectDetailInitialMode, setProjectDetailInitialMode] = useState<'overview' | 'grid'>('overview');

  const openProjectDetail = (project: Project, initialMode: 'overview' | 'grid' = 'overview') => {
    setViewingProject(project);
    setProjectDetailInitialMode(initialMode);
    setIsProjectDetailOpen(true);
  };

  const closeProjectDetail = () => {
    setIsProjectDetailOpen(false);
  };

  const openAddProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
    } catch {
      return INITIAL_PROPERTIES;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEADS);
      return saved ? JSON.parse(saved) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Modal / Drawer state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isPropertyDrawerOpen, setIsPropertyDrawerOpen] = useState(false);

  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
    } catch (e) {
      console.error(e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    } catch (e) {
      console.error(e);
    }
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Keep selected item fresh if lists update
  useEffect(() => {
    if (selectedProperty) {
      const fresh = properties.find((p) => p.id === selectedProperty.id);
      if (fresh) setSelectedProperty(fresh);
    }
  }, [properties]);

  useEffect(() => {
    if (selectedLead) {
      const fresh = leads.find((l) => l.id === selectedLead.id);
      if (fresh) setSelectedLead(fresh);
    }
  }, [leads]);

  // -------------------------------------------------------------
  // Context Filtering: Filter properties & leads by selectedProjectId
  // -------------------------------------------------------------
  const filteredProperties = useMemo(() => {
    if (selectedProjectId === 'all') return properties;
    return properties.filter((p) => p.projectId === selectedProjectId);
  }, [properties, selectedProjectId]);

  const filteredLeads = useMemo(() => {
    if (selectedProjectId === 'all') return leads;
    return leads.filter((l) => {
      if (l.projectId === selectedProjectId) return true;
      if (selectedProject) {
        return l.propertyOfInterest.toLowerCase().includes(selectedProject.name.toLowerCase());
      }
      return false;
    });
  }, [leads, selectedProjectId, selectedProject]);

  // Project CRUD Operations
  const saveProject = (projectData: Omit<Project, 'id'> & { id?: string }) => {
    if (projectData.id) {
      // Edit
      setProjects((prev) =>
        prev.map((p) => (p.id === projectData.id ? ({ ...projectData, id: projectData.id } as Project) : p))
      );
      showToast(`Layout "${projectData.name}" updated successfully`, 'success');
    } else {
      // Add
      const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
      };
      setProjects((prev) => [newProject, ...prev]);
      setSelectedProjectId(newProject.id);
      showToast(`New layout "${projectData.name}" created and selected`, 'success');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#15803D', '#EAB308', '#991B1B'],
        });
      } catch {}
    }
    closeProjectModal();
  };

  const deleteProject = (projectId: string) => {
    const projToDelete = projects.find((p) => p.id === projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId('all');
    }
    showToast(`Project "${projToDelete?.name || ''}" removed`, 'info');
  };

  // Property Handlers
  const openPropertyDrawer = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyDrawerOpen(true);
  };

  const closePropertyDrawer = () => {
    setIsPropertyDrawerOpen(false);
  };

  const openAddPropertyModal = (defaultProjectId?: string) => {
    setEditingProperty(null);
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    }
    setIsPropertyModalOpen(true);
  };

  const openEditPropertyModal = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };

  const closePropertyModal = () => {
    setIsPropertyModalOpen(false);
  };

  const updatePropertyStatus = (propertyId: string, status: PropertyStatus) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status } : p))
    );
    showToast(`Property status updated to "${status}"`, 'success');
  };

  const saveProperty = (propertyData: Omit<Property, 'id'> & { id?: string }) => {
    // Ensure property has assigned projectId and projectName
    const targetProjectId = propertyData.projectId || (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj-golden-city');
    const matchedProject = projects.find((p) => p.id === targetProjectId);

    if (propertyData.id) {
      // Edit
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyData.id
            ? ({
                ...propertyData,
                id: propertyData.id,
                projectId: targetProjectId,
                projectName: matchedProject?.name || p.projectName,
              } as Property)
            : p
        )
      );
      showToast(`Property "${propertyData.title}" updated successfully`, 'success');
    } else {
      // Add
      const newProperty: Property = {
        ...propertyData,
        id: `prop-${Date.now()}`,
        projectId: targetProjectId,
        projectName: matchedProject?.name || 'Golden City',
      };
      setProperties((prev) => [newProperty, ...prev]);
      showToast(`New property "${propertyData.title}" added to ${matchedProject?.name || 'inventory'}`, 'success');

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#15803D', '#EAB308', '#991B1B'],
        });
      } catch {}
    }
    closePropertyModal();
  };

  const deleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    if (selectedProperty?.id === propertyId) closePropertyDrawer();
    showToast('Property removed from inventory', 'info');
  };

  // Lead Handlers
  const openLeadDrawer = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadModalOpen(true);
  };

  const closeLeadDrawer = () => {
    setIsLeadModalOpen(false);
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    showToast(`Lead status updated to "${status}"`, 'success');
  };

  const addLeadNote = (leadId: string, noteText: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, notes: [noteText, ...l.notes] } : l
      )
    );
    showToast('Note added to client timeline', 'info');
  };

  const saveLead = (leadData: Omit<Lead, 'id' | 'timestamp'> & { id?: string }) => {
    const targetProjectId = leadData.projectId || (selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || 'proj-golden-city');

    if (leadData.id) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadData.id
            ? ({
                ...leadData,
                id: leadData.id,
                projectId: targetProjectId,
                timestamp: l.timestamp,
              } as Lead)
            : l
        )
      );
      showToast(`Lead "${leadData.customerName}" updated`, 'success');
    } else {
      const newLead: Lead = {
        ...leadData,
        id: `lead-${Date.now()}`,
        projectId: targetProjectId,
        timestamp: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
      showToast(`New inquiry for "${leadData.customerName}" registered`, 'success');
    }
    closeLeadDrawer();
  };

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    if (selectedLead?.id === leadId) closeLeadDrawer();
    showToast('Lead record removed', 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Company settings updated successfully', 'success');
  };

  const resetToMasterData = () => {
    if (window.confirm('Reset all demo layouts, plots, and inquiries to initial master data?')) {
      setProjects(INITIAL_PROJECTS);
      setSelectedProjectId('proj-golden-city');
      setProperties(INITIAL_PROPERTIES);
      setLeads(INITIAL_LEADS);
      setSettings(INITIAL_SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_PROJECT);
      localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      showToast('Restored default Kriyaa Promoters master records', 'info');
    }
  };

  const login = (email?: string) => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `session_${Date.now()}`);
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(true);
    setCurrentMode('admin');
    setActiveTab('dashboard');
    showToast(`Welcome back, ${settings.ownerName || 'Rajesh RTR'}!`, 'success');
  };

  const logout = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'logged_out');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('session_token');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    setCurrentMode('public');
    showToast('Admin session logged out safely', 'info');
  };

  // Metrics (computed based on filteredProperties and filteredLeads for active context)
  const stats = useMemo(() => {
    const totalProperties = filteredProperties.length;
    const availableUnits = filteredProperties.filter((p) => p.status === 'Available').length;
    const soldReservedUnits = filteredProperties.filter((p) => p.status === 'Sold' || p.status === 'Reserved').length;
    const activeLeads = filteredLeads.filter((l) => l.status !== 'Closed').length;
    const totalValue = filteredProperties.reduce((acc, p) => acc + p.totalPrice, 0);

    return {
      totalProperties,
      availableUnits,
      activeLeads,
      soldReservedUnits,
      totalValueLakhs: Math.round(totalValue / 100000),
    };
  }, [filteredProperties, filteredLeads]);

  return (
    <AppContext.Provider
      value={{
        currentMode,
        setCurrentMode,
        publicTab,
        setPublicTab,
        savedPlotIds,
        toggleSavePlot,
        isPlotSaved,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        activeTab,
        setActiveTab,
        projects,
        selectedProjectId,
        selectedProject,
        setSelectedProjectId,
        editingProject,
        isProjectModalOpen,
        openAddProjectModal,
        openEditProjectModal,
        closeProjectModal,
        viewingProject,
        isProjectDetailOpen,
        projectDetailInitialMode,
        openProjectDetail,
        closeProjectDetail,
        saveProject,
        deleteProject,
        properties,
        filteredProperties,
        leads,
        filteredLeads,
        settings,
        selectedProperty,
        isPropertyDrawerOpen,
        openPropertyDrawer,
        closePropertyDrawer,
        editingProperty,
        isPropertyModalOpen,
        openAddPropertyModal,
        openEditPropertyModal,
        closePropertyModal,
        selectedLead,
        isLeadModalOpen,
        openLeadDrawer,
        closeLeadDrawer,
        updatePropertyStatus,
        saveProperty,
        deleteProperty,
        updateLeadStatus,
        addLeadNote,
        saveLead,
        deleteLead,
        updateSettings,
        resetToMasterData,
        toasts,
        showToast,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
