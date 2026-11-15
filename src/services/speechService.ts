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
   * Process senior voice commands into structured responses
   */
  public processCommand(commandText: string): VoiceAssistantAction {
    const text = commandText.toLowerCase().trim();

    // 1. Emergency / SOS
    if (
      text.includes('emergency') ||
      text.includes('sos') ||
      text.includes('help me') ||
      text.includes('call 911') ||
      text.includes('i fell') ||
      text.includes('fallen') ||
      text.includes('chest pain')
    ) {
      return {
        type: 'trigger_sos',
        spokenResponse: 'Emergency assistance requested. Opening Emergency SOS protocol right away.'
      };
    }

    // 2. Medications check
    if (
      text.includes('medication') ||
      text.includes('medicine') ||
      text.includes('pill') ||
      text.includes('what do i take') ||
      text.includes('schedule')
    ) {
      const todayLogs = storageService.getTodayLogs();
      const takenCount = todayLogs.filter(l => l.status === 'taken').length;
      const pendingCount = todayLogs.filter(l => l.status === 'pending').length;
      const pendingMeds = todayLogs.filter(l => l.status === 'pending');

      let response = '';
      if (pendingCount === 0) {
        response = `Great job, Margaret! You have taken all your scheduled medications for today.`;
      } else {
        const nextMed = pendingMeds[0];
        response = `You have taken ${takenCount} doses today. You still have ${pendingCount} upcoming doses, including ${nextMed.medicationName} scheduled for ${nextMed.scheduledTime}.`;
      }

      return {
        type: 'medications_summary',
        spokenResponse: response,
        payload: { takenCount, pendingCount }
      };
    }

    // 3. Mark Dose As Taken
    if (
      text.includes('took my pill') ||
      text.includes('mark taken') ||
      text.includes('i took my morning') ||
      text.includes('took morning') ||
      text.includes('took medicine')
    ) {
      const todayLogs = storageService.getTodayLogs();
      const pendingLog = todayLogs.find(l => l.status === 'pending');

      if (pendingLog) {
        storageService.recordDoseStatus(pendingLog.id, 'taken', 'Margaret Vance (Voice)');
        audioService.playSuccessChime();
        return {
          type: 'mark_dose_taken',
          spokenResponse: `Confirmed! I marked ${pendingLog.medicationName} as taken at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          payload: { logId: pendingLog.id }
        };
      } else {
        return {
          type: 'mark_dose_taken',
          spokenResponse: 'All scheduled doses for today have already been marked as taken.'
        };
      }
    }

    // 4. Appointments check
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

    // 5. Vitals check
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

    // Default friendly assistant fallback
    return {
      type: 'general_help',
      spokenResponse: `Hello Margaret! I am your ElderCare AI Assistant. You can ask me: "What medications do I take today?", "When is my doctor appointment?", "What was my blood pressure?", or say "Emergency SOS" if you need immediate assistance.`
    };
  }
}

export const voiceAssistantService = new VoiceAssistantService();
