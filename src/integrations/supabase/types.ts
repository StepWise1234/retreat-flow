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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          allergies: string | null
          anything_else: string | null
          bedroom_choice: string | null
          birth_day: string | null
          birth_month: string | null
          birth_year: string | null
          city: string | null
          cognitive_symptoms: Json | null
          cognitive_symptoms_other: string | null
          coping_mechanisms: Json | null
          coping_other: string | null
          country: string | null
          created_at: string
          dietary_notes: string | null
          dietary_other: string | null
          dietary_preferences: Json | null
          dsm_diagnosis: string | null
          email: string
          emergency_first_name: string | null
          emergency_last_name: string | null
          emergency_phone: string | null
          first_name: string
          id: string
          integration_support: string | null
          journey_work_experience: string | null
          last_name: string
          life_circumstances: string | null
          life_experiences: Json | null
          medicine_experience: string | null
          mental_health_issues: string | null
          mental_health_professional: string | null
          phone: string | null
          physical_health_issues: string | null
          physical_medications: string | null
          physical_symptoms: Json | null
          physical_symptoms_other: string | null
          postal_code: string | null
          preferred_name: string | null
          psych_medications: string | null
          recreational_drug_use: string | null
          retreat_id: string | null
          self_care: string | null
          self_care_other: string | null
          serving_experience: string | null
          signal_handle: string | null
          special_accommodations: string | null
          state_province: string | null
          status: string
          street_address: string | null
          street_address_2: string | null
          strengths_hobbies: string | null
          stress_level: number | null
          stress_sources: string | null
          suicide_consideration: string | null
          supplements: string | null
          support_network: Json | null
          support_other: string | null
          training_goals: string | null
          training_level: string
          trauma_details: string | null
          updated_at: string
          user_id: string
          vrbo_listing_url: string | null
        }
        Insert: {
          allergies?: string | null
          anything_else?: string | null
          bedroom_choice?: string | null
          birth_day?: string | null
          birth_month?: string | null
          birth_year?: string | null
          city?: string | null
          cognitive_symptoms?: Json | null
          cognitive_symptoms_other?: string | null
          coping_mechanisms?: Json | null
          coping_other?: string | null
          country?: string | null
          created_at?: string
          dietary_notes?: string | null
          dietary_other?: string | null
          dietary_preferences?: Json | null
          dsm_diagnosis?: string | null
          email?: string
          emergency_first_name?: string | null
          emergency_last_name?: string | null
          emergency_phone?: string | null
          first_name?: string
          id?: string
          integration_support?: string | null
          journey_work_experience?: string | null
          last_name?: string
          life_circumstances?: string | null
          life_experiences?: Json | null
          medicine_experience?: string | null
          mental_health_issues?: string | null
          mental_health_professional?: string | null
          phone?: string | null
          physical_health_issues?: string | null
          physical_medications?: string | null
          physical_symptoms?: Json | null
          physical_symptoms_other?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          psych_medications?: string | null
          recreational_drug_use?: string | null
          retreat_id?: string | null
          self_care?: string | null
          self_care_other?: string | null
          serving_experience?: string | null
          signal_handle?: string | null
          special_accommodations?: string | null
          state_province?: string | null
          status?: string
          street_address?: string | null
          street_address_2?: string | null
          strengths_hobbies?: string | null
          stress_level?: number | null
          stress_sources?: string | null
          suicide_consideration?: string | null
          supplements?: string | null
          support_network?: Json | null
          support_other?: string | null
          training_goals?: string | null
          training_level?: string
          trauma_details?: string | null
          updated_at?: string
          user_id: string
          vrbo_listing_url?: string | null
        }
        Update: {
          allergies?: string | null
          anything_else?: string | null
          bedroom_choice?: string | null
          birth_day?: string | null
          birth_month?: string | null
          birth_year?: string | null
          city?: string | null
          cognitive_symptoms?: Json | null
          cognitive_symptoms_other?: string | null
          coping_mechanisms?: Json | null
          coping_other?: string | null
          country?: string | null
          created_at?: string
          dietary_notes?: string | null
          dietary_other?: string | null
          dietary_preferences?: Json | null
          dsm_diagnosis?: string | null
          email?: string
          emergency_first_name?: string | null
          emergency_last_name?: string | null
          emergency_phone?: string | null
          first_name?: string
          id?: string
          integration_support?: string | null
          journey_work_experience?: string | null
          last_name?: string
          life_circumstances?: string | null
          life_experiences?: Json | null
          medicine_experience?: string | null
          mental_health_issues?: string | null
          mental_health_professional?: string | null
          phone?: string | null
          physical_health_issues?: string | null
          physical_medications?: string | null
          physical_symptoms?: Json | null
          physical_symptoms_other?: string | null
          postal_code?: string | null
          preferred_name?: string | null
          psych_medications?: string | null
          recreational_drug_use?: string | null
          retreat_id?: string | null
          self_care?: string | null
          self_care_other?: string | null
          serving_experience?: string | null
          signal_handle?: string | null
          special_accommodations?: string | null
          state_province?: string | null
          status?: string
          street_address?: string | null
          street_address_2?: string | null
          strengths_hobbies?: string | null
          stress_level?: number | null
          stress_sources?: string | null
          suicide_consideration?: string | null
          supplements?: string | null
          support_network?: Json | null
          support_other?: string | null
          training_goals?: string | null
          training_level?: string
          trauma_details?: string | null
          updated_at?: string
          user_id?: string
          vrbo_listing_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_retreat_id_fkey"
            columns: ["retreat_id"]
            isOneToOne: false
            referencedRelation: "retreats"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          channels_enabled: string[]
          created_at: string
          id: string
          is_archived: boolean
          last_message_at: string | null
          last_message_preview: string | null
          participant_id: string
          registration_id: string | null
          retreat_id: string | null
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channels_enabled?: string[]
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_id: string
          registration_id?: string | null
          retreat_id?: string | null
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channels_enabled?: string[]
          created_at?: string
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          last_message_preview?: string | null
          participant_id?: string
          registration_id?: string | null
          retreat_id?: string | null
          unread_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      course_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          pdf_path: string | null
          sort_order: number
          title: string
          training_level: string
          updated_at: string
          vimeo_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          pdf_path?: string | null
          sort_order?: number
          title: string
          training_level: string
          updated_at?: string
          vimeo_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          pdf_path?: string | null
          sort_order?: number
          title?: string
          training_level?: string
          updated_at?: string
          vimeo_id?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          created_at: string
          enable_inbound_sync: boolean
          from_email: string | null
          from_name: string | null
          id: string
          is_healthy: boolean
          last_error: string | null
          last_success_at: string | null
          last_tested_at: string | null
          provider_type: string
          reply_to_email: string | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_username: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enable_inbound_sync?: boolean
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_healthy?: boolean
          last_error?: string | null
          last_success_at?: string | null
          last_tested_at?: string | null
          provider_type?: string
          reply_to_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enable_inbound_sync?: boolean
          from_email?: string | null
          from_name?: string | null
          id?: string
          is_healthy?: boolean
          last_error?: string | null
          last_success_at?: string | null
          last_tested_at?: string | null
          provider_type?: string
          reply_to_email?: string | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          correlation_id: string | null
          created_at: string
          error: string | null
          id: string
          metadata: Json | null
          provider: string
          status: string
        }
        Insert: {
          action: string
          correlation_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          status: string
        }
        Update: {
          action?: string
          correlation_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          status?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          created_at: string
          id: string
          is_active: boolean
          name: string
          stage: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          body: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          stage?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          stage?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          conversation_id: string | null
          created_at: string
          delivered_at: string | null
          direction: string
          error_message: string | null
          external_thread_id: string | null
          from_address: string | null
          id: string
          idempotency_key: string | null
          participant_id: string
          provider: string | null
          provider_message_id: string | null
          raw_payload: Json | null
          read_status: string
          registration_id: string
          retreat_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          template_id: string | null
          to_address: string
          updated_at: string
        }
        Insert: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          error_message?: string | null
          external_thread_id?: string | null
          from_address?: string | null
          id?: string
          idempotency_key?: string | null
          participant_id: string
          provider?: string | null
          provider_message_id?: string | null
          raw_payload?: Json | null
          read_status?: string
          registration_id: string
          retreat_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_id?: string | null
          to_address: string
          updated_at?: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["message_channel"]
          conversation_id?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          error_message?: string | null
          external_thread_id?: string | null
          from_address?: string | null
          id?: string
          idempotency_key?: string | null
          participant_id?: string
          provider?: string | null
          provider_message_id?: string | null
          raw_payload?: Json | null
          read_status?: string
          registration_id?: string
          retreat_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          template_id?: string | null
          to_address?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      retreats: {
        Row: {
          capacity_override: boolean
          cohort_size_target: number
          created_at: string
          end_date: string
          id: string
          location: string
          notes: string
          retreat_name: string
          show_on_application: boolean
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity_override?: boolean
          cohort_size_target?: number
          created_at?: string
          end_date: string
          id?: string
          location?: string
          notes?: string
          retreat_name: string
          show_on_application?: boolean
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity_override?: boolean
          cohort_size_target?: number
          created_at?: string
          end_date?: string
          id?: string
          location?: string
          notes?: string
          retreat_name?: string
          show_on_application?: boolean
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      signal_settings: {
        Row: {
          created_at: string
          enable_delivery_receipts: boolean
          id: string
          is_healthy: boolean
          last_error: string | null
          last_success_at: string | null
          last_tested_at: string | null
          provider_type: string
          signal_api_base_url: string | null
          signal_api_token: string | null
          signal_sender_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enable_delivery_receipts?: boolean
          id?: string
          is_healthy?: boolean
          last_error?: string | null
          last_success_at?: string | null
          last_tested_at?: string | null
          provider_type?: string
          signal_api_base_url?: string | null
          signal_api_token?: string | null
          signal_sender_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enable_delivery_receipts?: boolean
          id?: string
          is_healthy?: boolean
          last_error?: string | null
          last_success_at?: string | null
          last_tested_at?: string | null
          provider_type?: string
          signal_api_base_url?: string | null
          signal_api_token?: string | null
          signal_sender_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_reserved_rooms: { Args: { p_retreat_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      message_channel: "Email" | "Signal" | "SMS"
      message_status: "Draft" | "Queued" | "Sent" | "Delivered" | "Failed"
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
    Enums: {
      app_role: ["admin", "user"],
      message_channel: ["Email", "Signal", "SMS"],
      message_status: ["Draft", "Queued", "Sent", "Delivered", "Failed"],
    },
  },
} as const
