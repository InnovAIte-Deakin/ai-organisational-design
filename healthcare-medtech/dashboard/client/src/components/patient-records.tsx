import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Bot, Search, FileText, Phone, Calendar, User } from "lucide-react";
import { supabaseService, type SupabaseIndividual, type SupabaseAppointment, type SupabaseDentistNote, type SupabaseSummary } from "@/lib/supabase";

export default function PatientRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients, isLoading: patientsLoading } = useQuery<SupabaseIndividual[]>({
    queryKey: ["supabase-patients", searchQuery],
    queryFn: () => supabaseService.searchIndividuals(searchQuery || undefined),
  });

  const { data: selectedPatient } = useQuery<SupabaseIndividual | null>({
    queryKey: ["supabase-patient", selectedPatientId],
    queryFn: () => selectedPatientId ? supabaseService.getIndividualById(selectedPatientId) : null,
    enabled: !!selectedPatientId,
  });

  const { data: appointments } = useQuery<SupabaseAppointment[]>({
    queryKey: ["supabase-appointments", selectedPatientId],
    queryFn: () => selectedPatientId ? supabaseService.getAppointmentHistory(selectedPatientId) : [],
    enabled: !!selectedPatientId,
  });

  const { data: dentistNotes } = useQuery<SupabaseDentistNote[]>({
    queryKey: ["supabase-notes", selectedPatientId],
    queryFn: () => selectedPatientId ? supabaseService.getDentistNotes(selectedPatientId) : [],
    enabled: !!selectedPatientId,
  });

  const { data: patientSummary } = useQuery<SupabaseSummary | null>({
    queryKey: ["supabase-summary", selectedPatientId],
    queryFn: () => selectedPatientId ? supabaseService.getSummary(selectedPatientId) : null,
    enabled: !!selectedPatientId,
  });

  const generateSummaryMutation = useMutation({
    mutationFn: async (patientId: number) => {
      console.log(`🤖 Generating AI summary for patient ${patientId}...`);
      
      // Call the server endpoint which will trigger MCP
      const response = await fetch(`/api/patients/${patientId}/ai-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to generate AI summary`);
      }
      
      const result = await response.json();
      console.log('✅ AI summary response:', result);
      return result;
    },
    onSuccess: (data, patientId) => {
      console.log(`🔄 Invalidating queries for patient ${patientId}...`);
      
      // Invalidate both the summary query and the patient query
      queryClient.invalidateQueries({ queryKey: ["supabase-summary", patientId] });
      queryClient.invalidateQueries({ queryKey: ["supabase-patient", patientId] });
      
      // Also refetch the summary directly
      queryClient.refetchQueries({ queryKey: ["supabase-summary", patientId] });
      
      toast({
        title: "Success",
        description: "AI summary generated successfully via MCP",
      });
    },
    onError: (error) => {
      console.error('❌ AI summary generation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI summary",
        variant: "destructive",
      });
    },
  });

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSummaryText = (text: string) => {
    if (!text) return [];
    
    // Split by newlines and create JSX elements
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      if (!line.trim()) {
        // Empty line - add spacing
        return <div key={index} className="h-2"></div>;
      }
      
      // Check if it's a numbered section
      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={index} className="font-semibold text-medical-blue-900 mt-4 mb-2">
            {line.trim()}
          </div>
        );
      }
      
      // Check indentation level and content
      const leadingSpaces = line.length - line.trimStart().length;
      let marginClass = '';
      let textSize = 'text-sm';
      
      if (leadingSpaces >= 6) {
        marginClass = 'ml-8';
        textSize = 'text-xs';
      } else if (leadingSpaces >= 3) {
        marginClass = 'ml-4';
      }
      
      return (
        <div key={index} className={`${marginClass} ${textSize} mb-1`}>
          {line.trim()}
        </div>
      );
    });
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
                {patientsLoading ? (
                  <p className="text-gray-500 text-center py-4">Loading patients...</p>
                ) : patients?.map((patient) => (
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
                      {patient.first_name} {patient.last_name}
                    </p>
                    <p className="text-xs text-gray-600" data-testid={`text-patient-details-${patient.id}`}>
                      ID: {patient.id} | DOB: {formatDate(patient.date_of_birth)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {patient.email_primary} | {patient.phone_number}
                    </p>
                  </div>
                ))}
                {!patientsLoading && !patients?.length && (
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
                  Patient Record - {selectedPatient.first_name} {selectedPatient.last_name}
                </h3>
                <Button
                  onClick={() => selectedPatientId && generateSummaryMutation.mutate(selectedPatientId)}
                  disabled={generateSummaryMutation.isPending || !selectedPatientId}
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
                      <span data-testid="text-patient-age">{calculateAge(selectedPatient.date_of_birth)} years</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Date of Birth:</span>{" "}
                      <span data-testid="text-patient-dob">{formatDate(selectedPatient.date_of_birth)}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">ID Number:</span>{" "}
                      <span data-testid="text-patient-id-num">{selectedPatient.identification_num}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      <span data-testid="text-patient-email">{selectedPatient.email_primary}</span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <span className="text-gray-600">Phone:</span>{" "}
                      <span className="ml-1" data-testid="text-patient-phone">{selectedPatient.phone_number}</span>
                      <Phone className="h-3 w-3 ml-2 text-gray-400" />
                    </p>
                    <p>
                      <span className="text-gray-600">Primary Address:</span>{" "}
                      <span data-testid="text-patient-address-primary">{selectedPatient.address_primary}</span>
                    </p>
                    {selectedPatient.address_secondary && (
                      <p>
                        <span className="text-gray-600">Secondary Address:</span>{" "}
                        <span data-testid="text-patient-address-secondary">{selectedPatient.address_secondary}</span>
                      </p>
                    )}
                    <p>
                      <span className="text-gray-600">Patient Since:</span>{" "}
                      <span data-testid="text-patient-created">{formatDate(selectedPatient.created_date)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Generated Summary */}
              {patientSummary ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-medical-blue-900 mb-2">
                    <Bot className="inline h-4 w-4 mr-2" />
                    AI-Generated Patient Summary (v{patientSummary.version})
                  </h4>
                  
                  {/* Debug: Show raw data */}
                  <details className="mb-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">Debug: Full Patient Summary Object</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-1 overflow-auto">
                      {JSON.stringify(patientSummary, null, 2)}
                    </pre>
                  </details>
                  
                  <div 
                    className="text-sm text-medical-blue-800 leading-relaxed" 
                    data-testid="text-ai-summary"
                  >
                    {formatSummaryText(patientSummary.summary)}
                  </div>
                  <div className="mt-2 text-xs text-medical-blue-600">
                    Generated on {formatDate(patientSummary.created_date)} | Version: {patientSummary.version} | Hash: {patientSummary.hash.substring(0, 8)}...
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    <Bot className="inline h-4 w-4 mr-2" />
                    No AI Summary Available
                  </h4>
                  <p className="text-sm text-gray-600">
                    Click "Generate AI Summary" to create an AI-powered summary of this patient's medical records.
                  </p>
                </div>
              )}

              {/* Recent Appointments */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Appointments</h4>
                <div className="space-y-3">
                  {appointments?.length ? (
                    appointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="text-medical-blue-600 h-5 w-5 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900" data-testid={`text-appointment-date-${appointment.id}`}>
                            {formatDate(appointment.appointed_date)}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`text-appointment-status-${appointment.id}`}>
                            {appointment.was_attended ? "Attended" : "Scheduled"} | Attendant ID: {appointment.attendant_id}
                          </p>
                          <p className="text-xs text-gray-400" data-testid={`text-appointment-created-${appointment.id}`}>
                            Created: {formatDate(appointment.creation_date)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No appointments found</p>
                  )}
                </div>
              </div>

              {/* Dentist Notes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Clinical Notes</h4>
                <div className="space-y-3">
                  {dentistNotes?.length ? (
                    dentistNotes.slice(0, 5).map((note) => (
                      <div key={note.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="text-medical-blue-600 h-5 w-5 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900" data-testid={`text-note-title-${note.id}`}>
                            {note.title}
                          </p>
                          <p className="text-sm text-gray-600" data-testid={`text-note-text-${note.id}`}>
                            {note.text.length > 200 ? `${note.text.substring(0, 200)}...` : note.text}
                          </p>
                          <p className="text-xs text-gray-400" data-testid={`text-note-date-${note.id}`}>
                            {formatDate(note.created_date)}
                            {note.appointment_id && ` | Appointment: ${note.appointment_id}`}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No clinical notes available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500">Choose a patient from the search results to view their medical records, appointments, and clinical notes</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
