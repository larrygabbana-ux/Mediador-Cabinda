/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, Order, Message, Supplier, SupplierProduct, SupplierService, ServiceRequest, Collaborator, CollaboratorSale, Notification } from '../types';

export interface ServerSyncState {
  clients?: Client[];
  orders?: Order[];
  messages?: Message[];
  suppliers?: Supplier[];
  supplierProducts?: SupplierProduct[];
  supplierServices?: SupplierService[];
  serviceRequests?: ServiceRequest[];
  collaborators?: Collaborator[];
  collaboratorSales?: CollaboratorSale[];
  notifications?: Notification[];
  logisticsConfig?: any;
  lastUpdated?: number;
}

export type SyncConnectionStatus = 'connected' | 'syncing' | 'offline';

let currentSyncStatus: SyncConnectionStatus = 'connected';
const statusListeners = new Set<(status: SyncConnectionStatus, lastSyncTime: number) => void>();
let lastSuccessfulSyncTime = Date.now();

function notifyStatus(status: SyncConnectionStatus) {
  currentSyncStatus = status;
  if (status === 'connected') {
    lastSuccessfulSyncTime = Date.now();
  }
  statusListeners.forEach(cb => cb(status, lastSuccessfulSyncTime));
}

export function subscribeSyncStatus(callback: (status: SyncConnectionStatus, lastSyncTime: number) => void): () => void {
  statusListeners.add(callback);
  callback(currentSyncStatus, lastSuccessfulSyncTime);
  return () => statusListeners.delete(callback);
}

// Local cross-tab broadcast channel
let bc: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    bc = new BroadcastChannel('mediador_cabinda_live_sync');
  }
} catch {
  bc = null;
}

export function broadcastLocalChange(type: 'order' | 'client' | 'message' | 'bulk', data: any) {
  if (bc) {
    try {
      bc.postMessage({ type, data, timestamp: Date.now() });
    } catch {}
  }
}

export function listenToLocalBroadcast(onMessage: (event: { type: string; data: any; timestamp: number }) => void): () => void {
  if (!bc) return () => {};
  const handler = (ev: MessageEvent) => {
    if (ev && ev.data) {
      onMessage(ev.data);
    }
  };
  bc.addEventListener('message', handler);
  return () => bc?.removeEventListener('message', handler);
}

// Robust fetch with retry
async function safeFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const isAbsolute = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  const url = isAbsolute ? endpoint : endpoint;
  
  return fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(options.headers || {})
    }
  });
}

export async function fetchServerState(): Promise<ServerSyncState | null> {
  try {
    notifyStatus('syncing');
    const res = await safeFetch('/api/sync/state', {
      cache: 'no-store'
    });
    if (!res.ok) {
      notifyStatus('offline');
      return null;
    }
    const json = await res.json();
    notifyStatus('connected');
    return json.data || null;
  } catch (err) {
    notifyStatus('offline');
    return null;
  }
}

export async function syncOrderToServer(order: Order): Promise<boolean> {
  broadcastLocalChange('order', order);
  try {
    notifyStatus('syncing');
    const res = await safeFetch('/api/sync/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (res.ok) {
      notifyStatus('connected');
      return true;
    }
    notifyStatus('offline');
    return false;
  } catch (err) {
    notifyStatus('offline');
    return false;
  }
}

export async function syncClientToServer(client: Client): Promise<boolean> {
  broadcastLocalChange('client', client);
  try {
    notifyStatus('syncing');
    const res = await safeFetch('/api/sync/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    if (res.ok) {
      notifyStatus('connected');
      return true;
    }
    notifyStatus('offline');
    return false;
  } catch (err) {
    notifyStatus('offline');
    return false;
  }
}

export async function syncMessageToServer(message: Message): Promise<boolean> {
  broadcastLocalChange('message', message);
  try {
    notifyStatus('syncing');
    const res = await safeFetch('/api/sync/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    if (res.ok) {
      notifyStatus('connected');
      return true;
    }
    notifyStatus('offline');
    return false;
  } catch (err) {
    notifyStatus('offline');
    return false;
  }
}

export async function syncBulkToServer(payload: Partial<ServerSyncState>): Promise<boolean> {
  broadcastLocalChange('bulk', payload);
  try {
    notifyStatus('syncing');
    const res = await safeFetch('/api/sync/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      notifyStatus('connected');
      return true;
    }
    notifyStatus('offline');
    return false;
  } catch (err) {
    notifyStatus('offline');
    return false;
  }
}
