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
      avisos: {
        Row: {
          body: string
          created_at: string
          expires_at: string | null
          id: number
          kind: string
          pinned: boolean
          publish_at: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          expires_at?: string | null
          id?: number
          kind?: string
          pinned?: boolean
          publish_at?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          expires_at?: string | null
          id?: number
          kind?: string
          pinned?: boolean
          publish_at?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blocked_devices: {
        Row: {
          created_at: string
          device_id: string
          note: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          note?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          note?: string | null
        }
        Relationships: []
      }
      help_messages: {
        Row: {
          contact: string | null
          created_at: string
          id: number
          message: string
          name: string | null
          page: string | null
          resolved: boolean
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: number
          message: string
          name?: string | null
          page?: string | null
          resolved?: boolean
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: number
          message?: string
          name?: string | null
          page?: string | null
          resolved?: boolean
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          closed_at: string | null
          code: string
          created_at: string
          expires_at: string
          title: string
        }
        Insert: {
          closed_at?: string | null
          code: string
          created_at?: string
          expires_at: string
          title: string
        }
        Update: {
          closed_at?: string | null
          code?: string
          created_at?: string
          expires_at?: string
          title?: string
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
      program_audios: {
        Row: {
          audio_url: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: number
          program_date: string | null
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: number
          program_date?: string | null
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: number
          program_date?: string | null
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      request_activity: {
        Row: {
          access_code_used: boolean
          browser: string | null
          created_at: string
          device_id: string | null
          device_type: string | null
          ip_hash: string | null
          ip_week_hash: string | null
          request_id: number
        }
        Insert: {
          access_code_used?: boolean
          browser?: string | null
          created_at?: string
          device_id?: string | null
          device_type?: string | null
          ip_hash?: string | null
          ip_week_hash?: string | null
          request_id: number
        }
        Update: {
          access_code_used?: boolean
          browser?: string | null
          created_at?: string
          device_id?: string | null
          device_type?: string | null
          ip_hash?: string | null
          ip_week_hash?: string | null
          request_id?: number
        }
        Relationships: []
      }
      site_control: {
        Row: {
          alt_open: boolean
          banner_color: string
          banner_enabled: boolean
          banner_position: Database["public"]["Enums"]["banner_position"]
          banner_text: string | null
          blocked: boolean
          id: number
          lock_note: string | null
          lock_reopen_at: string | null
          open_override: boolean
          per_device_limit: number
          popup_enabled: boolean
          popup_image_url: string | null
          popup_text: string | null
          popup_title: string | null
          site_locked: boolean
          unlock_at: string | null
          updated_at: string
        }
        Insert: {
          alt_open?: boolean
          banner_color?: string
          banner_enabled?: boolean
          banner_position?: Database["public"]["Enums"]["banner_position"]
          banner_text?: string | null
          blocked?: boolean
          id: number
          lock_note?: string | null
          lock_reopen_at?: string | null
          open_override?: boolean
          per_device_limit?: number
          popup_enabled?: boolean
          popup_image_url?: string | null
          popup_text?: string | null
          popup_title?: string | null
          site_locked?: boolean
          unlock_at?: string | null
          updated_at?: string
        }
        Update: {
          alt_open?: boolean
          banner_color?: string
          banner_enabled?: boolean
          banner_position?: Database["public"]["Enums"]["banner_position"]
          banner_text?: string | null
          blocked?: boolean
          id?: number
          lock_note?: string | null
          lock_reopen_at?: string | null
          open_override?: boolean
          per_device_limit?: number
          popup_enabled?: boolean
          popup_image_url?: string | null
          popup_text?: string | null
          popup_title?: string | null
          site_locked?: boolean
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
          played_at: string | null
          requester_name: string | null
          scheduled_for: string | null
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
          played_at?: string | null
          requester_name?: string | null
          scheduled_for?: string | null
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
          played_at?: string | null
          requester_name?: string | null
          scheduled_for?: string | null
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
          uses_left: number
        }
        Insert: {
          code: string
          created_at?: string
          student_name: string
          used_at?: string | null
          uses_left?: number
        }
        Update: {
          code?: string
          created_at?: string
          student_name?: string
          used_at?: string | null
          uses_left?: number
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
