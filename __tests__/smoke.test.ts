import { describe, expect, it } from 'vitest';

import { supabase } from '../lib/supabase/client';

describe('supabase client', () => {
  it('is defined', () => {
    expect(supabase).toBeDefined();
  });
});
