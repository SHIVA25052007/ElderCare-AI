import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { voiceAssistantService } from '../services/speechService';
import { audioService } from '../services/audioService';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Bot,
  HelpCircle,
  Pill,
  Calendar,
  Activity,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const VoiceAssistantModal: React.FC = () => {
  const { isVoiceAssistantOpen, closeVoiceAssistant, openSOS } = useApp();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [assistantResponse, setAssistantResponse] = useState<string>(
    'Hello Margaret! I am your ElderCare AI Assistant. How can I help you today?'
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSpeechSupported = voiceAssistantService.isSpeechSupported();

  useEffect(() => {
    if (isVoiceAssistantOpen) {
      setTranscript('');
      setErrorMessage(null);
      // Greet when opened
      audioService.speak(assistantResponse, () => setIsSpeaking(false));
      setIsSpeaking(true);
    } else {
      audioService.stopSpeaking();
      voiceAssistantService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isVoiceAssistantOpen]);

  if (!isVoiceAssistantOpen) return null;

  const handleStartListening = () => {
    setErrorMessage(null);
    audioService.stopSpeaking();
    setIsSpeaking(false);

    voiceAssistantService.startListening({
      onTranscript: (text) => {
        setTranscript(text);
      },
      onStatusChange: (listening) => {
        setIsListening(listening);
      },
      onError: (err) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      onComplete: (finalText) => {
        executeCommand(finalText);
      }
    });
  };

  const handleStopListening = () => {
    voiceAssistantService.stopListening();
    setIsListening(false);
    if (transcript.trim()) {
      executeCommand(transcript);
    }
  };

  const executeCommand = (commandText: string) => {
    setTranscript(commandText);
    const action = voiceAssistantService.processCommand(commandText);
    setAssistantResponse(action.spokenResponse);

    setIsSpeaking(true);
    audioService.speak(action.spokenResponse, () => {
      setIsSpeaking(false);
    });

    if (action.type === 'trigger_sos') {
      setTimeout(() => {
        closeVoiceAssistant();
        openSOS();
      }, 1500);
    }
  };

  const quickCommands = [
    { label: 'What medications do I take today?', icon: <Pill className="w-4 h-4 text-cyan-400" /> },
    { label: 'Mark my morning pills as taken', icon: <Pill className="w-4 h-4 text-teal-400" /> },
    { label: 'When is my next doctor appointment?', icon: <Calendar className="w-4 h-4 text-blue-400" /> },
    { label: 'What was my latest blood pressure?', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { label: 'Emergency SOS', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-navy-900 border border-teal-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-navy-850 border-b border-navy-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-navy-950 shadow-glow-teal">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>ElderCare Voice Assistant</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold uppercase">
                  Web Speech AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">Senior-friendly voice interaction</p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.stopSpeaking();
              closeVoiceAssistant();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Waveform / Visualizer */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-navy-950/70 border border-navy-800 text-center relative overflow-hidden">
            {/* Visualizer bars */}
            <div className="flex items-center justify-center gap-1.5 h-12 mb-4">
              {[40, 70, 30, 90, 60, 100, 50, 80, 45, 95, 35].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: isListening ? `${h}%` : isSpeaking ? `${h * 0.7}%` : '8px',
                    animationDelay: `${i * 0.1}s`
                  }}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isListening
                      ? 'bg-rose-500 shadow-glow-red'
                      : isSpeaking
                      ? 'bg-teal-400 shadow-glow-teal'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Transcript or Status */}
            <div className="min-h-12 flex items-center justify-center px-4">
              {isListening ? (
                <p className="text-sm text-rose-300 font-semibold animate-pulse">
                  {transcript || 'Listening... Please speak now...'}
                </p>
              ) : isSpeaking ? (
                <p className="text-sm text-teal-300 font-medium italic flex items-center gap-2">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  Speaking response...
                </p>
              ) : transcript ? (
                <p className="text-sm text-slate-300 font-medium">"{transcript}"</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Tap the microphone or choose a quick command below.
                </p>
              )}
            </div>

            {/* Microphone Button */}
            <div className="mt-4">
              {!isListening ? (
                <button
                  onClick={handleStartListening}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 font-extrabold text-sm shadow-glow-teal transition-all flex items-center gap-2"
                >
                  <Mic className="w-5 h-5 text-navy-950" />
                  <span>Start Listening</span>
                </button>
              ) : (
                <button
                  onClick={handleStopListening}
                  className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-glow-red transition-all flex items-center gap-2 animate-pulse"
                >
                  <MicOff className="w-5 h-5 text-white" />
                  <span>Stop & Process</span>
                </button>
              )}
            </div>
          </div>

          {/* Assistant's Response Box */}
          <div className="p-4 rounded-2xl bg-navy-850 border border-teal-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Assistant Response
              </span>
              <button
                onClick={() => {
                  setIsSpeaking(true);
                  audioService.speak(assistantResponse, () => setIsSpeaking(false));
                }}
                className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1"
                title="Replay Voice Audio"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay</span>
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {assistantResponse}
            </p>
          </div>

          {/* Quick Voice Command Chips */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tap to Ask (Or Speak Aloud)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickCommands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => executeCommand(cmd.label)}
                  className="p-2.5 rounded-xl bg-navy-800/80 hover:bg-navy-750 border border-navy-750 text-left text-xs font-medium text-slate-200 hover:text-teal-300 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Error notice if speech not supported or mic denied */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200">
              {errorMessage}
            </div>
          )}

          {!isSpeechSupported && (
            <div className="p-3 rounded-xl bg-navy-800 border border-navy-700 text-xs text-slate-400">
              ℹ️ Your browser environment does not support Web Speech microphone capture. You can freely use all the one-click command buttons above with synthetic voice responses.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
