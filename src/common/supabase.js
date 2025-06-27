import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://dnldxxqwlrbishkvmrhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRubGR4eHF3bHJiaXNoa3ZtcmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMzg0MjcsImV4cCI6MjA2NjYxNDQyN30.cMYdVVY3nzBpff9kXbVucVqUveHvlIuTNVaxFmHz6PU';

export const supabase = createClient(supabaseUrl, supabaseKey);
