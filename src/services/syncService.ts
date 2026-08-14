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

export async function fetchServerState(): Promise<ServerSyncState | null> {
  try {
    const res = await fetch('/api/sync/state', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    // Network errors are silently handled in offline/local mode
    return null;
  }
}

export async function syncOrderToServer(order: Order): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncClientToServer(client: Client): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(client)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncMessageToServer(message: Message): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function syncBulkToServer(payload: Partial<ServerSyncState>): Promise<boolean> {
  try {
    const res = await fetch('/api/sync/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
