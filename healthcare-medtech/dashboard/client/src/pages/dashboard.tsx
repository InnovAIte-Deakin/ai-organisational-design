import { useState } from "react";
import { Stethoscope, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Overview from "@/components/overview";
import XrayAnalysis from "@/components/scan-analysis";
import PatientRecords from "@/components/patient-records";
import Transcription from "@/components/transcription";
import Telemedicine from "@/components/telemedicine";
import Settings from "@/components/settings";

type TabType = "overview" | "xrays" | "records" | "transcription" | "telemedicine" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "fas fa-tachometer-alt" },
    { id: "xrays", label: "X-ray Analysis", icon: "fas fa-x-ray" },
    { id: "records", label: "Patient Records", icon: "fas fa-tooth" },
    { id: "transcription", label: "Appointment Notes", icon: "fas fa-microphone" },
    { id: "telemedicine", label: "Consultations", icon: "fas fa-video" },
    { id: "settings", label: "Settings", icon: "fas fa-cog" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "xrays":
        return <XrayAnalysis />;
      case "records":
        return <PatientRecords />;
      case "transcription":
        return <Transcription />;
      case "telemedicine":
        return <Telemedicine />;
      case "settings":
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Stethoscope className="text-medical-blue-600 h-8 w-8 mr-3" />
                <span className="text-xl font-bold text-gray-900">DentalAI Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-user-md mr-2"></i>
                <span>Dr. Sarah Johnson, DDS</span>
              </div>
              <Button className="bg-medical-blue-600 hover:bg-medical-blue-700" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`border-b-2 whitespace-nowrap py-2 px-1 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-medical-blue-500 text-medical-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
}
