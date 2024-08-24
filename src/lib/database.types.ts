export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      billing_statement: {
        Row: {
          client_id: number
          created_at: string
          id: number
          service_id: number
          total: number
        }
        Insert: {
          client_id: number
          created_at?: string
          id?: number
          service_id: number
          total: number
        }
        Update: {
          client_id?: number
          created_at?: string
          id?: number
          service_id?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_statement_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_statement_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service"
            referencedColumns: ["id"]
          },
        ]
      }
      client: {
        Row: {
          created_at: string
          email: string
          id: number
          person_id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          person_id: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          person_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      employee: {
        Row: {
          created_at: string
          email: string
          id: number
          job_title: string
          person_id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          job_title: string
          person_id: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          job_title?: string
          person_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      payment: {
        Row: {
          billing_statement_id: number
          created_at: string
          id: number
          made_by_person_id: number
          value: number
        }
        Insert: {
          billing_statement_id: number
          created_at?: string
          id?: number
          made_by_person_id: number
          value: number
        }
        Update: {
          billing_statement_id?: number
          created_at?: string
          id?: number
          made_by_person_id?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_billing_statement_id_fkey"
            columns: ["billing_statement_id"]
            isOneToOne: false
            referencedRelation: "billing_statement"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_made_by_person_id_fkey"
            columns: ["made_by_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          company_name: string | null
          created_at: string
          full_name: string | null
          id: number
          identity_number: string | null
          identity_type: Database["public"]["Enums"]["identity_type"] | null
          nit: string | null
          risk: number | null
          type: Database["public"]["Enums"]["person_type"]
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: number
          identity_number?: string | null
          identity_type?: Database["public"]["Enums"]["identity_type"] | null
          nit?: string | null
          risk?: number | null
          type: Database["public"]["Enums"]["person_type"]
        }
        Update: {
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: number
          identity_number?: string | null
          identity_type?: Database["public"]["Enums"]["identity_type"] | null
          nit?: string | null
          risk?: number | null
          type?: Database["public"]["Enums"]["person_type"]
        }
        Relationships: []
      }
      service: {
        Row: {
          concept: string
          cost: number
          created_at: string
          id: number
          type: Database["public"]["Enums"]["service_type"]
        }
        Insert: {
          concept: string
          cost: number
          created_at?: string
          id?: number
          type: Database["public"]["Enums"]["service_type"]
        }
        Update: {
          concept?: string
          cost?: number
          created_at?: string
          id?: number
          type?: Database["public"]["Enums"]["service_type"]
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
      identity_type: "CC" | "CE" | "NIT" | "PASSPORT"
      person_type: "NATURAL" | "ARTIFICIAL"
      service_type: "CAJA_COMPENSACION" | "PENSION" | "SALUD"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
