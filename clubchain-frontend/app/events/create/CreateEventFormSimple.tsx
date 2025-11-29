'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateEvent } from './useCreateEventSimple';
import type { EventFormData } from '../types';
import type { Club } from '@/src/services/blockchain/getClubs';
import GamifiedButton from '@/components/ui/GamifiedButton';
import OwnerBadge from '@/components/ui/OwnerBadge';
import { Calendar, Building2, FileText, Clock, CheckCircle, XCircle, AlertCircle, Sparkles } from 'lucide-react';

interface CreateEventFormProps {
  ownedClubs?: Club[];
}

export default function CreateEventForm({ ownedClubs = [] }: CreateEventFormProps) {
  const account = useCurrentAccount();
  const { isSubmitting, txStatus, createEvent, resetStatus, adminCaps } = useCreateEvent();

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

    const eventData = {
      ...formData,
      clubId: selectedClubId,
    };

    await createEvent(eventData, selectedClubId);
    
    // Reset form on success
    if (txStatus.includes('successful')) {
      setFormData({
        clubId: '',
        title: '',
        description: '',
        date: '',
      });
      setSelectedClubId('');
    }
  };

  // Loading state
  if (!account) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-400">Please connect your wallet to create events.</p>
      </div>
    );
  }

  // No clubs available
  if (ownedClubs.length === 0 && !adminCaps?.length) {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-8 text-center">
        <Building2 className="w-16 h-16 text-warning mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Clubs Available</h3>
        <p className="text-gray-400 mb-4">
          You need to be the admin of at least one club to create events.
        </p>
        <GamifiedButton
          variant="primary"
          onClick={() => window.location.href = '/clubs/create'}
        >
          Create a Club
        </GamifiedButton>
      </div>
    );
  }

  return (
    <div className="bg-card border border-secondary rounded-xl shadow-elevation-2 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Select Your Club
          </label>
          <select
            required
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
          >
            <option value="">-- Choose a club to host this event --</option>
            {ownedClubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <OwnerBadge size="sm" showLabel={false} animate={false} />
            You can only create events for clubs where you are the admin
          </p>
        </div>

        {/* Event Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Event Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter event title"
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            required
          />
        </div>

        {/* Event Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your event"
            rows={4}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-vertical"
            required
          />
        </div>

        {/* Event Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Event Date & Time *
          </label>
          <input
            id="date"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Event will be automatically set to 2 hours duration
          </p>
        </div>

        {/* Status Display */}
        {txStatus && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            txStatus.includes('✅') ? 'bg-success/10 border border-success/20' :
            txStatus.includes('❌') ? 'bg-error/10 border border-error/20' :
            txStatus.includes('⚠️') ? 'bg-warning/10 border border-warning/20' :
            'bg-primary/10 border border-primary/20'
          }`}>
            {txStatus.includes('✅') && <CheckCircle className="w-5 h-5 text-success" />}
            {txStatus.includes('❌') && <XCircle className="w-5 h-5 text-error" />}
            {txStatus.includes('⚠️') && <AlertCircle className="w-5 h-5 text-warning" />}
            {!txStatus.includes('✅') && !txStatus.includes('❌') && !txStatus.includes('⚠️') && (
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            )}
            <span className={
              txStatus.includes('✅') ? 'text-success' :
              txStatus.includes('❌') ? 'text-error' :
              txStatus.includes('⚠️') ? 'text-warning' :
              'text-primary'
            }>
              {txStatus}
            </span>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-secondary/50 rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Debug Info</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p><strong>Account:</strong> {account?.address}</p>
              <p><strong>Selected Club:</strong> {selectedClubId || 'None'}</p>
              <p><strong>Available Clubs:</strong> {ownedClubs.length}</p>
              <p><strong>Admin Caps:</strong> {adminCaps?.length || 0}</p>
            </div>
          </div>
        )}

        {/* Wallet Interaction Info */}
        {!txStatus && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-primary mt-0.5">
                ℹ️
              </div>
              <div className="text-sm text-gray-400">
                <p className="font-medium mb-1">Transaction Process:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Click "Create Event" to prepare the transaction</li>
                  <li>Your wallet will open asking for approval</li>
                  <li>Review the transaction details and click "Approve"</li>
                  <li>Wait for the transaction to be processed on the blockchain</li>
                </ol>
                <p className="text-xs mt-2 opacity-80">
                  💡 If you see "Transaction cancelled", it means you clicked "Reject" in your wallet. This is normal!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <GamifiedButton
            type="submit"
            variant="primary"
            disabled={isSubmitting || !selectedClubId || !formData.title || !formData.description || !formData.date}
            icon={isSubmitting ? undefined : Sparkles}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Publishing Event...
              </div>
            ) : (
              "Publish Event on Blockchain"
            )}
          </GamifiedButton>
          
          {txStatus && (
            <GamifiedButton
              type="button"
              variant="secondary"
              onClick={resetStatus}
            >
              Reset
            </GamifiedButton>
          )}
        </div>
      </form>
    </div>
  );
}
