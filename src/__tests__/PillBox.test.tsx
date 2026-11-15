import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProvider } from '../context/AppContext';
import { SeniorDashboard } from '../components/SeniorDashboard';
import { storageService } from '../services/storage';

describe('Senior Dashboard - PillBox Component Behavior', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  it('renders senior greeting and today pill box with scheduled doses', () => {
    render(
      <AppProvider>
        <SeniorDashboard />
      </AppProvider>
    );

    expect(screen.getByText(/Good Morning, Margaret!/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's Pill Box/i)).toBeInTheDocument();
    
    // Metformin is scheduled twice a day (Morning and Evening)
    const metforminElements = screen.getAllByText(/Metformin HCl 500mg/i);
    expect(metforminElements.length).toBe(2);

    expect(screen.getByText(/Vitamin D3 2,000 IU/i)).toBeInTheDocument();
  });

  it('displays accurate completion status and progress percentage', () => {
    render(
      <AppProvider>
        <SeniorDashboard />
      </AppProvider>
    );

    // Initial seed has 2 of 5 doses taken (40%)
    expect(screen.getByText(/2 of 5/i)).toBeInTheDocument();
    expect(screen.getByText(/40% Completed/i)).toBeInTheDocument();
  });

  it('displays physical pill attributes and meal guidance', () => {
    render(
      <AppProvider>
        <SeniorDashboard />
      </AppProvider>
    );

    // Check for pill color/shape tags and food requirements
    expect(screen.getByText(/Peach/i)).toBeInTheDocument();
    expect(screen.getByText(/Translucent Yellow/i)).toBeInTheDocument();
    
    const foodGuidanceElements = screen.getAllByText(/Take with food/i);
    expect(foodGuidanceElements.length).toBeGreaterThan(0);
  });

  it('marks a pending medication as taken when TAKE PILL is clicked', async () => {
    render(
      <AppProvider>
        <SeniorDashboard />
      </AppProvider>
    );

    // Find all 'TAKE PILL' buttons
    const takeButtons = screen.getAllByRole('button', { name: /take pill/i });
    expect(takeButtons.length).toBeGreaterThan(0);

    // Click the first available TAKE PILL button
    fireEvent.click(takeButtons[0]);

    // After clicking, progress should update
    await waitFor(() => {
      // 3 of 5 doses taken = 60%
      expect(screen.getByText(/3 of 5/i)).toBeInTheDocument();
      expect(screen.getByText(/60% Completed/i)).toBeInTheDocument();
    });
  });

  it('records daily mood check-in and provides immediate confirmation', async () => {
    render(
      <AppProvider>
        <SeniorDashboard />
      </AppProvider>
    );

    const moodButton = screen.getByRole('button', { name: /Feeling Great/i });
    expect(moodButton).toBeInTheDocument();

    fireEvent.click(moodButton);

    await waitFor(() => {
      expect(screen.getByText(/Thank you! Your check-in "Feeling Great 😊" was shared/i)).toBeInTheDocument();
    });
  });
});
