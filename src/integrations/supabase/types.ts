export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_data: {
        Row: {
          calories: number
          date: string
          day: string
          id: string
          user_id: string
        }
        Insert: {
          calories?: number
          date: string
          day: string
          id?: string
          user_id: string
        }
        Update: {
          calories?: number
          date?: string
          day?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          current_weight: number | null
          last_calculated: string | null
          projected_outcome: string | null
          user_id: string
        }
        Insert: {
          current_weight?: number | null
          last_calculated?: string | null
          projected_outcome?: string | null
          user_id: string
        }
        Update: {
          current_weight?: number | null
          last_calculated?: string | null
          projected_outcome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          meals: Json | null
          total_calories: number | null
          total_protein: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          meals?: Json | null
          total_calories?: number | null
          total_protein?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          meals?: Json | null
          total_calories?: number | null
          total_protein?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          body_fat: number | null
          chronic_diseases: string | null
          consistency_score: number | null
          created_at: string | null
          daily_calories_target: number | null
          fitness_score: number | null
          full_name: string | null
          goal_description: string | null
          heart_rate: number | null
          height: number | null
          id: string
          injuries: Json | null
          medications: string | null
          pain_areas: string | null
          past_surgeries: string | null
          profession: string | null
          recovery_score: number | null
          target_weight: number | null
          timeline: string | null
          updated_at: string | null
          water_glasses: number | null
          water_target: number | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          body_fat?: number | null
          chronic_diseases?: string | null
          consistency_score?: number | null
          created_at?: string | null
          daily_calories_target?: number | null
          fitness_score?: number | null
          full_name?: string | null
          goal_description?: string | null
          heart_rate?: number | null
          height?: number | null
          id: string
          injuries?: Json | null
          medications?: string | null
          pain_areas?: string | null
          past_surgeries?: string | null
          profession?: string | null
          recovery_score?: number | null
          target_weight?: number | null
          timeline?: string | null
          updated_at?: string | null
          water_glasses?: number | null
          water_target?: number | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          body_fat?: number | null
          chronic_diseases?: string | null
          consistency_score?: number | null
          created_at?: string | null
          daily_calories_target?: number | null
          fitness_score?: number | null
          full_name?: string | null
          goal_description?: string | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          injuries?: Json | null
          medications?: string | null
          pain_areas?: string | null
          past_surgeries?: string | null
          profession?: string | null
          recovery_score?: number | null
          target_weight?: number | null
          timeline?: string | null
          updated_at?: string | null
          water_glasses?: number | null
          water_target?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          id: string
          recorded_at: string | null
          user_id: string
          week_label: string
          weight: number
        }
        Insert: {
          id?: string
          recorded_at?: string | null
          user_id: string
          week_label: string
          weight: number
        }
        Update: {
          id?: string
          recorded_at?: string | null
          user_id?: string
          week_label?: string
          weight?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          completion_rate: number | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          plan_id: string | null
          user_id: string
        }
        Insert: {
          completion_rate?: number | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          user_id: string
        }
        Update: {
          completion_rate?: number | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          plan_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          completed_exercises: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_adjusted: boolean | null
          plan_data: Json
          updated_at: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          completed_exercises?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_adjusted?: boolean | null
          plan_data: Json
          updated_at?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          completed_exercises?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_adjusted?: boolean | null
          plan_data?: Json
          updated_at?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
