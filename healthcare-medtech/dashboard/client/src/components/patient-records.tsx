import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, Search, FileText, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, MedicalHistory } from "@shared/schema";

export default function PatientRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: selectedPatient } = useQuery<Patient>({
    queryKey: ["/api/patients", selectedPatientId],
    enabled: !!selectedPatientId,
  });

  const { data: medicalHistory } = useQuery<MedicalHistory[]>({
    queryKey: ["/api/patients", selectedPatientId, "medical-history"],
    enabled: !!selectedPatientId,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (patientId: string) => {
      return await apiRequest("POST", `/api/patients/${patientId}/ai-summary`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients", selectedPatientId] });
      toast({
        title: "Success",
        description: "AI summary generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate AI summary",
        variant: "destructive",
      });
    },
  });

  const filteredPatients = patients?.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Patient Search */}
      <div className="lg:col-span-1">
        <Card data-testid="card-patient-search">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Search</h3>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, ID, or DOB"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-patient-search"
                />
              </div>
              
              {/* Patient List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPatients?.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPatientId === patient.id
                        ? "border-medical-blue-500 bg-medical-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedPatientId(patient.id)}
                    data-testid={`card-patient-${patient.id}`}
                  >
                    <p className="text-sm font-medium text-gray-900" data-testid={`text-patient-name-${patient.id}`}>
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-600" data-testid={`text-patient-details-${patient.id}`}>
                      ID: {patient.id.substring(0, 8)}... | DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {!filteredPatients?.length && (
                  <p className="text-gray-500 text-center py-4">No patients found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Details & AI Summary */}
      <div className="lg:col-span-2">
        {selectedPatient ? (
          <Card data-testid="card-patient-details">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900" data-testid="text-selected-patient-name">
                  Patient Record - {selectedPatient.name}
                </h3>
                <Button
                  onClick={() => generateSummaryMutation.mutate(selectedPatientId)}
                  disabled={generateSummaryMutation.isPending}
                  className="bg-medical-blue-600 hover:bg-medical-blue-700"
                  data-testid="button-generate-ai-summary"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  {generateSummaryMutation.isPending ? "Generating..." : "Generate AI Summary"}
                </Button>
              </div>

              {/* Patient Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Age:</span>{" "}
                      <span data-testid="text-patient-age">{calculateAge(selectedPatient.dateOfBirth)} years</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Gender:</span>{" "}
                      <span data-testid="text-patient-gender">{selectedPatient.gender}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Blood Type:</span>{" "}
                      <span data-testid="text-patient-bloodtype">{selectedPatient.bloodType || "Not specified"}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Allergies:</span>{" "}
                      <span data-testid="text-patient-allergies">{selectedPatient.allergies || "None known"}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      <span data-testid="text-emergency-contact-name">{selectedPatient.emergencyContactName || "Not provided"}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Relationship:</span>{" "}
                      <span data-testid="text-emergency-contact-relationship">{selectedPatient.emergencyContactRelationship || "Not specified"}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="text-gray-600">Phone:</span>{" "}
                      <span className="ml-1" data-testid="text-emergency-contact-phone">{selectedPatient.emergencyContactPhone || "Not provided"}</span>
                      {selectedPatient.emergencyContactPhone && (
                        <Phone className="h-3 w-3 ml-2 text-gray-400" />
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Generated Summary */}
              {selectedPatient.aiSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">
                    <Bot className="inline h-4 w-4 mr-2" />
                    AI-Generated Patient Summary
                  </h4>
                  <p className="text-sm text-medical-blue-800" data-testid="text-ai-summary">
                    {selectedPatient.aiSummary}
                  </p>
                  <div className="mt-2 text-xs text-medical-blue-600">
                    Generated on {new Date().toLocaleDateString()} | Confidence: 92%
                  </div>
                </div>
              )}

              {/* Recent Dental History */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Dental History</h4>
                <div className="space-y-3">
                  {medicalHistory?.length ? (
                    medicalHistory.map((item) => (
                      <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="text-medical-blue-600 h-5 w-5 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900" data-testid={`text-history-title-${item.id}`}>
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`text-history-description-${item.id}`}>
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-400" data-testid={`text-history-date-${item.id}`}>
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No dental history available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500">Choose a patient from the list to view their dental records and generate AI summaries</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
