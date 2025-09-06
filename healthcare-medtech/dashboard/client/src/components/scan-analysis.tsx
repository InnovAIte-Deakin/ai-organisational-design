import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, FileImage, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, DentalXray } from "@shared/schema";

export default function XrayAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [xrayType, setXrayType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: xrays } = useQuery<DentalXray[]>({
    queryKey: ["/api/dental-xrays"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/dental-xrays", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload X-ray");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dental-xrays"] });
      toast({
        title: "Success",
        description: "Dental X-ray uploaded and analyzed successfully",
      });
      setSelectedFile(null);
      setSelectedPatient("");
      setXrayType("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload dental X-ray",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedPatient || !xrayType) {
      toast({
        title: "Error",
        description: "Please select a file, patient, and X-ray type",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("patientId", selectedPatient);
    formData.append("xrayType", xrayType);

    uploadMutation.mutate(formData);
  };

  const getPatientName = (patientId: string) => {
    return patients?.find(p => p.id === patientId)?.name || "Unknown Patient";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* File Upload Section */}
      <Card data-testid="card-upload-scans">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Dental X-rays</h3>
          
          {/* Patient Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger data-testid="select-patient">
                <SelectValue placeholder="Choose patient..." />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* X-ray Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">X-ray Type</label>
            <Select value={xrayType} onValueChange={setXrayType}>
              <SelectTrigger data-testid="select-xray-type">
                <SelectValue placeholder="Choose X-ray type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bitewing">Bitewing X-Ray</SelectItem>
                <SelectItem value="panoramic">Panoramic X-Ray</SelectItem>
                <SelectItem value="periapical">Periapical X-Ray</SelectItem>
                <SelectItem value="occlusal">Occlusal X-Ray</SelectItem>
                <SelectItem value="cephalometric">Cephalometric X-Ray</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-medical-blue-500 transition-colors">
            <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop X-ray files here, or</p>
            <Button 
              onClick={() => document.getElementById('file-input')?.click()}
              className="bg-medical-blue-600 hover:bg-medical-blue-700"
              data-testid="button-choose-files"
            >
              Choose Files
            </Button>
            <p className="text-xs text-gray-500 mt-2">Supports dental X-ray formats: PNG, JPG, DICOM (Max 50MB)</p>
            <input
              id="file-input"
              type="file"
              accept=".dcm,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-medical-blue-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !selectedPatient || !xrayType || uploadMutation.isPending}
            className="w-full mt-4 bg-medical-blue-600 hover:bg-medical-blue-700"
            data-testid="button-upload-xray"
          >
            <Plus className="h-4 w-4 mr-2" />
            {uploadMutation.isPending ? "Processing..." : "Upload & Analyze"}
          </Button>

          {/* Recent Uploads */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Uploads</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {xrays?.slice(0, 5).map((xray) => (
                <div key={xray.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileImage className="text-medical-blue-600 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-scan-filename-${scan.id}`}>
                        {xray.filename}
                      </p>
                      <p className="text-xs text-gray-600" data-testid={`text-scan-uploadtime-${scan.id}`}>
                        {getPatientName(xray.patientId || "")} • {new Date(xray.uploadedAt!).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    xray.status === "completed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {xray.status === "completed" ? "Processed" : "Processing"}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent uploads</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      <Card data-testid="card-analysis-results">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI X-ray Analysis Results</h3>
          
          {xrays?.filter(xray => xray.aiAnalysis).length ? (
            <div className="space-y-4">
              {xrays
                .filter(xray => xray.aiAnalysis)
                .slice(0, 3)
                .map((xray) => (
                <div key={xray.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900" data-testid={`text-analysis-title-${xray.id}`}>
                        {xray.xrayType} Analysis
                      </h4>
                      <p className="text-xs text-gray-600" data-testid={`text-analysis-patient-${xray.id}`}>
                        Patient: {getPatientName(xray.patientId || "")} | Date: {new Date(xray.uploadedAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (xray.confidence || 0) > 80 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {(scan.confidence || 0) > 80 ? "High Confidence" : "Moderate"}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700"><strong>AI Summary:</strong></p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded" data-testid={`text-analysis-summary-${xray.id}`}>
                      {xray.aiAnalysis}
                    </p>
                    
                    {xray.confidence && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">
                          <strong>Confidence:</strong> {xray.confidence}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all" 
                            style={{ width: `${xray.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileImage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No X-ray analyses yet</p>
              <p className="text-sm text-gray-400">Upload dental X-rays to see AI analysis results</p>
            </div>
          )}

          <Button 
            className="w-full mt-4 bg-medical-blue-600 hover:bg-medical-blue-700" 
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="button-analyze-new-scan"
          >
            <Plus className="h-4 w-4 mr-2" />
            Analyze New X-ray
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
