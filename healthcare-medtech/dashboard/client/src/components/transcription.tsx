import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"; 
import { Mic, Square, Bot, Loader2, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { pipeline, Pipeline, env } from '@xenova/transformers';

// Configure Whisper for browser use with better error handling
env.allowRemoteModels = true;
env.allowLocalModels = true;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

// Add custom fetch with better error handling for model loading
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const response = await originalFetch(input, init);
    
    // Log failed requests for debugging
    if (!response.ok) {
      console.warn(`Fetch failed: ${response.status} ${response.statusText} for ${input}`);
    }
    
    return response;
  } catch (error) {
    console.error(`Network error for ${input}:`, error);
    throw error;
  }
};

interface TreatmentNotes {
  chief_complaint: string;
  examination: string;
  diagnosis: string;
  treatment_plan: string;
}

function dedupeAppend(prev: string, next: string, overlapWords = 8) {
  const p = prev.trim();
  const n = next.trim();
  if (!p) return n;
  const pWords = p.split(/\s+/);
  const tail = pWords.slice(-overlapWords).join(" ");
  const idx = n.toLowerCase().indexOf(tail.toLowerCase());
  if (idx === 0) return (p + " " + n.slice(tail.length)).trim();
  if (p.toLowerCase().includes(n.toLowerCase())) return p;
  return (p + " " + n).trim();
}

// Helper function to resample audio
function resampleAudio(audioData: Float32Array, originalSampleRate: number, targetSampleRate: number): Float32Array {
  if (originalSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const index = i * ratio;
    const indexFloor = Math.floor(index);
    const indexCeil = Math.min(indexFloor + 1, audioData.length - 1);
    const fraction = index - indexFloor;
    
    result[i] = audioData[indexFloor] * (1 - fraction) + audioData[indexCeil] * fraction;
  }

  return result;
}

export default function Transcription() {
  const [isRecording, setIsRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState<TreatmentNotes | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const whisperPipelineRef = useRef<Pipeline | null>(null);
  const { toast } = useToast();

  // Load Whisper model with multiple fallback strategies
  const loadWhisperModel = async () => {
    if (whisperPipelineRef.current) return;
    
    try {
      setIsModelLoading(true);
      console.log('Loading Whisper model...');
      
      // List of models to try in order of preference
      const modelsToTry = [
        'Xenova/whisper-tiny.en',
        'Xenova/whisper-tiny',
        'openai/whisper-tiny.en'
      ];
      
      let transcriber = null;
      let lastError = null;
      
      for (const modelName of modelsToTry) {
        try {
          console.log(`Attempting to load: ${modelName}`);
          
          // Try with minimal configuration first
          transcriber = await pipeline('automatic-speech-recognition', modelName);
          
          console.log(`Successfully loaded: ${modelName}`);
          break;
        } catch (error) {
          console.warn(`Failed to load ${modelName}:`, error);
          lastError = error;
          
          // If it's the JSON parsing error, try a different approach
          if (error instanceof SyntaxError && error.message.includes('DOCTYPE')) {
            console.log('Detected HTML response instead of JSON, trying alternative approach...');
            
            // Try with different configuration
            try {
              transcriber = await pipeline('automatic-speech-recognition', modelName, {
                revision: 'main',
                quantized: true
              });
              console.log(`Successfully loaded ${modelName} with alternative config`);
              break;
            } catch (altError) {
              console.warn(`Alternative config also failed for ${modelName}:`, altError);
            }
          }
          
          continue;
        }
      }
      
      if (!transcriber) {
        // If all models fail, show a helpful error message
        throw new Error(`All Whisper models failed to load. This might be due to network restrictions or CORS issues. Last error: ${lastError?.message}`);
      }
      
      whisperPipelineRef.current = transcriber;
      setIsModelLoaded(true);
      console.log('Whisper model loaded successfully');
      
      toast({
        title: "Whisper Model Loaded",
        description: "Ready for high-quality transcription",
      });
    } catch (error) {
      console.error('Failed to load Whisper model:', error);
      
      // Provide more specific error messages
      let errorMessage = "Could not load Whisper model.";
      if (error instanceof Error) {
        if (error.message.includes('DOCTYPE')) {
          errorMessage = "Network issue: Getting HTML instead of model files. Try refreshing or check your internet connection.";
        } else if (error.message.includes('CORS')) {
          errorMessage = "CORS issue: Model loading blocked by browser security. Try using a different browser or network.";
        } else if (error.message.includes('fetch')) {
          errorMessage = "Network error: Cannot download model files. Check your internet connection.";
        }
      }
      
      toast({
        title: "Model Loading Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  // Transcribe audio with Whisper
  const transcribeAudioWithWhisper = async (audioData: Float32Array) => {
    if (!whisperPipelineRef.current) return;
    
    try {
      setIsTranscribing(true);
      
      const result = await whisperPipelineRef.current(audioData, {
        language: 'english',
        task: 'transcribe',
        return_timestamps: false,
      });

      const text = result.text || '';
      if (text.trim()) {
        setFinalText(prev => dedupeAppend(prev, text.trim()));
      }
    } catch (error) {
      console.error('Transcription failed:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const processTranscriptionMutation = useMutation({
    mutationFn: async (transcription: string) => {
      const appointment: any = await apiRequest("POST", "/api/appointments", {
        patientId: "temp-patient",
        appointmentDate: new Date().toISOString(),
        type: "transcription",
        status: "completed",
      });
      const result = await apiRequest(
        "POST",
        `/api/appointments/${appointment.id}/transcription`,
        { transcription }
      );
      return result;
    },
    onSuccess: (data: any) => {
      if (data.treatmentNotes) {
        setTreatmentNotes(data.treatmentNotes);
        toast({ title: "Success", description: "Transcription processed and treatment notes generated" });
      } else {
        toast({ title: "Success", description: "Transcription processed" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process transcription", variant: "destructive" });
    },
  });

  const startRecording = async () => {
    if (!whisperPipelineRef.current) {
      toast({ 
        title: "Model Not Loaded", 
        description: "Please load the Whisper model first.", 
        variant: "destructive" 
      });
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      toast({ title: "Microphone not supported", description: "Use Chrome/Edge.", variant: "destructive" });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;

      // Set up Web Audio API for real-time processing
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Use MediaRecorder for capturing audio chunks
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      let audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          try {
            // Convert blob to audio data for Whisper
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
            let audioData = audioBuffer.getChannelData(0);
            
            // Resample to 16kHz if needed
            if (audioBuffer.sampleRate !== 16000) {
              audioData = resampleAudio(audioData, audioBuffer.sampleRate, 16000);
            }
            
            await transcribeAudioWithWhisper(audioData);
          } catch (error) {
            console.error('Error processing audio:', error);
          }
        }
        
        // Clear chunks and restart if still recording
        audioChunks = [];
        if (isRecording) {
          setTimeout(() => {
            if (isRecording && mediaRecorder.state === 'inactive') {
              mediaRecorder.start();
            }
          }, 100);
        }
      };

      // Start recording and set up 3-second intervals
      mediaRecorder.start();
      
      const recordingInterval = setInterval(() => {
        if (mediaRecorder.state === 'recording' && isRecording) {
          mediaRecorder.stop();
          setTimeout(() => {
            if (isRecording) {
              mediaRecorder.start();
            }
          }, 100);
        }
      }, 3000);

      // Store for cleanup
      (mediaRecorder as any).recordingInterval = recordingInterval;

      setFinalText("");
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Live Whisper transcription enabled." });

    } catch (err) {
      console.error("getUserMedia error", err);
      toast({ title: "Microphone blocked", description: "Allow access.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    toast({ title: "Recording Stopped", description: "Live transcription complete." });
  };

  const toggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const handleProcessTranscription = () => {
    const transcript = finalText.trim();
    if (!transcript) {
      toast({ title: "Error", description: "Record audio first.", variant: "destructive" });
      return;
    }
    processTranscriptionMutation.mutate(transcript);
  };

  const handleFinalizeAndSave = async () => {
    const transcript = finalText.trim();
    if (!transcript) {
      toast({ title: "Error", description: "Record audio first.", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      
      // Create a downloadable file
      const content = `Dental Appointment Transcription
Generated: ${new Date().toLocaleString()}

TRANSCRIPTION:
${transcript}

${treatmentNotes ? `
TREATMENT NOTES:

Chief Complaint: ${treatmentNotes.chief_complaint}

Examination: ${treatmentNotes.examination}

Diagnosis: ${treatmentNotes.diagnosis}

Treatment Plan: ${treatmentNotes.treatment_plan}
` : ''}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment-notes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Notes Saved",
        description: "Appointment notes downloaded as text file",
      });
    } catch (e: any) {
      toast({ 
        title: "Save failed", 
        description: e?.message || "Could not save file", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-load Whisper model when component mounts
  useEffect(() => {
    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      loadWhisperModel();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
      try { audioContextRef.current?.close(); } catch {}
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Voice Recording */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Dental Appointment Notes</h3>
          
          {/* Whisper Model Status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isModelLoaded ? 'bg-green-500' : isModelLoading ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                Whisper AI: {isModelLoaded ? 'Ready' : isModelLoading ? 'Loading...' : 'Not Loaded'}
              </span>
              {!isModelLoaded && !isModelLoading && (
                <Button size="sm" variant="outline" onClick={loadWhisperModel}>
                  <Download className="h-4 w-4 mr-2" />
                  {whisperPipelineRef.current ? 'Retry Load' : 'Load Model'}
                </Button>
              )}
            </div>
            {isModelLoading && (
              <div className="text-xs text-blue-600 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Downloading Whisper model (first time only)...
              </div>
            )}
            {isModelLoaded && (
              <div className="text-xs text-green-600">
                High-quality offline transcription ready
              </div>
            )}
            {!isModelLoaded && !isModelLoading && (
              <div className="text-xs text-amber-600 mt-2">
                ⚠️ If model loading fails, this might be due to network restrictions. 
                The model needs to download from HuggingFace (~40MB first time).
              </div>
            )}
          </div>

          <div className="text-center mb-6">
            <Button
              onClick={toggleRecording}
              disabled={!isModelLoaded}
              className={`w-16 h-16 rounded-full text-2xl mb-4 ${
                isRecording ? "bg-red-700" : isModelLoaded ? "bg-red-600" : "bg-gray-400"
              }`}
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <p className="text-sm text-gray-600">
              {isRecording ? "Recording with Whisper AI..." : 
               isModelLoaded ? "Click to start recording" : 
               "Load Whisper model first"}
            </p>
            {isTranscribing && (
              <p className="text-xs text-blue-600 mt-1">
                <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                Transcribing...
              </p>
            )}
            <div className="border p-3 rounded bg-gray-50 min-h-24 mt-4 text-sm text-gray-700">
              {finalText || <span className="text-gray-400">Whisper transcription will appear here...</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleProcessTranscription} 
              disabled={!finalText || processTranscriptionMutation.isPending}
            >
              <Bot className="h-4 w-4 mr-2" />
              {processTranscriptionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process with AI"
              )}
            </Button>
            <Button onClick={handleFinalizeAndSave} disabled={!finalText || isSaving}>
              {isSaving ? "Saving…" : "Download Notes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI-generated Treatment Notes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI-Generated Treatment Notes</h3>
          {["chief_complaint", "examination", "diagnosis", "treatment_plan"].map(field => (
            <div key={field} className="border p-4 rounded mb-4">
              <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">
                {field.replace("_", " ").toUpperCase()}
              </h4>
              <div className="min-h-16 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {treatmentNotes?.[field as keyof TreatmentNotes] || <span className="text-gray-400">AI will generate...</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
