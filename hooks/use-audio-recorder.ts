import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export function useAudioRecorder(onTranscript?: (text: string) => void) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length === 0) return;

        setProcessing(true);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const base64data = (reader.result as string).split(',')[1];
            
            const res = await apiClient.post("/therapy/voice-stt", {
              audio: base64data,
              mime: "audio/webm"
            });
            
            if (res.data?.text && onTranscript) {
              onTranscript(res.data.text);
            }
          } catch (error: any) {
            console.error("STT endpoint error", error);
            const errMsg = error?.response?.data?.error || error.message || "Could not process audio.";
            toast({ title: "Transcription failed", description: errMsg, variant: "destructive" });
          } finally {
            setProcessing(false);
          }
        };
      };

      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      toast({ title: "Microphone access denied", description: "Please allow microphone access in your browser settings.", variant: "destructive" });
    }
  }, [onTranscript, toast]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
  }, []);

  return { recording, processing, startRecording, stopRecording };
}
