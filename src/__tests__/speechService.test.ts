import { describe, it, expect, beforeEach } from 'vitest';
import { voiceAssistantService } from '../services/speechService';
import { storageService } from '../services/storage';

describe('Voice Assistant - Speech Intent Processing & Clinical Safety', () => {
  beforeEach(() => {
    localStorage.clear();
    storageService.resetAllDemoData();
  });

  it('identifies medication check intents correctly', () => {
    const commands = [
      'What medications do I take today?',
      'Show my medicine schedule',
      'What are my pills?',
      'What do I take?'
    ];

    commands.forEach(cmd => {
      const action = voiceAssistantService.processCommand(cmd);
      expect(action.type).toBe('medications_summary');
      expect(action.spokenResponse).toBeDefined();
      expect(action.spokenResponse.length).toBeGreaterThan(10);
    });
  });

  // CLINICAL SAFETY REGRESSION TESTS: Negations must NEVER execute mutations
  it('prevents negated statements from executing medication mutations: "I did not take my pill."', () => {
    const pendingBefore = storageService.getTodayLogs().filter(l => l.status === 'pending');
    const pendingCountBefore = pendingBefore.length;

    const action = voiceAssistantService.processCommand('I did not take my pill.');
    
    // Must NOT mark dose as taken
    expect(action.type).toBe('medications_summary');
    expect(action.type).not.toBe('mark_dose_taken');
    expect(action.spokenResponse).toContain('pending');

    const pendingAfter = storageService.getTodayLogs().filter(l => l.status === 'pending');
    expect(pendingAfter.length).toBe(pendingCountBefore);
  });

  it('prevents negated statements from executing medication mutations: "I never took my medicine."', () => {
    const pendingBefore = storageService.getTodayLogs().filter(l => l.status === 'pending');
    const pendingCountBefore = pendingBefore.length;

    const action = voiceAssistantService.processCommand('I never took my medicine.');
    
    expect(action.type).toBe('medications_summary');
    expect(action.type).not.toBe('mark_dose_taken');
    expect(action.spokenResponse).toContain('pending');

    const pendingAfter = storageService.getTodayLogs().filter(l => l.status === 'pending');
    expect(pendingAfter.length).toBe(pendingCountBefore);
  });

  // CLINICAL SAFETY REGRESSION TESTS: Questions must NEVER execute mutations
  it('prevents question phrases from executing mutations: "Did I take my morning pill?"', () => {
    const pendingBefore = storageService.getTodayLogs().filter(l => l.status === 'pending');
    const pendingCountBefore = pendingBefore.length;

    const action = voiceAssistantService.processCommand('Did I take my morning pill?');

    // Must answer query informatively without mutating records
    expect(action.type).toBe('medications_summary');
    expect(action.type).not.toBe('mark_dose_taken');
    expect(action.spokenResponse).toContain('morning');

    const pendingAfter = storageService.getTodayLogs().filter(l => l.status === 'pending');
    expect(pendingAfter.length).toBe(pendingCountBefore);
  });

  it('prevents question phrases from executing mutations: "Have I taken my medication?"', () => {
    const pendingBefore = storageService.getTodayLogs().filter(l => l.status === 'pending');
    const pendingCountBefore = pendingBefore.length;

    const action = voiceAssistantService.processCommand('Have I taken my medication?');

    expect(action.type).toBe('medications_summary');
    expect(action.type).not.toBe('mark_dose_taken');

    const pendingAfter = storageService.getTodayLogs().filter(l => l.status === 'pending');
    expect(pendingAfter.length).toBe(pendingCountBefore);
  });

  // AFFIRMATIVE CONFIRMATION TESTS
  it('executes medication confirmation only upon explicit affirmative assertion: "I took my morning pill."', () => {
    const action = voiceAssistantService.processCommand('I took my morning pill.');
    expect(action.type).toBe('mark_dose_taken');
    expect(action.spokenResponse).toContain('Confirmed');
  });

  it('executes medication confirmation on explicit command: "Mark my morning pills as taken"', () => {
    const action = voiceAssistantService.processCommand('Mark my morning pills as taken');
    expect(action.type).toBe('mark_dose_taken');
    expect(action.spokenResponse).toContain('Confirmed');
  });

  it('identifies doctor appointment check intents', () => {
    const commands = [
      'When is my next doctor appointment?',
      'Do I have any clinic visits?',
      'Tell me my upcoming appointment'
    ];

    commands.forEach(cmd => {
      const action = voiceAssistantService.processCommand(cmd);
      expect(action.type).toBe('next_appointment');
      expect(action.spokenResponse).toContain('Dr.');
    });
  });

  it('identifies vitals and biometric check intents', () => {
    const commands = [
      'What was my latest blood pressure?',
      'Check my vitals',
      'What is my blood glucose reading?',
      'Tell me my heart rate'
    ];

    commands.forEach(cmd => {
      const action = voiceAssistantService.processCommand(cmd);
      expect(action.type).toBe('vitals_check');
      expect(action.spokenResponse).toContain('blood pressure');
    });
  });

  it('identifies emergency SOS keywords and returns trigger_sos action', () => {
    const emergencyCommands = [
      'Emergency SOS',
      'Help me, I fell',
      'I am having chest pain',
      'Call 911 right now'
    ];

    emergencyCommands.forEach(cmd => {
      const action = voiceAssistantService.processCommand(cmd);
      expect(action.type).toBe('trigger_sos');
      expect(action.spokenResponse).toContain('Emergency');
    });
  });

  it('handles unknown utterances gracefully with general help', () => {
    const unknownCommands = [
      'What is the weather outside?',
      'Sing a song for me',
      'Tell me a funny joke'
    ];

    unknownCommands.forEach(cmd => {
      const action = voiceAssistantService.processCommand(cmd);
      expect(action.type).toBe('general_help');
      expect(action.spokenResponse).toContain('ElderCare AI Assistant');
    });
  });

  it('handles edge cases such as mixed case, trailing whitespace and symbols', () => {
    const action = voiceAssistantService.processCommand('   WHAT ARE MY PILLS???   ');
    expect(action.type).toBe('medications_summary');

    const emptyAction = voiceAssistantService.processCommand('');
    expect(emptyAction.type).toBe('general_help');
  });
});
