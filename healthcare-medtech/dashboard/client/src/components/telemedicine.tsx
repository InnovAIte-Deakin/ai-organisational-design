import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, CalendarPlus, Video, Phone } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Appointment } from "@shared/schema";

export default function Telemedicine() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("video");
  const [isRecurring, setIsRecurring] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const scheduleAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      return await apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
      // Reset form
      setSelectedPatient("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentType("video");
      setIsRecurring(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    },
  });

  const handleScheduleAppointment = () => {
    if (!selectedPatient || !appointmentDate || !appointmentTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    
    scheduleAppointmentMutation.mutate({
      patientId: selectedPatient,
      appointmentDate: appointmentDateTime.toISOString(),
      type: appointmentType,
      isRecurring,
      status: "scheduled",
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getAppointmentsForDate = (day: number | null) => {
    if (!day || !appointments) return [];
    
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === targetDate.toDateString();
    });
  };

  const getTodayAppointments = () => {
    const today = new Date();
    return appointments?.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === today.toDateString() && apt.status === "scheduled";
    }) || [];
  };

  const getPatientName = (patientId: string) => {
    return patients?.find(p => p.id === patientId)?.name || "Unknown Patient";
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayAppointments = getTodayAppointments();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <div className="lg:col-span-2">
        <Card data-testid="card-telemedicine-calendar">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Dental Consultation Calendar</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={previousMonth}
                  data-testid="button-previous-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={nextMonth}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-4">
              <h4 className="text-center text-lg font-semibold text-gray-900 mb-4" data-testid="text-current-month">
                {monthName}
              </h4>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {/* Calendar Header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="font-medium text-gray-600 p-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                  const appointmentsForDay = getAppointmentsForDate(day);
                  const isToday = day && 
                    currentDate.getMonth() === new Date().getMonth() && 
                    currentDate.getFullYear() === new Date().getFullYear() && 
                    day === new Date().getDate();
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 min-h-12 border rounded cursor-pointer transition-colors ${
                        !day 
                          ? "text-gray-400" 
                          : isToday
                          ? "bg-medical-blue-100 border-medical-blue-300 font-medium"
                          : appointmentsForDay.length > 0
                          ? "bg-green-100 border-green-300 font-medium"
                          : "hover:bg-blue-50"
                      }`}
                      data-testid={day ? `calendar-day-${day}` : `calendar-empty-${index}`}
                    >
                      <div className="text-sm">{day || ""}</div>
                      {appointmentsForDay.length > 0 && (
                        <div className="text-xs text-green-700">
                          {appointmentsForDay.length} apt{appointmentsForDay.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-medical-blue-100 border border-medical-blue-300 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>Appointments</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Management */}
      <div className="space-y-6">
        {/* Quick Schedule */}
        <Card data-testid="card-schedule-appointment">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Schedule Dental Consultation</h4>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger data-testid="select-appointment-patient">
                    <SelectValue placeholder="Select patient..." />
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="input-appointment-date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  data-testid="input-appointment-time"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger data-testid="select-appointment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Video Consultation</SelectItem>
                    <SelectItem value="followup">Follow-up Call</SelectItem>
                    <SelectItem value="emergency">Emergency Consult</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked === true)}
                  data-testid="checkbox-recurring"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  Recurring appointment
                </label>
              </div>
              
              <Button
                onClick={handleScheduleAppointment}
                disabled={scheduleAppointmentMutation.isPending}
                className="w-full bg-medical-blue-600 hover:bg-medical-blue-700"
                data-testid="button-schedule-appointment"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                {scheduleAppointmentMutation.isPending ? "Scheduling..." : "Schedule"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card data-testid="card-today-sessions">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Today's Consultations</h4>
            <div className="space-y-3">
              {todayAppointments.length > 0 ? (
                todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-session-patient-${appointment.id}`}>
                        {getPatientName(appointment.patientId!)}
                      </p>
                      <p className="text-xs text-gray-600" data-testid={`text-session-details-${appointment.id}`}>
                        {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {appointment.type}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={
                        appointment.type === 'video' 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                      data-testid={`button-join-session-${appointment.id}`}
                    >
                      {appointment.type === 'video' ? (
                        <>
                          <Video className="h-3 w-3 mr-1" />
                          Join
                        </>
                      ) : (
                        <>
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </>
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No consultations scheduled for today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
