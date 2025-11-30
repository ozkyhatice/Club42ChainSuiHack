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
  const { isSubmitting, txStatus, createEvent, resetStatus, clubOwnerBadges } = useCreateEvent();

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
  if (ownedClubs.length === 0 && !clubOwnerBadges?.length) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-8 text-center">
        <div className="inline-flex p-4 bg-primary/10 rounded-lg mb-4">
          <Building2 className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No Clubs Available</h3>
        <p className="text-text-muted mb-6">
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
    <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-8 animate-slideUp animation-delay-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Club Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span>Select Your Club</span>
          </label>
          <select
            required
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all hover:border-primary/50"
          >
            <option value="">-- Choose a club to host this event --</option>
            {ownedClubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-2 flex items-center gap-2">
            <OwnerBadge size="sm" showLabel={false} animate={false} />
            <span>You can only create events for clubs where you are the admin</span>
          </p>
        </div>

        {/* Event Title */}
        <div className="space-y-3">
          <label htmlFor="title" className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span>Event Title *</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter event title"
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all hover:border-primary/50"
            required
          />
        </div>

        {/* Event Description */}
        <div className="space-y-3">
          <label htmlFor="description" className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <span>Description *</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your event"
            rows={4}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all resize-vertical hover:border-primary/50"
            required
          />
        </div>

        {/* Event Date */}
        <div className="space-y-3">
          <label htmlFor="date" className="block text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <span>Event Date & Time *</span>
          </label>
          <div className="relative">
            <input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all hover:border-primary/50"
              required
            />
          </div>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Event will be automatically set to 2 hours duration</span>
          </p>
        </div>

        {/* Status Display */}
        {txStatus && (
          <div className={`p-4 rounded-lg flex items-start gap-3 border ${
            txStatus.includes('✅') || txStatus.includes('Success') ? 'bg-success/10 border-success/30' :
            txStatus.includes('❌') || txStatus.includes('Error') ? 'bg-error/10 border-error/30' :
            txStatus.includes('⚠️') || txStatus.includes('Warning') ? 'bg-warning/10 border-warning/30' :
            'bg-primary/10 border-primary/30'
          }`}>
            <div className="flex-shrink-0 mt-0.5">
              {(txStatus.includes('✅') || txStatus.includes('Success')) && <CheckCircle className="w-5 h-5 text-success" />}
              {(txStatus.includes('❌') || txStatus.includes('Error')) && <XCircle className="w-5 h-5 text-error" />}
              {(txStatus.includes('⚠️') || txStatus.includes('Warning')) && <AlertCircle className="w-5 h-5 text-warning" />}
              {!txStatus.includes('✅') && !txStatus.includes('Success') && !txStatus.includes('❌') && !txStatus.includes('Error') && !txStatus.includes('⚠️') && !txStatus.includes('Warning') && (
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              )}
            </div>
            <span className={`flex-1 ${
              txStatus.includes('✅') || txStatus.includes('Success') ? 'text-success' :
              txStatus.includes('❌') || txStatus.includes('Error') ? 'text-error' :
              txStatus.includes('⚠️') || txStatus.includes('Warning') ? 'text-warning' :
              'text-primary'
            }`}>
              {txStatus}
            </span>
          </div>
        )}

        {/* Wallet Interaction Info */}
        {!txStatus && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary/20 rounded-lg flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm text-text-muted flex-1">
                <p className="font-semibold text-foreground mb-2">Transaction Process:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-xs">
                  <li>Click "Publish Event" to prepare the transaction</li>
                  <li>Your wallet will open asking for approval</li>
                  <li>Review the transaction details and click "Approve"</li>
                  <li>Wait for the transaction to be processed on the blockchain</li>
                </ol>
                <p className="text-xs mt-3 text-text-secondary">
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
