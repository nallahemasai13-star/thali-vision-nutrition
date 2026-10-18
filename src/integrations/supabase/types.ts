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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      food_model_support: {
        Row: {
          evaluated: boolean
          food_id: string
          id: string
          in_label_set: boolean
          model_version_id: string
          status: string
        }
        Insert: {
          evaluated?: boolean
          food_id: string
          id?: string
          in_label_set?: boolean
          model_version_id: string
          status?: string
        }
        Update: {
          evaluated?: boolean
          food_id?: string
          id?: string
          in_label_set?: boolean
          model_version_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_model_support_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_model_support_model_version_id_fkey"
            columns: ["model_version_id"]
            isOneToOne: false
            referencedRelation: "model_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_prepared_dish: boolean
          name: string
          region: string
          slug: string
          training_images_available: boolean
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_prepared_dish?: boolean
          name: string
          region?: string
          slug: string
          training_images_available?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_prepared_dish?: boolean
          name?: string
          region?: string
          slug?: string
          training_images_available?: boolean
        }
        Relationships: []
      }
      meal_entries: {
        Row: {
          confidence: number | null
          corrected_class: string | null
          created_at: string
          eaten_at: string
          food_id: string
          food_name: string
          id: string
          image_ref: string | null
          input_method: string
          model_version: string | null
          nutrition_snapshot: Json
          nutrition_source: string | null
          predicted_class: string | null
          serving_g: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          corrected_class?: string | null
          created_at?: string
          eaten_at?: string
          food_id: string
          food_name: string
          id?: string
          image_ref?: string | null
          input_method: string
          model_version?: string | null
          nutrition_snapshot: Json
          nutrition_source?: string | null
          predicted_class?: string | null
          serving_g: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          corrected_class?: string | null
          created_at?: string
          eaten_at?: string
          food_id?: string
          food_name?: string
          id?: string
          image_ref?: string | null
          input_method?: string
          model_version?: string | null
          nutrition_snapshot?: Json
          nutrition_source?: string | null
          predicted_class?: string | null
          serving_g?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_entries_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      model_versions: {
        Row: {
          created_at: string
          description: string
          evaluation_summary: Json | null
          id: string
          is_active: boolean
          kind: string
          version: string
        }
        Insert: {
          created_at?: string
          description: string
          evaluation_summary?: Json | null
          id?: string
          is_active?: boolean
          kind: string
          version: string
        }
        Update: {
          created_at?: string
          description?: string
          evaluation_summary?: Json | null
          id?: string
          is_active?: boolean
          kind?: string
          version?: string
        }
        Relationships: []
      }
      nutrition_facts: {
        Row: {
          basis: string
          calcium_mg: number | null
          calories_kcal: number | null
          carbs_g: number | null
          created_at: string
          data_type: string
          fat_g: number | null
          fiber_g: number | null
          food_id: string
          id: string
          iron_mg: number | null
          last_verified_at: string | null
          magnesium_mg: number | null
          potassium_mg: number | null
          protein_g: number | null
          saturated_fat_g: number | null
          sodium_mg: number | null
          source_food_match: string
          source_id: string
          sugar_g: number | null
          updated_at: string
          verified: boolean
          vitamin_c_mg: number | null
          zinc_mg: number | null
        }
        Insert: {
          basis?: string
          calcium_mg?: number | null
          calories_kcal?: number | null
          carbs_g?: number | null
          created_at?: string
          data_type?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_id: string
          id?: string
          iron_mg?: number | null
          last_verified_at?: string | null
          magnesium_mg?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          saturated_fat_g?: number | null
          sodium_mg?: number | null
          source_food_match: string
          source_id: string
          sugar_g?: number | null
          updated_at?: string
          verified?: boolean
          vitamin_c_mg?: number | null
          zinc_mg?: number | null
        }
        Update: {
          basis?: string
          calcium_mg?: number | null
          calories_kcal?: number | null
          carbs_g?: number | null
          created_at?: string
          data_type?: string
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: string
          id?: string
          iron_mg?: number | null
          last_verified_at?: string | null
          magnesium_mg?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          saturated_fat_g?: number | null
          sodium_mg?: number | null
          source_food_match?: string
          source_id?: string
          sugar_g?: number | null
          updated_at?: string
          verified?: boolean
          vitamin_c_mg?: number | null
          zinc_mg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_facts_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: true
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_facts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "nutrition_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_sources: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          reference: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          reference: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          reference?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          calorie_goal: number | null
          carbs_goal: number | null
          confidence_threshold: number
          created_at: string
          display_name: string | null
          fat_goal: number | null
          id: string
          max_serving_g: number
          protein_goal: number | null
          updated_at: string
        }
        Insert: {
          calorie_goal?: number | null
          carbs_goal?: number | null
          confidence_threshold?: number
          created_at?: string
          display_name?: string | null
          fat_goal?: number | null
          id: string
          max_serving_g?: number
          protein_goal?: number | null
          updated_at?: string
        }
        Update: {
          calorie_goal?: number | null
          carbs_goal?: number | null
          confidence_threshold?: number
          created_at?: string
          display_name?: string | null
          fat_goal?: number | null
          id?: string
          max_serving_g?: number
          protein_goal?: number | null
          updated_at?: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
