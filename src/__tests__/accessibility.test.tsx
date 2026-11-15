import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '../context/AppContext';
import { SOSModal } from '../components/SOSModal';
import { VoiceAssistantModal } from '../components/VoiceAssistantModal';
import { AuthModal } from '../components/AuthModal';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { storageService } from '../services/storage';

// Test wrapper component that allows opening modals via interactive trigger buttons
const ModalTestHost: React.FC<{ modal: 'sos' | 'voice' | 'auth' }> = ({ modal }) => {
  const { openSOS, openVoiceAssistant, openAuthModal, isSOSOpen, isVoiceAssistantOpen, isAuthModalOpen } = useApp();

  return (
    <div>
      {modal === 'sos' && (
        <>
          <button id="sos-trigger" onClick={openSOS}>Open SOS</button>
          {isSOSOpen && <SOSModal />}
        </>
      )}
      {modal === 'voice' && (
        <>
          <button id="voice-trigger" onClick={openVoiceAssistant}>Open Voice Assistant</button>
          {isVoiceAssistantOpen && <VoiceAssistantModal />}
        </>
      )}
      {modal === 'auth' && (
        <>
          <button id="auth-trigger" onClick={openAuthModal}>Open Auth Modal</button>
          {isAuthModalOpen && <AuthModal />}
        </>
      )}
    </div>
  );
};

describe('Phase 4 - Accessible Modals (WCAG Compliance)', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  describe('SOSModal Accessibility', () => {
    it('exposes role="dialog", aria-modal="true", and meaningful accessible naming', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="sos" />
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Open SOS/i }));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'sos-modal-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'sos-modal-desc');

      const title = document.getElementById('sos-modal-title');
      expect(title).toHaveTextContent(/EMERGENCY SOS SYSTEM/i);

      const closeButton = screen.getByRole('button', { name: /Close Emergency SOS Dialog/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('closes when pressing the Escape key and cleans up dialog', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="sos" />
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Open SOS/i }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('restores focus to the trigger element when closed', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="sos" />
        </AppProvider>
      );

      const trigger = screen.getByRole('button', { name: /Open SOS/i });
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      fireEvent.click(trigger);
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      // Close modal using close button
      const closeBtn = screen.getByRole('button', { name: /Close Emergency SOS Dialog/i });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('VoiceAssistantModal Accessibility', () => {
    it('exposes role="dialog", aria-modal="true", and accessible header associations', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="voice" />
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Open Voice Assistant/i }));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'voice-assistant-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'voice-assistant-desc');

      const title = document.getElementById('voice-assistant-title');
      expect(title).toHaveTextContent(/ElderCare Voice Assistant/i);

      const closeButton = screen.getByRole('button', { name: /Close Voice Assistant Dialog/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('closes on Escape key press', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="voice" />
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Open Voice Assistant/i }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('AuthModal Accessibility', () => {
    it('exposes role="dialog", aria-modal="true", and tablist controls', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="auth" />
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Open Auth Modal/i }));

      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title');

      const tablist = screen.getByRole('tablist', { name: /Authentication modes/i });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBe(2);

      const closeButton = screen.getByRole('button', { name: /Close Authentication Dialog/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('closes on Escape key press', async () => {
      render(
        <AppProvider>
          <ModalTestHost modal="auth" />
        </AppProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: /Open Auth Modal/i }));
      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});

describe('Phase 4 - Notification Dropdown Keyboard & Semantic Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  it('renders notification items as semantic keyboard-activatable buttons', async () => {
    const handleClose = vi.fn();

    render(
      <AppProvider>
        <NotificationDropdown onClose={handleClose} />
      </AppProvider>
    );

    const region = screen.getByRole('region', { name: /Notifications Panel/i });
    expect(region).toBeInTheDocument();

    // Check header action buttons have accessible names
    expect(screen.getByRole('button', { name: /Mark all notifications as read/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear all notifications/i })).toBeInTheDocument();

    // Check notification list items are interactive buttons
    const notifButtons = screen.getAllByRole('listitem');
    expect(notifButtons.length).toBeGreaterThan(0);
    expect(notifButtons[0].tagName).toBe('BUTTON');

    // Notification button has accessible label
    expect(notifButtons[0]).toHaveAttribute('aria-label');

    // Click/activate notification item
    fireEvent.click(notifButtons[0]);

    // Close panel button exists and is accessible
    const closeBtn = screen.getByRole('button', { name: /Close Notifications Panel/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('supports filtering notifications between All and Unread tabs with keyboard selection', () => {
    const handleClose = vi.fn();

    render(
      <AppProvider>
        <NotificationDropdown onClose={handleClose} />
      </AppProvider>
    );

    const allTab = screen.getByRole('tab', { name: /All/i });
    const unreadTab = screen.getByRole('tab', { name: /Unread/i });

    expect(allTab).toHaveAttribute('aria-selected', 'true');
    expect(unreadTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(unreadTab);
    expect(unreadTab).toHaveAttribute('aria-selected', 'true');
  });
});
