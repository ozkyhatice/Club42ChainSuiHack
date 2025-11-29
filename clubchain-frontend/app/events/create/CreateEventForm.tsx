'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateEvent } from './useCreateEvent';
import { useAdminCaps } from '@/modules/admin/useAdminCap';
import type { EventFormData } from '../types';

export default function CreateEventForm() {
  const account = useCurrentAccount();
  const { isSubmitting, txStatus, createEvent, resetStatus } = useCreateEvent();
  const { caps, loading: capsLoading } = useAdminCaps();

  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [formData, setFormData] = useState<EventFormData>({
    clubId: '',
    title: '',
    description: '',
    date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClubId) {
      return;
    }

    const adminCap = caps.find(cap => cap.club_id === selectedClubId);
    if (!adminCap) {
      return;
    }

    const eventData = {
      ...formData,
      clubId: selectedClubId,
    };

    await createEvent(eventData, adminCap.id, selectedClubId);
    
    // Reset form on success
    if (txStatus.includes('Success')) {
      setFormData({
        clubId: '',
        title: '',
        description: '',
        date: '',
      });
      setSelectedClubId('');
    }
  };

  if (capsLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your clubs...</p>
        </div>
      </div>
    );
  }

  if (caps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">No Clubs Found</h2>
        <p className="text-gray-600 mb-4">
          You need to be a club admin to create events. Create a club first to get started.
        </p>
        <a
          href="/clubs/create"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Create a Club
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Club
          </label>
          <select
            required
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">-- Select a club --</option>
            {caps.map((cap) => (
              <option key={cap.id} value={cap.club_id}>
                Club {cap.club_id.slice(0, 8)}...
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            You can only create events for clubs where you are an admin
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Event Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Workshop: Web3 Development"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="Learn Web3 basics..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Event Date
          </label>
          <input
            type="datetime-local"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Publishing...' : 'Publish Event'}
        </button>

        {txStatus && (
          <div className={`p-3 rounded-lg ${
            txStatus.includes('Success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <p className="text-sm">{txStatus}</p>
          </div>
        )}
      </form>
    </div>
  );
}
