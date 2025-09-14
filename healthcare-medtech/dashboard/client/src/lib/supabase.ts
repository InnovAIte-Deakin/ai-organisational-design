import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akhfcmkssdvgbpnipvdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFraGZjbWtzc2R2Z2JwbmlwdmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjUwNjE3MCwiZXhwIjoyMDcyMDgyMTcwfQ.PJM0Sji1InpnCAZLY9UdmJr3wtOBYqXJtdnSTvcdMhQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types matching the Supabase schema
export type SupabaseIndividual = {
  id: number;
  created_date: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  identification_num: string;
  email_primary: string;
  address_primary: string;
  address_secondary?: string;
  phone_number: string;
  is_employee: boolean;
};

export type SupabaseAppointment = {
  id: number;
  individual_id: number;
  creation_date: string;
  appointed_date: string;
  was_attended: boolean;
  attendant_id: number;
  assistant_1_id?: number;
  assistant_2_id?: number;
};

export type SupabaseDentistNote = {
  id: number;
  individual_id: number;
  created_date: string;
  title: string;
  text: string;
  appointment_id?: number;
};

export type SupabaseSummary = {
  id: number;
  individual_id: number;
  hash: string;
  summary: string;
  version: number;
  created_date: string;
};

// Supabase service class
export class SupabaseService {
  async searchIndividuals(query?: string, maxResults: number = 30): Promise<SupabaseIndividual[]> {
    if (!query) {
      const { data, error } = await supabase
        .from('Individuals')
        .select('*')
        .eq('is_employee', false)
        .limit(maxResults);
      
      if (error) throw error;
      return data || [];
    }

    // Try ID search first
    const idMatch = query.match(/^\d+$/);
    if (idMatch) {
      const { data, error } = await supabase
        .from('Individuals')
        .select('*')
        .eq('id', parseInt(query))
        .eq('is_employee', false);
      
      if (error) throw error;
      return data || [];
    }

    // Search by name
    const { data: firstNameData, error: firstNameError } = await supabase
      .from('Individuals')
      .select('*')
      .ilike('first_name', `%${query}%`)
      .eq('is_employee', false)
      .limit(maxResults);

    const { data: lastNameData, error: lastNameError } = await supabase
      .from('Individuals')
      .select('*')
      .ilike('last_name', `%${query}%`)
      .eq('is_employee', false)
      .limit(maxResults);

    if (firstNameError && lastNameError) {
      throw firstNameError || lastNameError;
    }

    // Combine and deduplicate results
    const combined = [...(firstNameData || []), ...(lastNameData || [])];
    const unique = combined.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    return unique;
  }

  async getIndividualById(id: number): Promise<SupabaseIndividual | null> {
    const { data, error } = await supabase
      .from('Individuals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getAppointmentHistory(individualId: number): Promise<SupabaseAppointment[]> {
    const { data, error } = await supabase
      .from('Appointment History')
      .select('*')
      .eq('individual_id', individualId)
      .order('appointed_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDentistNotes(individualId: number): Promise<SupabaseDentistNote[]> {
    const { data, error } = await supabase
      .from('Dentist Notes')
      .select('*')
      .eq('individual_id', individualId)
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSummary(individualId: number): Promise<SupabaseSummary | null> {
    const { data, error } = await supabase
      .from('Summaries')
      .select('*')
      .eq('individual_id', individualId)
      .order('created_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching summary:', error);
      throw error;
    }
    
    if (error && error.code === 'PGRST116') {
      // No summary found - this is normal
      return null;
    }
    
    return data;
  }
}

export const supabaseService = new SupabaseService();