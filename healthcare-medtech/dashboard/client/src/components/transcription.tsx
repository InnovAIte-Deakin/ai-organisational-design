import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast"; 
import { Mic, Square, Bot, Loader2, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

interface SOAPNotes {
  s: string; // Subjective
  o: string; // Objective
  a: string; // Assessment
  p: string; // Plan
}

interface ProgressItem {
  file: string;
  loaded: number;
  progress: number;
  total: number;
  name: string;
  status: string;
}

interface TranscriberData {
  isBusy: boolean;
  text: string;
  chunks: { text: string; timestamp: [number, number | null] }[];
}

// Web Worker for Whisper transcription
const createTranscriptionWorker = () => {
  const workerCode = `
    import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js";

    // Disable local models
    env.allowLocalModels = false;

    class PipelineFactory {
      static task = null;
      static model = null;
      static quantized = null;
      static instance = null;

      static async getInstance(progress_callback = null) {
        if (this.instance === null) {
          this.instance = pipeline(this.task, this.model, {
            quantized: this.quantized,
            progress_callback,
            revision: this.model.includes("/whisper-medium") ? "no_attentions" : "main"
          });
        }
        return this.instance;
      }
    }

    class AutomaticSpeechRecognitionPipelineFactory extends PipelineFactory {
      static task = "automatic-speech-recognition";
      static model = null;
      static quantized = null;
    }

    const transcribe = async (audio, model, multilingual, quantized, subtask, language) => {
      const isDistilWhisper = model.startsWith("distil-whisper/");
      let modelName = model;
      if (!isDistilWhisper && !multilingual) {
        modelName += ".en"
      }

      const p = AutomaticSpeechRecognitionPipelineFactory;
      if (p.model !== modelName || p.quantized !== quantized) {
        p.model = modelName;
        p.quantized = quantized;
        if (p.instance !== null) {
          (await p.getInstance()).dispose();
          p.instance = null;
        }
      }

      let transcriber = await p.getInstance((data) => {
        self.postMessage(data);
      });

      const time_precision = transcriber.processor.feature_extractor.config.chunk_length / transcriber.model.config.max_source_positions;

      let chunks_to_process = [{ tokens: [], finalised: false }];

      function chunk_callback(chunk) {
        let last = chunks_to_process[chunks_to_process.length - 1];
        Object.assign(last, chunk);
        last.finalised = true;
        if (!chunk.is_last) {
          chunks_to_process.push({ tokens: [], finalised: false });
        }
      }

      function callback_function(item) {
        let last = chunks_to_process[chunks_to_process.length - 1];
        last.tokens = [...item[0].output_token_ids];
        let data = transcriber.tokenizer._decode_asr(chunks_to_process, {
          time_precision: time_precision,
          return_timestamps: true,
          force_full_sequences: false,
        });
        self.postMessage({
          status: "update",
          task: "automatic-speech-recognition",
          data: data,
        });
      }

      let output = await transcriber(audio, {
        top_k: 0,
        do_sample: false,
        chunk_length_s: isDistilWhisper ? 20 : 30,
        stride_length_s: isDistilWhisper ? 3 : 5,
        language: language,
        task: subtask,
        return_timestamps: true,
        force_full_sequences: false,
        callback_function: callback_function,
        chunk_callback: chunk_callback,
      }).catch((error) => {
        self.postMessage({
          status: "error",
          task: "automatic-speech-recognition",
          data: error,
        });
        return null;
      });

      return output;
    };

    self.addEventListener("message", async (event) => {
      const message = event.data;
      let transcript = await transcribe(
        message.audio,
        message.model,
        message.multilingual,
        message.quantized,
        message.subtask,
        message.language,
      );
      if (transcript === null) return;
      self.postMessage({
        status: "complete",
        task: "automatic-speech-recognition",
        data: transcript,
      });
    });
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob), { type: 'module' });
};

function dedupeAppend(prev: string, next: string, overlapWords = 12) {
  const p = prev.trim();
  const n = next.trim();
  
  // If previous is empty, return next
  if (!p) return n;
  
  // If next is empty or same as previous, return previous
  if (!n || p === n) return p;
  
  // If next is completely contained in previous, return previous
  if (p.toLowerCase().includes(n.toLowerCase())) return p;
  
  // If previous is completely contained in next, return next
  if (n.toLowerCase().includes(p.toLowerCase())) return n;
  
  // Try to find overlap at the end of previous and beginning of next
  const pWords = p.split(/\s+/);
  const nWords = n.split(/\s+/);
  
  // Look for overlap with different word counts
  for (let overlap = Math.min(overlapWords, pWords.length, nWords.length); overlap > 0; overlap--) {
    const pTail = pWords.slice(-overlap).join(" ").toLowerCase();
    const nHead = nWords.slice(0, overlap).join(" ").toLowerCase();
    
    if (pTail === nHead) {
      // Found overlap, merge by removing the overlapping part from next
      const remainingNext = nWords.slice(overlap).join(" ");
      return remainingNext ? (p + " " + remainingNext).trim() : p;
    }
  }
  
  // No overlap found, check if next starts with any part of previous end
  const lastSentence = p.split(/[.!?]/).pop()?.trim() || "";
  if (lastSentence && n.toLowerCase().startsWith(lastSentence.toLowerCase())) {
    // Next starts with the last sentence of previous, replace the last sentence
    const beforeLastSentence = p.substring(0, p.lastIndexOf(lastSentence)).trim();
    return beforeLastSentence ? (beforeLastSentence + " " + n).trim() : n;
  }
  
  // No overlap, append with space
  return (p + " " + n).trim();
}

// Smart text merger for streaming transcription
function smartMergeTranscription(current: string, newChunk: string): string {
  const c = current.trim();
  const n = newChunk.trim();
  
  // If current is empty, use new chunk
  if (!c) return n;
  
  // If new chunk is empty, keep current
  if (!n) return c;
  
  // If new chunk is much longer and contains current, it's likely a replacement
  if (n.length > c.length * 1.5 && n.toLowerCase().includes(c.toLowerCase())) {
    return n;
  }
  
  // Use deduplication for incremental updates
  return dedupeAppend(c, n);
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
  const [liveText, setLiveText] = useState(""); // For real-time display
  const [editableText, setEditableText] = useState(""); // For editable transcription
  const [treatmentNotes, setTreatmentNotes] = useState<TreatmentNotes | null>(null);
  const [soapNotes, setSoapNotes] = useState<SOAPNotes | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [transcript, setTranscript] = useState<TranscriberData | undefined>(undefined);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const lastProcessedTextRef = useRef<string>("");
  const { toast } = useToast();

  // Configuration
  const model = "Xenova/whisper-tiny";
  const quantized = true;
  const multilingual = false;
  const subtask = "transcribe";
  const language = "english";

  // Initialize web worker for transcription
  const initializeWorker = useCallback(() => {
    if (workerRef.current) return;

    try {
      console.log('🚀 Initializing Whisper Web Worker...');
      const worker = createTranscriptionWorker();
      
      worker.addEventListener("message", (event) => {
        const message = event.data;
        console.log('Worker message:', message.status);
        
        switch (message.status) {
          case "progress":
            setProgressItems((prev) =>
              prev.map((item) => {
                if (item.file === message.file) {
                  return { ...item, progress: message.progress };
                }
                return item;
              }),
            );
            break;
          case "update":
            const updateMessage = message;
            const newText = updateMessage.data[0];
            
            // Skip if this is the same text we just processed
            if (newText === lastProcessedTextRef.current) {
              break;
            }
            lastProcessedTextRef.current = newText;
            
            setTranscript({
              isBusy: true,
              text: newText,
              chunks: updateMessage.data[1].chunks,
            });
            
            // For live text, show just the new part or latest sentence
            const sentences = newText.split(/[.!?]+/).filter(s => s.trim());
            const latestSentence = sentences[sentences.length - 1]?.trim() || newText;
            setLiveText(latestSentence);
            
            // For editable text, use smart merging to avoid repetition
            setEditableText(prev => {
              const merged = smartMergeTranscription(prev, newText);
              return merged;
            });
            
            // Update final text with the same smart merging
            setFinalText(prev => {
              const merged = smartMergeTranscription(prev, newText);
              return merged;
            });
            break;
            
          case "complete":
            const completeMessage = message;
            const completedText = completeMessage.data.text;
            setTranscript({
              isBusy: false,
              text: completedText,
              chunks: completeMessage.data.chunks,
            });
            
            // Clear live text when complete
            setLiveText("");
            
            // For completion, use smart merging to ensure we have the final, clean text
            setFinalText(prev => {
              const merged = smartMergeTranscription(prev, completedText);
              return merged;
            });
            setEditableText(prev => {
              const merged = smartMergeTranscription(prev, completedText);
              return merged;
            });
            setIsTranscribing(false);
            break;
          case "initiate":
            setIsModelLoading(true);
            setProgressItems((prev) => [...prev, message]);
            break;
          case "ready":
            setIsModelLoading(false);
            setIsModelLoaded(true);
            toast({
              title: "Whisper Model Loaded",
              description: "Ready for high-quality client-side transcription",
            });
            break;
          case "error":
            setIsTranscribing(false);
            setIsModelLoading(false);
            console.error('Worker error:', message.data);
            toast({
              title: "Transcription Error",
              description: message.data.message || "Transcription failed",
              variant: "destructive",
            });
            break;
          case "done":
            setProgressItems((prev) =>
              prev.filter((item) => item.file !== message.file),
            );
            break;
        }
      });

      workerRef.current = worker;
      setIsModelLoaded(true);
      console.log('✅ Web Worker initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize worker:', error);
      toast({
        title: "Worker Initialization Failed",
        description: "Could not initialize transcription worker",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Transcribe audio with Web Worker
  const transcribeAudioWithWorker = useCallback((audioBuffer: AudioBuffer) => {
    if (!workerRef.current) {
      console.warn('Worker not initialized');
      return;
    }

    try {
      setIsTranscribing(true);
      
      // Convert stereo to mono if needed
      let audio;
      if (audioBuffer.numberOfChannels === 2) {
        const SCALING_FACTOR = Math.sqrt(2);
        let left = audioBuffer.getChannelData(0);
        let right = audioBuffer.getChannelData(1);
        audio = new Float32Array(left.length);
        for (let i = 0; i < audioBuffer.length; ++i) {
          audio[i] = SCALING_FACTOR * (left[i] + right[i]) / 2;
        }
      } else {
        audio = audioBuffer.getChannelData(0);
      }

      // Send to worker
      workerRef.current.postMessage({
        audio,
        model,
        multilingual,
        quantized,
        subtask: multilingual ? subtask : null,
        language: multilingual && language !== "auto" ? language : null,
      });
      
    } catch (error) {
      console.error('Failed to send audio to worker:', error);
      setIsTranscribing(false);
    }
  }, [model, multilingual, quantized, subtask, language]);

  const processTranscriptionMutation = useMutation({
    mutationFn: async (transcription: string) => {
      // Generate a temporary record ID (in a real app, this would come from the patient record)
      const record_id = Date.now(); // Using timestamp as temporary ID
      
      const result = await apiRequest(
        "POST",
        "/api/transcription/process",
        { 
          record_id: record_id,
          transcription: transcription 
        }
      );
      return result;
    },
    onSuccess: (data: any) => {
      if (data.success && data.soapNotes) {
        setSoapNotes(data.soapNotes);
        toast({ 
          title: "SOAP Notes Generated", 
          description: "Transcription processed and SOAP notes generated successfully" 
        });
      } else {
        toast({ 
          title: "Processing Complete", 
          description: "Transcription processed but no SOAP notes generated" 
        });
      }
    },
    onError: (error: any) => {
      console.error('Transcription processing error:', error);
      toast({ 
        title: "Processing Failed", 
        description: error.message || "Failed to process transcription with AI", 
        variant: "destructive" 
      });
    },
  });

  const startRecording = async () => {
    if (!workerRef.current) {
      toast({ 
        title: "Worker Not Ready", 
        description: "Please wait for the transcription worker to initialize.", 
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

      // Create audio context for processing
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      
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
        if (audioChunks.length > 0 && isRecordingRef.current && audioContextRef.current) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          try {
            const arrayBuffer = await audioBlob.arrayBuffer();
            
            if (arrayBuffer.byteLength === 0) {
              console.warn('Empty audio buffer received');
              return;
            }

            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            
            if (audioBuffer.length === 0) {
              console.warn('No audio data in buffer');
              return;
            }
            
            // Send to worker for transcription
            transcribeAudioWithWorker(audioBuffer);
          } catch (error) {
            console.error('Error processing audio:', error);
          }
        }
        
        // Clear chunks and restart if still recording
        audioChunks = [];
        if (isRecordingRef.current && mediaRecorder.state === 'inactive') {
          setTimeout(() => {
            if (isRecordingRef.current && mediaRecorder.state === 'inactive') {
              try {
                mediaRecorder.start();
              } catch (error) {
                console.warn('Failed to restart recording:', error);
              }
            }
          }, 50);
        }
      };

      // Start recording and set up intervals
      mediaRecorder.start();
      
      const recordingInterval = setInterval(() => {
        if (mediaRecorder.state === 'recording' && isRecordingRef.current) {
          mediaRecorder.stop();
          setTimeout(() => {
            if (isRecordingRef.current && mediaRecorder.state === 'inactive') {
              try {
                mediaRecorder.start();
              } catch (error) {
                console.warn('Failed to restart recording:', error);
              }
            }
          }, 50);
        }
      }, 3000); // 3 second chunks for better transcription

      // Store for cleanup
      (mediaRecorder as any).recordingInterval = recordingInterval;
      if (!(window as any).recordingIntervals) {
        (window as any).recordingIntervals = [];
      }
      (window as any).recordingIntervals.push(recordingInterval);

      // Don't clear existing text when starting recording - extend instead
      setLiveText("");
      setTranscript(undefined);
      lastProcessedTextRef.current = ""; // Reset the last processed text
      setIsRecording(true);
      isRecordingRef.current = true;
      toast({ title: "Recording Started", description: "Live client-side transcription enabled." });

    } catch (err) {
      console.error("getUserMedia error", err);
      toast({ title: "Microphone blocked", description: "Allow access.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setLiveText(""); // Clear live text when stopping
    
    // Clear any recording intervals first
    const allIntervals = (window as any).recordingIntervals || [];
    allIntervals.forEach((interval: number) => clearInterval(interval));
    (window as any).recordingIntervals = [];
    
    // Stop the media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    // Close audio context after a delay to allow any pending processing to complete
    setTimeout(() => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }, 1000);

    // Update final text with the current editable text
    setFinalText(editableText);

    toast({ title: "Recording Stopped", description: "Live transcription complete." });
  };

  const toggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const handleProcessTranscription = () => {
    const transcript = (editableText || finalText).trim();
    if (!transcript) {
      toast({ title: "Error", description: "Record audio first.", variant: "destructive" });
      return;
    }
    processTranscriptionMutation.mutate(transcript);
  };

  const handleFinalizeAndSave = async () => {
    const transcript = (editableText || finalText).trim();
    if (!transcript) {
      toast({ title: "Error", description: "Record audio first.", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      
      // Create a downloadable file
      const content = `Dental Appointment Transcription & SOAP Notes
Generated: ${new Date().toLocaleString()}

TRANSCRIPTION:
${transcript}

${soapNotes ? `
SOAP NOTES:

SUBJECTIVE:
${soapNotes.s}

OBJECTIVE:
${soapNotes.o}

ASSESSMENT:
${soapNotes.a}

PLAN:
${soapNotes.p}
` : ''}`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soap-notes-${new Date().toISOString().split('T')[0]}.txt`;
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

  // Initialize worker when component mounts
  useEffect(() => {
    initializeWorker();
    
    return () => {
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
      try { audioContextRef.current?.close(); } catch {}
      try { workerRef.current?.terminate(); } catch {}
    };
  }, [initializeWorker]);

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
                Whisper AI: {isModelLoaded ? 'Ready' : isModelLoading ? 'Loading...' : 'Initializing...'}
              </span>
            </div>
            {isModelLoading && (
              <div className="text-xs text-blue-600 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Downloading Whisper model (first time only)...
              </div>
            )}
            {isModelLoaded && (
              <div className="text-xs text-green-600">
                Client-side transcription ready with Web Worker
              </div>
            )}
            {!isModelLoaded && !isModelLoading && (
              <div className="text-xs text-blue-600 mt-2">
                🔄 Initializing Web Worker for client-side transcription...
              </div>
            )}
          </div>

          {/* Progress Items */}
          {progressItems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">Loading model files...</div>
              {progressItems.map((item) => (
                <div key={item.file} className="mb-2">
                  <div className="flex justify-between text-xs text-blue-600 mb-1">
                    <span>{item.file}</span>
                    <span>{Math.round(item.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1">
                    <div 
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${item.progress * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
            {/* Live transcription display */}
            {isRecording && (
              <div className="border-2 border-blue-300 rounded bg-blue-50 mt-4">
                <div className="text-xs text-blue-600 p-2 pb-1 font-medium">Live transcription (editable):</div>
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  placeholder={isTranscribing ? "Processing audio..." : "Listening..."}
                  className="w-full min-h-16 p-2 pt-0 text-sm text-gray-700 bg-transparent border-none resize-none focus:outline-none"
                  style={{ minHeight: '64px' }}
                />
                {isTranscribing && (
                  <div className="px-2 pb-2">
                    <span className="text-xs text-blue-500 italic flex items-center">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Processing...
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Full accumulated transcription - also editable when not recording */}
            <div className="border rounded bg-gray-50 mt-4">
              <div className="text-xs text-gray-600 p-2 pb-1 font-medium">
                {isRecording ? "Current session transcription:" : "Full transcription (editable):"}
              </div>
              <textarea
                value={isRecording ? editableText : (editableText || finalText)}
                onChange={(e) => {
                  if (isRecording) {
                    setEditableText(e.target.value);
                  } else {
                    setEditableText(e.target.value);
                    setFinalText(e.target.value);
                  }
                }}
                placeholder="Complete transcription will appear here..."
                className="w-full min-h-24 p-2 pt-0 text-sm text-gray-700 bg-transparent border-none resize-none focus:outline-none"
                style={{ minHeight: '96px' }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleProcessTranscription} 
              disabled={!(editableText || finalText) || processTranscriptionMutation.isPending}
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
            <Button onClick={handleFinalizeAndSave} disabled={!(editableText || finalText) || isSaving}>
              {isSaving ? "Saving…" : "Download Notes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI-generated SOAP Notes */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI-Generated SOAP Notes</h3>
          
          {/* Subjective */}
          <div className="border p-4 rounded mb-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">S</span>
              SUBJECTIVE
            </h4>
            <div className="min-h-16 text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {soapNotes?.s || <span className="text-gray-400">Patient's reported symptoms and concerns will appear here...</span>}
            </div>
          </div>

          {/* Objective */}
          <div className="border p-4 rounded mb-4">
            <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs mr-2">O</span>
              OBJECTIVE
            </h4>
            <div className="min-h-16 text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {soapNotes?.o || <span className="text-gray-400">Clinical observations and examination findings will appear here...</span>}
            </div>
          </div>

          {/* Assessment */}
          <div className="border p-4 rounded mb-4">
            <h4 className="text-sm font-semibold text-orange-900 mb-2 flex items-center">
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs mr-2">A</span>
              ASSESSMENT
            </h4>
            <div className="min-h-16 text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {soapNotes?.a || <span className="text-gray-400">Clinical diagnosis and assessment will appear here...</span>}
            </div>
          </div>

          {/* Plan */}
          <div className="border p-4 rounded mb-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs mr-2">P</span>
              PLAN
            </h4>
            <div className="min-h-16 text-sm text-gray-700 bg-gray-50 p-3 rounded">
              {soapNotes?.p || <span className="text-gray-400">Treatment plan and next steps will appear here...</span>}
            </div>
          </div>

          {/* Processing Status */}
          {processTranscriptionMutation.isPending && (
            <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Processing transcription with AI...</span>
              </div>
              <p className="text-blue-600 text-sm text-center mt-2">
                Generating SOAP notes from your transcription
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
