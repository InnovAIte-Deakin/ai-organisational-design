import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  activePatients: number;
  todayAppointments: number;
  aiAnalyses: number;
  recentSummaries: Array<{
    patientName: string;
    summary: string;
    timestamp: string;
  }>;
  upcomingAppointments: Array<{
    patientName: string;
    type: string;
    time: string;
  }>;
}

export default function Overview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-4" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-active-patients">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="text-medical-blue-600 h-8 w-8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-active-patients">
                  {stats?.activePatients || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-today-appointments">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="text-green-600 h-8 w-8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-today-appointments">
                  {stats?.todayAppointments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-ai-analyses">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Brain className="text-purple-600 h-8 w-8" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">X-ray Analyses</p>
                <p className="text-2xl font-bold text-gray-900" data-testid="text-ai-analyses">
                  {stats?.aiAnalyses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent X-ray Analyses</h3>
          </div>
          <CardContent className="p-6">
            {stats?.recentSummaries.length ? (
              <div className="space-y-4">
                {stats.recentSummaries.map((summary, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <i className="fas fa-robot text-medical-blue-600 mt-1"></i>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900" data-testid={`text-summary-patient-${index}`}>
                        {summary.patientName}
                      </p>
                      <p className="text-sm text-gray-600" data-testid={`text-summary-content-${index}`}>
                        {summary.summary}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(summary.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent X-ray analyses</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
          </div>
          <CardContent className="p-6">
            {stats?.upcomingAppointments.length ? (
              <div className="space-y-4">
                {stats.upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${
                        appointment.type === 'video' ? 'fa-video text-purple-600' : 'fa-clock text-medical-blue-600'
                      }`}></i>
                      <div>
                        <p className="text-sm font-medium text-gray-900" data-testid={`text-appointment-patient-${index}`}>
                          {appointment.patientName}
                        </p>
                        <p className="text-xs text-gray-600" data-testid={`text-appointment-type-${index}`}>
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-medical-blue-600 font-medium" data-testid={`text-appointment-time-${index}`}>
                      {new Date(appointment.time).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
