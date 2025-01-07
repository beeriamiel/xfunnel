'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@/app/supabase/client';
import { useDashboardStore } from '../store';
import { Loader2, Check } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ... rest of the file ... 