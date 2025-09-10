
import { createClient } from '@supabase/supabase-js'
import { assert } from 'console';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

assert(url !== undefined, "Supabase URL must be set!");
assert(key !== undefined, "Supabase KEY must be set!");

const supabase = createClient(url as string, key as string);

let person = await supabase.from("Individuals").select().filter("id", "eq", 4).single();
console.log(person);
