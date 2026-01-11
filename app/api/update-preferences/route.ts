/**
 * API Route: Update User Preferences
 * Updates user skills, budget preferences, and notification settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      skills,
      min_budget,
      preferred_countries,
    } = body;

    // Validation
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Skills array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (min_budget < 0) {
      return NextResponse.json(
        { success: false, error: 'Minimum budget must be non-negative' },
        { status: 400 }
      );
    }

    // Check if user preferences exist
    const { data: existingPrefs } = await supabaseAdmin
      .from('user_preferences')
      .select('id')
      .single();

    let result;
    if (existingPrefs) {
      // Update existing preferences
      result = await supabaseAdmin
        .from('user_preferences')
        .update({
          skills,
          min_budget,
          preferred_countries: preferred_countries || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPrefs.id)
        .select()
        .single();
    } else {
      // Insert new preferences
      result = await supabaseAdmin
        .from('user_preferences')
        .insert({
          skills,
          min_budget,
          preferred_countries: preferred_countries || [],
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error updating preferences:', result.error);
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 500 }
      );
    }

    // Note: User skills embedding will be regenerated on next cron run
    console.log('✓ User preferences updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Error in update-preferences API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

