export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: Json | null
          contact_info: Json | null
          created_at: string
          id: string
          name: string
          settings: Json | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          name: string
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          contact_info?: Json | null
          created_at?: string
          id?: string
          name?: string
          settings?: Json | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          billing_info: Json | null
          business_name: string | null
          company_id: string
          contact_info: Json | null
          created_at: string
          id: string
          preferences: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          billing_info?: Json | null
          business_name?: string | null
          company_id: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          preferences?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          billing_info?: Json | null
          business_name?: string | null
          company_id?: string
          contact_info?: Json | null
          created_at?: string
          id?: string
          preferences?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          certifications: Json | null
          company_id: string
          created_at: string
          emergency_contacts: Json | null
          employee_id: string | null
          id: string
          license_info: Json | null
          performance_metrics: Json | null
          personal_info: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          certifications?: Json | null
          company_id: string
          created_at?: string
          emergency_contacts?: Json | null
          employee_id?: string | null
          id?: string
          license_info?: Json | null
          performance_metrics?: Json | null
          personal_info?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          certifications?: Json | null
          company_id?: string
          created_at?: string
          emergency_contacts?: Json | null
          employee_id?: string | null
          id?: string
          license_info?: Json | null
          performance_metrics?: Json | null
          personal_info?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_records: {
        Row: {
          cost_per_unit: number | null
          created_at: string
          driver_id: string | null
          fuel_type: string | null
          id: string
          location: Json | null
          odometer_reading: number | null
          quantity: number | null
          receipt_url: string | null
          timestamp: string
          total_cost: number | null
          vehicle_id: string
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string
          driver_id?: string | null
          fuel_type?: string | null
          id?: string
          location?: Json | null
          odometer_reading?: number | null
          quantity?: number | null
          receipt_url?: string | null
          timestamp?: string
          total_cost?: number | null
          vehicle_id: string
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string
          driver_id?: string | null
          fuel_type?: string | null
          id?: string
          location?: Json | null
          odometer_reading?: number | null
          quantity?: number | null
          receipt_url?: string | null
          timestamp?: string
          total_cost?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_records_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          labor_hours: number | null
          maintenance_type: string | null
          next_service_date: string | null
          parts_used: Json | null
          scheduled_date: string | null
          service_provider: string | null
          status: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          labor_hours?: number | null
          maintenance_type?: string | null
          next_service_date?: string | null
          parts_used?: Json | null
          scheduled_date?: string | null
          service_provider?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          labor_hours?: number | null
          maintenance_type?: string | null
          next_service_date?: string | null
          parts_used?: Json | null
          scheduled_date?: string | null
          service_provider?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          actual_route: Json | null
          created_at: string
          destination: Json | null
          distance: number | null
          driver_id: string | null
          duration: unknown | null
          end_time: string | null
          id: string
          origin: Json | null
          planned_route: Json | null
          start_time: string | null
          status: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          actual_route?: Json | null
          created_at?: string
          destination?: Json | null
          distance?: number | null
          driver_id?: string | null
          duration?: unknown | null
          end_time?: string | null
          id?: string
          origin?: Json | null
          planned_route?: Json | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          actual_route?: Json | null
          created_at?: string
          destination?: Json | null
          distance?: number | null
          driver_id?: string | null
          duration?: unknown | null
          end_time?: string | null
          id?: string
          origin?: Json | null
          planned_route?: Json | null
          start_time?: string | null
          status?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_tracking: {
        Row: {
          accuracy: number | null
          altitude: number | null
          created_at: string
          heading: number | null
          id: string
          latitude: number | null
          longitude: number | null
          speed: number | null
          timestamp: string
          vehicle_id: string
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          created_at?: string
          heading?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          timestamp?: string
          vehicle_id: string
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          created_at?: string
          heading?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          timestamp?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_tracking_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          company_id: string
          created_at: string
          id: string
          license_plate: string | null
          make: string | null
          model: string | null
          purchase_info: Json | null
          specifications: Json | null
          status: string | null
          updated_at: string
          vehicle_type: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          purchase_info?: Json | null
          specifications?: Json | null
          status?: string | null
          updated_at?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          purchase_info?: Json | null
          specifications?: Json | null
          status?: string | null
          updated_at?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
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
