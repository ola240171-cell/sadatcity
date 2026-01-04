
// Supabase Client Configuration
const PROJECT_URL = 'https://zyscminapubmqwbaazrb.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5c2NtaW5hcHVibXF3YmFhenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzgzNzEsImV4cCI6MjA4MzA1NDM3MX0.2jAFMFXZNwYRwgQovBcN-1U4ygDreqjAEXgz3u0jvuU';

// Initialize Client (Global Access)
window.supabaseClient = window.supabase.createClient(PROJECT_URL, ANON_KEY);

console.log('Supabase Connected 🟢');
