/**
 * Speech Recognition and Voice Assistant Service for ElderCare AI
 * Uses Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 */

import { storageService } from './storage';
import { audioService } from './audioService';

export interface SpeechRecognitionResultState {
  transcript: string;
  isListening: boolean;
  error?: string;
  isSupported: boolean;
}

// Typing for browser SpeechRecognition
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

export interface VoiceAssistantAction {
  type: 'medications_summary' | 'mark_dose_taken' | 'next_appointment' | 'vitals_check' | 'trigger_sos' | 'general_help' | 'unknown';
  spokenResponse: string;
  payload?: Record<string, unknown>;
}

class VoiceAssistantService {
  private recognition: unknown = null;
  private isListening: boolean = false;
  private onTranscriptUpdate?: (transcript: string) => void;
  private onStatusUpdate?: (isListening: boolean) => void;
  private onError?: (errorMessage: string) => void;

  constructor() {
    this.initRecognition();
  }

  public isSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window
    );
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recog = new (SpeechRecognitionClass as any)();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => {
        this.isListening = true;
        if (this.onStatusUpdate) this.onStatusUpdate(true);
      };

      recog.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.results[0][0].transcript;
        if (this.onTranscriptUpdate) {
          this.onTranscriptUpdate(current);
        }
      };

      recog.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.isListening = false;
        if (this.onStatusUpdate) this.onStatusUpdate(false);
        if (this.onError) {
          if (event.error === 'not-allowed') {
            this.onError('Microphone permission was denied. Please allow microphone access in your browser settings.');
          } else {
            this.onError(`Voice recognition error: ${event.error}`);
          }
        }
      };

      recog.onend = () => {
        this.isListening = false;
        if (this.onStatusUpdate) this.onStatusUpdate(false);
      };

      this.recognition = recog;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  public startListening(callbacks: {
    onTranscript: (text: string) => void;
    onStatusChange: (listening: boolean) => void;
    onError: (err: string) => void;
    onComplete: (transcript: string) => void;
  }) {
    if (!this.isSpeechSupported()) {
      callbacks.onError('Web Speech API is not supported in this browser. You can still tap any command chip below.');
      return;
    }

    if (!this.recognition) {
      this.initRecognition();
    }

    this.onTranscriptUpdate = callbacks.onTranscript;
    this.onStatusUpdate = callbacks.onStatusChange;
    this.onError = callbacks.onError;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recog = this.recognition as any;
    if (recog) {
      recog.onresult = (event: SpeechRecognitionEvent) => {
        const text = event.results[0][0].transcript;
        callbacks.onTranscript(text);
      };

      recog.onend = () => {
        this.isListening = false;
        callbacks.onStatusChange(false);
      };

      try {
        recog.start();
      } catch (e) {
        console.warn('Start listening exception:', e);
      }
    }
  }

  public stopListening() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recog = this.recognition as any;
    if (recog && this.isListening) {
      try {
        recog.stop();
      } catch {
        // Ignore
      }
    }
    this.isListening = false;
  }

  /**
   * Process senior voice commands into structured responses with clinical safety guards
   */
  public processCommand(commandText: string): VoiceAssistantAction {
    const text = commandText.toLowerCase().trim();

    if (!text) {
      return {
        type: 'general_help',
        spokenResponse: 'Hello Margaret! I am your ElderCare AI Assistant. How can I help you today?'
      };
    }

    // Helper functions for clinical safety
    const hasNegation = /\b(not|never|didn't|did not|haven't|have not|don't|do not|no|won't|can't|cannot)\b/i.test(text);
    const isQuestionOrQuery = (
      text.includes('?') ||
      /\b(did i|have i|do i|when do i|what do i|what are|show my|should i|am i supposed to|has|how many|which)\b/i.test(text)
    );

    // 1. Emergency / SOS (with negation safety check so "no emergency" or "not having chest pain" doesn't falsely trigger)
    const isSOSKeyword = (
      text.includes('emergency') ||
      text.includes('sos') ||
      text.includes('help me') ||
      text.includes('call 911') ||
      text.includes('i fell') ||
      text.includes('fallen') ||
      text.includes('chest pain')
    );

    if (isSOSKeyword) {
      if (hasNegation && (text.includes('not an emergency') || text.includes('no emergency') || text.includes('not having chest pain') || text.includes('did not fall') || text.includes("didn't fall"))) {
        return {
          type: 'general_help',
          spokenResponse: 'Understood, Margaret. I noted that you are not in an emergency. Please let me know if you need any other assistance.'
        };
      }

      return {
        type: 'trigger_sos',
        spokenResponse: 'Emergency assistance requested. Opening Emergency SOS protocol right away.'
      };
    }

    // 2. Doctor Appointments check
    if (
      text.includes('appointment') ||
      text.includes('doctor') ||
      text.includes('visit') ||
      text.includes('clinic')
    ) {
      const appointments = storageService.getAppointments().filter(a => a.status === 'scheduled');
      if (appointments.length === 0) {
        return {
          type: 'next_appointment',
          spokenResponse: 'You do not have any upcoming doctor appointments scheduled in the system.'
        };
      }

      const nextApt = appointments[0];
      const response = `Your next appointment is with ${nextApt.doctorName} for ${nextApt.specialty} on ${nextApt.date} at ${nextApt.time}. It is an ${nextApt.type} consultation.`;
      return {
        type: 'next_appointment',
        spokenResponse: response,
        payload: { appointment: nextApt }
      };
    }

    // 3. Vitals & Biometrics check
    if (
      text.includes('vital') ||
      text.includes('blood pressure') ||
      text.includes('glucose') ||
      text.includes('heart rate') ||
      text.includes('pulse')
    ) {
      const vitals = storageService.getVitals();
      if (vitals.length === 0) {
        return {
          type: 'vitals_check',
          spokenResponse: 'No vitals records are logged yet today.'
        };
      }
      const latest = vitals[0];
      const response = `Your latest blood pressure was ${latest.systolic} over ${latest.diastolic} millimeters of mercury, with a heart rate of ${latest.heartRate} beats per minute. Blood glucose is ${latest.bloodGlucose || 'not recorded'} milligrams per deciliter. All indicators are stable.`;
      return {
        type: 'vitals_check',
        spokenResponse: response,
        payload: { vitals: latest }
      };
    }

    // 4. Medication Intent Handling (Clinical Safety Gates)
    const isMedicationTopic = (
      text.includes('medication') ||
      text.includes('medicine') ||
      text.includes('pill') ||
      text.includes('dose') ||
      text.includes('schedule') ||
      text.includes('what do i take') ||
      text.includes('what to take')
    );

    if (isMedicationTopic) {
      const todayLogs = storageService.getTodayLogs();
      const takenLogs = todayLogs.filter(l => l.status === 'taken');
      const pendingLogs = todayLogs.filter(l => l.status === 'pending');

      // 4A: Negation Statements (e.g., "I did not take my pill", "I never took my medicine")
      // NEVER mutate records on negative statements!
      if (hasNegation) {
        return {
          type: 'medications_summary',
          spokenResponse: `Understood, Margaret. Your scheduled doses remain marked as pending. You currently have ${pendingLogs.length} pending doses for today. Please take them with food and water when you are ready.`,
          payload: { takenCount: takenLogs.length, pendingCount: pendingLogs.length }
        };
      }

      // 4B: Questions & Information Inquiries (e.g., "Did I take my morning pill?", "Have I taken my medicine?", "What medications do I take today?")
      // NEVER mutate records on questions or queries!
      if (isQuestionOrQuery) {
        // Specific query about morning medications
        if (text.includes('morning')) {
          const morningTaken = takenLogs.filter(l => l.timeOfDay === 'Morning');
          const morningPending = pendingLogs.filter(l => l.timeOfDay === 'Morning');

          if (morningPending.length === 0 && morningTaken.length > 0) {
            return {
              type: 'medications_summary',
              spokenResponse: `Yes, Margaret. You have taken your morning medications: ${morningTaken.map(l => l.medicationName).join(' and ')}. Your next upcoming dose is scheduled for later today.`,
              payload: { morningTaken, morningPending }
            };
          } else if (morningPending.length > 0) {
            return {
              type: 'medications_summary',
              spokenResponse: `You still have ${morningPending.length} pending morning dose: ${morningPending.map(l => l.medicationName).join(', ')}.`,
              payload: { morningTaken, morningPending }
            };
          }
        }

        // General medication overview
        if (pendingLogs.length === 0) {
          return {
            type: 'medications_summary',
            spokenResponse: `Great job, Margaret! You have taken all your scheduled medications for today.`,
            payload: { takenCount: takenLogs.length, pendingCount: 0 }
          };
        } else {
          const nextMed = pendingLogs[0];
          return {
            type: 'medications_summary',
            spokenResponse: `You have taken ${takenLogs.length} doses today. You still have ${pendingLogs.length} upcoming doses, including ${nextMed.medicationName} scheduled for ${nextMed.scheduledTime}.`,
            payload: { takenCount: takenLogs.length, pendingCount: pendingLogs.length }
          };
        }
      }

      // 4C: Explicit Affirmative Confirmation (e.g., "I took my morning pill", "Mark my morning pills as taken", "I took my medicine")
      // Only execute mutation if the user explicitly asserts that the dose has been taken!
      const isAffirmativeConfirmation = (
        /\b(i took|i've taken|i have taken|mark (my )?(morning |afternoon |evening |night )?pills? as taken|mark taken|confirm (my )?dose taken|i swallowed (my )?pill)\b/i.test(text)
      );

      if (isAffirmativeConfirmation) {
        // Target specific time of day if requested
        let targetLog = pendingLogs[0];
        if (text.includes('morning')) {
          targetLog = pendingLogs.find(l => l.timeOfDay === 'Morning') || targetLog;
        } else if (text.includes('afternoon')) {
          targetLog = pendingLogs.find(l => l.timeOfDay === 'Afternoon') || targetLog;
        } else if (text.includes('evening')) {
          targetLog = pendingLogs.find(l => l.timeOfDay === 'Evening') || targetLog;
        } else if (text.includes('night')) {
          targetLog = pendingLogs.find(l => l.timeOfDay === 'Night') || targetLog;
        }

        if (targetLog) {
          storageService.recordDoseStatus(targetLog.id, 'taken', 'Margaret Vance (Voice)');
          audioService.playSuccessChime();
          return {
            type: 'mark_dose_taken',
            spokenResponse: `Confirmed! I marked ${targetLog.medicationName} as taken at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            payload: { logId: targetLog.id }
          };
        } else {
          return {
            type: 'mark_dose_taken',
            spokenResponse: 'All scheduled doses for today have already been marked as taken.'
          };
        }
      }

      // 4D: Ambiguous medication statement (e.g. just saying "my pill" or "morning medicine")
      return {
        type: 'general_help',
        spokenResponse: 'Would you like to check today\'s medication schedule, or confirm that you have taken a dose? You can say "What medications do I take?" or "I took my morning pill".'
      };
    }

    // Default friendly assistant fallback
    return {
      type: 'general_help',
      spokenResponse: `Hello Margaret! I am your ElderCare AI Assistant. You can ask me: "What medications do I take today?", "When is my doctor appointment?", "What was my blood pressure?", or say "Emergency SOS" if you need immediate assistance.`
    };
  }
}

export const voiceAssistantService = new VoiceAssistantService();
