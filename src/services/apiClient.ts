import { Project, Property } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('kriyaa_auth_token_v1') || 'session_kriyaa_admin_token_default';
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch {
    return {
      Authorization: 'Bearer session_kriyaa_admin_token_default',
      'Content-Type': 'application/json',
    };
  }
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API (Published records only)
// ─────────────────────────────────────────────────────────────
export async function fetchPublishedProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/public/projects`);
  if (!res.ok) {
    throw new Error(`Failed to load published projects: ${res.statusText}`);
  }
  const data = await res.json();
  return data.projects || [];
}

export async function fetchPublishedProjectPlots(projectId: string): Promise<{ project: Project; plots: Property[] }> {
  const res = await fetch(`${API_BASE}/public/projects/${encodeURIComponent(projectId)}/plots`);
  if (!res.ok) {
    throw new Error(`Failed to load project plots: ${res.statusText}`);
  }
  return await res.json();
}

// ─────────────────────────────────────────────────────────────
// ADMIN API (Draft + Published management, requires token)
// ─────────────────────────────────────────────────────────────
export async function fetchAdminProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch admin projects: ${res.statusText}`);
  }
  const data = await res.json();
  return data.projects || [];
}

export async function createAdminProject(projectData: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/admin/projects`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(projectData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create project');
  }
  const data = await res.json();
  return data.project;
}

export async function updateAdminProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update project');
  }
  const data = await res.json();
  return data.project;
}

export async function publishProject(projectId: string): Promise<{ success: boolean; message: string; project: Project }> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/publish`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to publish project');
  }
  return await res.json();
}

export async function unpublishProject(projectId: string): Promise<{ success: boolean; message: string; project: Project }> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/unpublish`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to unpublish project');
  }
  return await res.json();
}

export async function deleteAdminProject(projectId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete project');
  }
}

export async function fetchAdminProjectPlots(projectId: string): Promise<Property[]> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/plots`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to load plots: ${res.statusText}`);
  }
  const data = await res.json();
  return data.plots || [];
}

export async function uploadProjectLayoutImage(
  projectId: string,
  layoutImageUrl: string,
  layoutPdfUrl?: string
): Promise<{ success: boolean; layoutVersion: number; project: Project }> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/layout-image`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ layoutImageUrl, layoutPdfUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload layout image');
  }
  return await res.json();
}

export async function importSpreadsheetPlots(
  projectId: string,
  rows: any[]
): Promise<{ success: boolean; message: string; importedCount: number; validationErrors?: string[]; plots: Property[] }> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/import-plots`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || (err.validationErrors ? err.validationErrors.join('; ') : 'Failed to import spreadsheet'));
  }
  return await res.json();
}

export async function savePlotBoundaries(
  projectId: string,
  boundaries: { plotId?: string; plotNumber?: string; x: number; y: number; width: number; height: number; points?: [number, number][] }[]
): Promise<{ success: boolean; updatedCount: number }> {
  const res = await fetch(`${API_BASE}/admin/projects/${encodeURIComponent(projectId)}/boundaries`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ boundaries }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save boundaries');
  }
  return await res.json();
}

export async function updateAdminPlot(plotId: string, updates: Partial<Property>): Promise<Property> {
  const res = await fetch(`${API_BASE}/admin/plots/${encodeURIComponent(plotId)}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update plot');
  }
  const data = await res.json();
  return data.plot;
}

export async function deleteAdminPlot(plotId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/plots/${encodeURIComponent(plotId)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete plot');
  }
}

