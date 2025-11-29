/**
 * Events feature types
 */

export interface EventFormData {
  clubId: string;
  title: string;
  description: string;
  date: string; // ISO datetime-local format
}

export interface EventItem {
  objectId: string;
  title: string;
  description: string;
  date?: number;
  location?: string;
  startTime?: number;
  endTime?: number;
  clubId: string;
  createdBy?: string;
  creator?: string;
  createdAt?: number;
}

export interface EventObject {
  id: string;
  club_id: string;
  title: string;
  description: string;
  date: string;
  created_by: string;
}
