import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSpeechRecognitionProps {
  onResult?: (text: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

export function useSpeechRecognition({
  onResult,
  onEnd,
  onError,
  continuous = true,
}: UseSpeechRecognitionProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const { toast } = useToast();

  const initRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const rec = new SR();
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (e: any) => {
      let finalTrans = "";
      let interimTrans = "";
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) finalTrans += e.results[i][0].transcript;
        else interimTrans += e.results[i][0].transcript;
      }
      
      if (onResult) {
        if (finalTrans) onResult(finalTrans, true);
        if (interimTrans) onResult(interimTrans, false);
      }
    };

    rec.onend = () => {
      if (isListeningRef.current && continuous) {
        // Stagger restart to avoid service spam on network glitches
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              rec.start();
            } catch (e) {
              // Only fail if it's actually dead and not just already started
              if (!isListeningRef.current) {
                setIsListening(false);
                if (onEnd) onEnd();
              }
            }
          }
        }, 1000);
      } else {
        isListeningRef.current = false;
        setIsListening(false);
        if (onEnd) onEnd();
      }
    };

    rec.onerror = (e: any) => {
      console.error("STT Error:", e.error);
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      
      // Critical errors should stop the session
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
      }
      
      if (onError) onError(e.error);
    };

    return rec;
  }, [continuous, onResult, onEnd, onError]);

  const toggleListening = useCallback(async () => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      try { recognitionRef.current?.stop(); } catch {}
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Not Supported", description: "Speech recognition is not supported in this browser.", variant: "destructive" });
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }

    try {
      recognitionRef.current.start();
      isListeningRef.current = true;
      setIsListening(true);
    } catch (err) {
      isListeningRef.current = false;
      setIsListening(false);
      if (onError) onError("start-failed");
      toast({ title: "Mic Error", description: "Could not start microphone listener.", variant: "destructive" });
    }
  }, [initRecognition, onError, toast]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    try { recognitionRef.current?.stop(); } catch {}
  }, []);

  useEffect(() => {
    return () => { stopListening(); };
  }, [stopListening]);

  return { isListening, toggleListening, stopListening, startListening: toggleListening };
}
