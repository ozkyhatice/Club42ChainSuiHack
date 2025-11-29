'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateEvent } from './useCreateEvent';
import { useAdminCaps } from '@/modules/admin/useAdminCap';
import type { EventFormData } from '../types';
import type { Club } from '@/src/services/blockchain/getClubs';
import GamifiedButton from '@/components/ui/GamifiedButton';
import Badge from '@/components/ui/Badge';
import OwnerBadge from '@/components/ui/OwnerBadge';
import { Calendar, Building2, FileText, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface CreateEventFormProps {
  ownedClubs?: Club[];
}

export default function CreateEventForm({ ownedClubs = [] }: CreateEventFormProps) {
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
      <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-muted text-lg">Loading your clubs...</p>
        </div>
      </div>
    );
  }

  if (caps.length === 0 && ownedClubs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">No Clubs Found</h2>
        <p className="text-text-muted mb-6">
          You need to be a club owner to create events. Create a club first to get started.
        </p>
        <GamifiedButton
          variant="primary"
          icon={Building2}
          onClick={() => window.location.href = '/clubs/create'}
        >
          Create a Club
        </GamifiedButton>
      </div>
    );
  }

  // Use ownedClubs if provided, otherwise use caps
  const availableClubs = ownedClubs.length > 0 ? ownedClubs : caps;

  return (
    <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-8 animate-slideUp animation-delay-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Selection */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Select Your Club
          </label>
          <select
            required
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all text-foreground font-medium"
          >
            <option value="">-- Choose a club to host this event --</option>
            {ownedClubs.length > 0 ? (
              ownedClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))
            ) : (
              caps.map((cap) => (
                <option key={cap.id} value={cap.club_id}>
                  Club {cap.club_id.slice(0, 8)}...
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
            <OwnerBadge size="sm" showLabel={false} animate={false} />
            You can only create events for clubs where you are the owner
          </p>
        </div>

        {/* Event Title */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Event Title
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all"
            placeholder="e.g., Workshop: Web3 Development Bootcamp"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-success" />
            Event Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all resize-none"
            rows={4}
            placeholder="Describe what participants will learn and experience..."
          />
        </div>

        {/* Date & Time */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Date & Time
          </label>
          <input
            type="datetime-local"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all"
          />
        </div>

        {/* Submit Button */}
        <GamifiedButton
          variant="gradient"
          size="lg"
          fullWidth
          disabled={isSubmitting}
          loading={isSubmitting}
          icon={Calendar}
        >
          {isSubmitting ? 'Publishing Event...' : 'Publish Event on Blockchain'}
        </GamifiedButton>

        {/* Status Message */}
        {txStatus && (
          <div className={`p-4 rounded-lg border-2 animate-slideUp ${
            txStatus.includes('Success') 
              ? 'bg-success/10 border-success' 
              : 'bg-error/10 border-error'
          }`}>
            <div className="flex items-start gap-3">
              {txStatus.includes('Success') ? (
                <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-error mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm font-medium ${
                txStatus.includes('Success') ? 'text-success-light' : 'text-error-light'
              }`}>
                {txStatus}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
