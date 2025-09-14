
import { createClient } from '@supabase/supabase-js';
import assert from 'assert';
import { escape } from 'querystring';

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_KEY as string;

assert(url !== undefined, "Supabase URL must be set!");
assert(key !== undefined, "Supabase KEY must be set!");

type IndividualRecord = {
    id: number
    created_date: string
    first_name: string
    last_name: string
    date_of_birth: string
    identification_number: string
    email_primray: string
    address_primary: string
    address_secondary: string
    phone_number: string
    is_employee: boolean
}

type StaffRecord = IndividualRecord & {
    individual_id: number
    background_id: string
}

type AppointmentHistory = {
    id: number
    individual_id: number
    creation_date: string
    appointed_date: string
    was_attended: boolean
    attendant_id: number
    assistant_1_id: number
    assistant_2_id: number
}

type DentistNotes = {
    id: number
    individual_id: number
    created_date: string
    title: string
    text: string
    appointment_id: number | undefined
}

type IndividualSummary = {
    id: number
    individual_id: number
    summary: string
    version: number
    hash: string
    created_date: string
}

class MedTechSupabase {
    url: string;
    key: string;
    client: any;

    constructor(url: string, key: string) {
        this.url = url;
        this.key = key;

        this.client = createClient(url, key);
    }

    async get_total_patients() : Promise<number> {
        let filter = await this.client.from("Individuals").select().eq("is_staff", false);
        let count = filter.count || 0;
        return count;
    }

    async get_total_staff() : Promise<number> {
        let filter = await this.client.from("Individuals").select().eq("is_staff", true);
        let count = filter.count || 0;
        return count;
    }

    // search id, date of birth, or first/last name
    async search_individual(filter_string: string | undefined, max_results: number = 30, include_employees: boolean = false) : Promise<Array<IndividualRecord>> {
        // default result
        if (filter_string == undefined)  return [];

        // id filter (number)
        try {
            const id = Number.parseInt(filter_string);
            console.log(id);
            let search = await this.client.from("Individuals").select().eq("id", id).range(0, max_results);
            return search.data || [];
        } catch(e) {}

        // first/last name filter
        filter_string = escape(filter_string); // escape special characters
        let search_first = await this.client.from("Individuals").select().like("first_name", filter_string).range(0, max_results);
        let search_last = await this.client.from("Individuals").select().like("last_name", filter_string).range(0, max_results);
        if (search_first.data && search_last.data) {
            return search_first.data.concat(search_last.data);
        } else if (search_first.data && search_last.data == undefined) {
            return search_first.data;
        } else if (search_last.data && search_first.data == undefined) {
            return search_last.data;
        }
        return [];
    }

    async search_staff(id: number) : Promise<StaffRecord | undefined> {
        let search = await this.client.from("Staff").select().eq("id", id).limit(1);
        if (search.data) {
            return search.data[0];
        }
        return undefined;
    }

    async search_individual_appointments(individual_id: number) : Promise<Array<AppointmentHistory>> {
        let search = await this.client.from("Appointment History").select().eq("individual_id", individual_id);
        return search.data || [];
    }

    async search_individual_dentist_notes(individual_id: number) : Promise<Array<DentistNotes>> {
        let search = await this.client.from("Dentist Notes").select().eq("individual_id", individual_id);
        return search.data || [];
    }

    async search_individual_summaries(individual_id: number) : Promise<IndividualSummary | undefined> {
        let search = await this.client.from("Summaries").select().eq("individual_id", individual_id).limit(1);
        if (search.data) {
            return search.data[0];
        }
        return undefined;
    }
}

const test_db = new MedTechSupabase(url, key);
const individual = await test_db.search_individual("4");
console.log(individual);
