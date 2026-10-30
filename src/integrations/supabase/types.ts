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
      access_codes: {
        Row: {
          code: string
          used_at: string | null
        }
        Insert: {
          code: string
          used_at?: string | null
        }
        Update: {
          code?: string
          used_at?: string | null
        }
        Relationships: []
      }
      account_creation_permits: {
        Row: {
          email: string
          expires_at: string
        }
        Insert: {
          email: string
          expires_at?: string
        }
        Update: {
          email?: string
          expires_at?: string
        }
        Relationships: []
      }
      active_visitors: {
        Row: {
          browser: string | null
          device_type: string | null
          ip_hash: string | null
          last_seen: string
          session_id: string
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          ip_hash?: string | null
          last_seen?: string
          session_id: string
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          ip_hash?: string | null
          last_seen?: string
          session_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          clicks: number
          country: string
          created_at: string
          day: string
          device_type: string
          duration_seconds: number
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id: number
          page: string
        }
        Insert: {
          clicks?: number
          country?: string
          created_at?: string
          day: string
          device_type?: string
          duration_seconds?: number
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id?: number
          page: string
        }
        Update: {
          clicks?: number
          country?: string
          created_at?: string
          day?: string
          device_type?: string
          duration_seconds?: number
          event_type?: Database["public"]["Enums"]["analytics_event_type"]
          id?: number
          page?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
      request_activity: {
        Row: {
          access_code_used: boolean
          browser: string | null
          device_type: string | null
          ip_hash: string | null
          request_id: number
        }
        Insert: {
          access_code_used?: boolean
          browser?: string | null
          device_type?: string | null
          ip_hash?: string | null
          request_id: number
        }
        Update: {
          access_code_used?: boolean
          browser?: string | null
          device_type?: string | null
          ip_hash?: string | null
          request_id?: number
        }
        Relationships: []
      }
      site_control: {
        Row: {
          banner_color: string
          banner_enabled: boolean
          banner_position: Database["public"]["Enums"]["banner_position"]
          banner_text: string | null
          blocked: boolean
          id: number
          open_override: boolean
          unlock_at: string | null
          updated_at: string
        }
        Insert: {
          banner_color?: string
          banner_enabled?: boolean
          banner_position?: Database["public"]["Enums"]["banner_position"]
          banner_text?: string | null
          blocked?: boolean
          id: number
          open_override?: boolean
          unlock_at?: string | null
          updated_at?: string
        }
        Update: {
          banner_color?: string
          banner_enabled?: boolean
          banner_position?: Database["public"]["Enums"]["banner_position"]
          banner_text?: string | null
          blocked?: boolean
          id?: number
          open_override?: boolean
          unlock_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_feedback: {
        Row: {
          created_at: string
          id: number
          rating: number
          request_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          rating: number
          request_id: number
        }
        Update: {
          created_at?: string
          id?: number
          rating?: number
          request_id?: number
        }
        Relationships: []
      }
      song_requests: {
        Row: {
          album: string | null
          artist: string
          course: string | null
          created_at: string
          dedication: string | null
          id: number
          notes: string | null
          requester_name: string | null
          song_title: string
          source_url: string | null
          status: Database["public"]["Enums"]["request_status"]
          terms_accepted: boolean
          terms_version: string
          updated_at: string
          year: number | null
        }
        Insert: {
          album?: string | null
          artist: string
          course?: string | null
          created_at?: string
          dedication?: string | null
          id?: number
          notes?: string | null
          requester_name?: string | null
          song_title: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          terms_accepted?: boolean
          terms_version?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          album?: string | null
          artist?: string
          course?: string | null
          created_at?: string
          dedication?: string | null
          id?: number
          notes?: string | null
          requester_name?: string | null
          song_title?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          terms_accepted?: boolean
          terms_version?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      student_access_codes: {
        Row: {
          code: string
          created_at: string
          student_name: string
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          student_name: string
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          student_name?: string
          used_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      analytics_summary: {
        Args: never
        Returns: {
          clicks: number
          country: string
          day: string
          device_type: string
          event_type: string
          page: string
          sessions: number
          total_seconds: number
          views: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      redeem_access_code: { Args: { _code: string }; Returns: boolean }
      redeem_student_access_code: { Args: { _code: string }; Returns: boolean }
    }
    Enums: {
      analytics_event_type: "page_view" | "session_end" | "click"
      app_role: "admin" | "user"
      banner_position: "top" | "middle" | "bottom"
      request_status: "pending" | "selected" | "played" | "rejected"
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
    Enums: {
      analytics_event_type: ["page_view", "session_end", "click"],
      app_role: ["admin", "user"],
      banner_position: ["top", "middle", "bottom"],
      request_status: ["pending", "selected", "played", "rejected"],
    },
  },
} as const
