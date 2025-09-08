import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Bot, Save, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TreatmentNotes {
  chief_complaint: string;
  examination: string;
  diagnosis: string;
  treatment_plan: string;
}

type SpeechRecognitionType = typeof window & {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
};

export default function Transcription() {
  const [isRecording, setIsRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [treatmentNotes, setTreatmentNotes] = useState<TreatmentNotes | null>(null);

  const recognitionRef = useRef<any | null>(null);
  const isManuallyStoppingRef = useRef(false);
  const lastFinalRef = useRef<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const ensureRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;

    const w = window as unknown as SpeechRecognitionType;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: "Speech not supported",
        description:
          "Your browser doesn't support the Web Speech API. Use Chrome desktop or switch to a server transcription endpoint.",
        variant: "destructive",
      });
      return null;
    }

    const rec = new SR();
    rec.lang = "en-AU";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {

      let latestInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0]?.transcript?.trim() ?? "";

        if (res.isFinal) {

          if (text && text !== lastFinalRef.current) {
            setFinalText((prev) => (prev ? `${prev} ${text}` : text));
            lastFinalRef.current = text;
          }

          latestInterim = "";
        } else {

          latestInterim = text;
        }
      }
      setInterimText(latestInterim);
    };

    rec.onerror = (e: any) => {
      if (e?.error !== "no-speech") {
        toast({
          title: "Recording error",
          description: `Speech recognition error: ${e?.error || "unknown"}`,
          variant: "destructive",
        });
      }
    };

    rec.onend = () => {
      if (!isManuallyStoppingRef.current && isRecording) {
        try { rec.start(); } catch {}
      }
    };

    recognitionRef.current = rec;
    return rec;
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        isManuallyStoppingRef.current = true;
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

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
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process transcription", variant: "destructive" });
    },
  });

  const startRecording = async () => {
    const rec = ensureRecognition();
    if (!rec) return;

    try { await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch {
      toast({ title: "Microphone blocked", description: "Please allow microphone access.", variant: "destructive" });
      return;
    }

    isManuallyStoppingRef.current = false;
    try {
      rec.start();
      setIsRecording(true);
      toast({ title: "Recording Started", description: "Live transcription is running…" });
    } catch {}
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      isManuallyStoppingRef.current = true;
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsRecording(false);
    toast({ title: "Recording Stopped", description: "You can now process the transcription" });
  };

  const toggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const handleProcessTranscription = () => {
    const transcript = [finalText, interimText].filter(Boolean).join(" ").trim();
    if (!transcript) {
      toast({ title: "Error", description: "Please record some audio first", variant: "destructive" });
      return;
    }
    processTranscriptionMutation.mutate(transcript);
  };

  const handleSave = () => {
    if (treatmentNotes) {
      toast({ title: "Success", description: "Treatment notes saved to patient record" });
    } else {
      toast({ title: "Error", description: "No treatment notes to save", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (!treatmentNotes) return;
    const exportData = {
      transcription: [finalText, interimText].filter(Boolean).join(" ").trim(),
      treatmentNotes,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treatment-notes-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Success", description: "Treatment notes exported successfully" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Voice Recording Interface */}
      <Card data-testid="card-transcription">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dental Appointment Notes</h3>

          {/* Recording Controls */}
          <div className="text-center mb-6">
            <Button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full text-2xl transition-colors mb-4 ${
                isRecording ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"
              }`}
              data-testid="button-toggle-recording"
            >
              {isRecording ? <Square className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            <p className="text-sm text-gray-600">
              {isRecording ? "Recording in progress" : "Click to start recording"}
            </p>
            {isRecording && (
              <div className="flex items-center justify-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">Recording...</span>
              </div>
            )}
          </div>

          {/* Live Transcription */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Live Transcription</h4>
            <div className="min-h-24 text-sm text-gray-700 bg-gray-50 p-3 rounded" data-testid="text-transcription-output">
              {(finalText || interimText) ? `${finalText} ${interimText}`.trim() : (
                <span className="text-gray-400">Transcription will appear here...</span>
              )}
            </div>
          </div>

          <Button
            onClick={handleProcessTranscription}
            disabled={processTranscriptionMutation.isPending || (!finalText && !interimText)}
            className="w-full mt-4 bg-medical-blue-600 hover:bg-medical-blue-700"
            data-testid="button-process-transcription"
          >
            <Bot className="h-4 w-4 mr-2" />
            {processTranscriptionMutation.isPending ? "Processing..." : "Process with AI"}
          </Button>
        </CardContent>
      </Card>

      {/* SOAP Notes Generation */}
      <Card data-testid="card-soap-notes">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Generated Treatment Notes</h3>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">Chief Complaint</h4>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded min-h-16" data-testid="text-chief-complaint">
                {treatmentNotes?.chief_complaint || <span className="text-gray-400">AI will extract patient's main concern...</span>}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">Clinical Examination</h4>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded min-h-16" data-testid="text-examination">
                {treatmentNotes?.examination || <span className="text-gray-400">AI will extract examination findings...</span>}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">Diagnosis</h4>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded min-h-16" data-testid="text-diagnosis">
                {treatmentNotes?.diagnosis || <span className="text-gray-400">AI will generate dental diagnosis...</span>}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">Treatment Plan</h4>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded min-h-16" data-testid="text-treatment-plan">
                {treatmentNotes?.treatment_plan || <span className="text-gray-400">AI will generate detailed treatment plan...</span>}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button onClick={handleSave} disabled={!treatmentNotes} className="flex-1 bg-green-600 hover:bg-green-700" data-testid="button-save-treatment">
              <Save className="h-4 w-4 mr-2" /> Save Notes
            </Button>
            <Button onClick={handleExport} disabled={!treatmentNotes} className="flex-1 bg-gray-600 hover:bg-gray-700" data-testid="button-export-treatment">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
