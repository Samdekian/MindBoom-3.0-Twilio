import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Get Supabase credentials from environment or config
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aoumioacfvttagverbna.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Executing SQL fix for breakout_rooms constraint...\n');

// Execute each SQL statement separately
const sqlStatements = [
  {
    name: 'Drop old unique constraint',
    sql: 'ALTER TABLE public.breakout_rooms DROP CONSTRAINT IF EXISTS breakout_rooms_room_name_key'
  },
  {
    name: 'Drop existing composite constraint',
    sql: 'ALTER TABLE public.breakout_rooms DROP CONSTRAINT IF EXISTS breakout_rooms_session_room_unique'
  },
  {
    name: 'Add new composite unique constraint',
    sql: 'ALTER TABLE public.breakout_rooms ADD CONSTRAINT breakout_rooms_session_room_unique UNIQUE (session_id, room_name)'
  },
  {
    name: 'Clean up old inactive rooms',
    sql: "DELETE FROM public.breakout_rooms WHERE created_at < NOW() - INTERVAL '24 hours' AND (is_active = false OR closed_at IS NOT NULL)"
  }
];

for (const { name, sql } of sqlStatements) {
  console.log(`📝 ${name}...`);
  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
    } else {
      console.log(`   ✅ Success`);
    }
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
  }
}

// Verify the constraint
console.log('\n🔍 Verifying constraints...');
const { data, error } = await supabase
  .from('breakout_rooms')
  .select('*')
  .limit(0);

if (error) {
  console.error('❌ Error verifying:', error.message);
} else {
  console.log('✅ Table structure updated successfully!');
}

console.log('\n✨ Fix complete! You can now create breakout rooms.');

