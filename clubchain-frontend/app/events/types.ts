/**
 * Events feature types
 */

export interface EventFormData {
  clubId: string;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO datetime-local format
  endTime: string;
}

export interface EventItem {
  objectId: string;
  title: string;
  description: string;
  location: string;
  startTime: number;
  endTime: number;
  clubId: string;
  creator: string;
  createdAt: number;
}

export interface EventObject {
  id: string;
  club_id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  creator: string;
  created_at: string;
}

