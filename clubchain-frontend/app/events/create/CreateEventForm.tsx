'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateEvent } from './useCreateEvent';
import type { EventFormData } from '../types';

export default function CreateEventForm() {
  const account = useCurrentAccount();
  const { isSubmitting, txStatus, createEvent, resetStatus } = useCreateEvent();

  const [formData, setFormData] = useState<EventFormData>({
    clubId: account?.address || '',
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvent(formData);
    
    // Reset form on success
    if (txStatus.includes('Success')) {
      setFormData({
        clubId: account?.address || '',
        title: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Location
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Room 301"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Club ID (optional)
          </label>
          <input
            type="text"
            value={formData.clubId}
            onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder={account?.address}
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to use your address</p>
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

