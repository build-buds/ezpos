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
      biolinks: {
        Row: {
          accent_color: string
          avatar_url: string | null
          bio: string | null
          business_id: string
          created_at: string
          display_name: string | null
          enabled: boolean
          id: string
          links: Json
          slug: string
          theme: string
          updated_at: string
          view_count: number
        }
        Insert: {
          accent_color?: string
          avatar_url?: string | null
          bio?: string | null
          business_id: string
          created_at?: string
          display_name?: string | null
          enabled?: boolean
          id?: string
          links?: Json
          slug: string
          theme?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          accent_color?: string
          avatar_url?: string | null
          bio?: string | null
          business_id?: string
          created_at?: string
          display_name?: string | null
          enabled?: boolean
          id?: string
          links?: Json
          slug?: string
          theme?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      businesses: {
        Row: {
          address: string | null
          category: string
          created_at: string
          id: string
          menu_accent_color: string
          menu_description: string | null
          menu_enabled: boolean
          menu_logo_url: string | null
          menu_theme: string
          menu_title: string | null
          name: string
          owner_id: string
          phone: string | null
          slug: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          id?: string
          menu_accent_color?: string
          menu_description?: string | null
          menu_enabled?: boolean
          menu_logo_url?: string | null
          menu_theme?: string
          menu_title?: string | null
          name: string
          owner_id: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          id?: string
          menu_accent_color?: string
          menu_description?: string | null
          menu_enabled?: boolean
          menu_logo_url?: string | null
          menu_theme?: string
          menu_title?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_members: {
        Row: {
          birthday: string | null
          business_id: string
          created_at: string
          email: string | null
          id: string
          last_visit_at: string | null
          name: string
          notes: string | null
          phone: string
          points_balance: number
          tier: Database["public"]["Enums"]["loyalty_tier"]
          total_earned: number
          total_spent_rupiah: number
          updated_at: string
          visit_count: number
        }
        Insert: {
          birthday?: string | null
          business_id: string
          created_at?: string
          email?: string | null
          id?: string
          last_visit_at?: string | null
          name: string
          notes?: string | null
          phone: string
          points_balance?: number
          tier?: Database["public"]["Enums"]["loyalty_tier"]
          total_earned?: number
          total_spent_rupiah?: number
          updated_at?: string
          visit_count?: number
        }
        Update: {
          birthday?: string | null
          business_id?: string
          created_at?: string
          email?: string | null
          id?: string
          last_visit_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          points_balance?: number
          tier?: Database["public"]["Enums"]["loyalty_tier"]
          total_earned?: number
          total_spent_rupiah?: number
          updated_at?: string
          visit_count?: number
        }
        Relationships: []
      }
      loyalty_redemptions: {
        Row: {
          business_id: string
          code: string
          created_at: string
          id: string
          member_id: string
          transaction_id: string | null
          used_at: string | null
          voucher_id: string
        }
        Insert: {
          business_id: string
          code: string
          created_at?: string
          id?: string
          member_id: string
          transaction_id?: string | null
          used_at?: string | null
          voucher_id: string
        }
        Update: {
          business_id?: string
          code?: string
          created_at?: string
          id?: string
          member_id?: string
          transaction_id?: string | null
          used_at?: string | null
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "loyalty_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_settings: {
        Row: {
          auto_create_member: boolean
          business_id: string
          created_at: string
          enabled: boolean
          id: string
          min_redeem_points: number
          point_value_rupiah: number
          points_per_rupiah: number
          terms: string | null
          updated_at: string
          welcome_bonus: number
        }
        Insert: {
          auto_create_member?: boolean
          business_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          min_redeem_points?: number
          point_value_rupiah?: number
          points_per_rupiah?: number
          terms?: string | null
          updated_at?: string
          welcome_bonus?: number
        }
        Update: {
          auto_create_member?: boolean
          business_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          min_redeem_points?: number
          point_value_rupiah?: number
          points_per_rupiah?: number
          terms?: string | null
          updated_at?: string
          welcome_bonus?: number
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          member_id: string
          note: string | null
          points: number
          transaction_id: string | null
          type: Database["public"]["Enums"]["loyalty_txn_type"]
          voucher_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          member_id: string
          note?: string | null
          points: number
          transaction_id?: string | null
          type: Database["public"]["Enums"]["loyalty_txn_type"]
          voucher_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          member_id?: string
          note?: string | null
          points?: number
          transaction_id?: string | null
          type?: Database["public"]["Enums"]["loyalty_txn_type"]
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_vouchers: {
        Row: {
          active: boolean
          business_id: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["loyalty_discount_type"]
          discount_value: number
          id: string
          max_redemptions: number | null
          min_purchase: number
          name: string
          points_cost: number
          redemption_count: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          active?: boolean
          business_id: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["loyalty_discount_type"]
          discount_value?: number
          id?: string
          max_redemptions?: number | null
          min_purchase?: number
          name: string
          points_cost?: number
          redemption_count?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          active?: boolean
          business_id?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["loyalty_discount_type"]
          discount_value?: number
          id?: string
          max_redemptions?: number | null
          min_purchase?: number
          name?: string
          points_cost?: number
          redemption_count?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      module_interests: {
        Row: {
          created_at: string
          id: string
          module_slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module_slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          business_id: string
          category: string
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          min_stock: number | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number | null
          name: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          min_stock?: number | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          expiration_time: string | null
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          expiration_time?: string | null
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          expiration_time?: string | null
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          polar_customer_id: string | null
          polar_subscription_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          polar_customer_id?: string | null
          polar_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          polar_customer_id?: string | null
          polar_subscription_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          business_id: string
          created_at: string
          discount: number
          id: string
          items: Json
          order_type: string | null
          payment_method: string
          status: string
          total: number
        }
        Insert: {
          business_id: string
          created_at?: string
          discount?: number
          id?: string
          items?: Json
          order_type?: string | null
          payment_method: string
          status?: string
          total?: number
        }
        Update: {
          business_id?: string
          created_at?: string
          discount?: number
          id?: string
          items?: Json
          order_type?: string | null
          payment_method?: string
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      adjust_loyalty_points: {
        Args: { _delta: number; _member_id: string; _note: string }
        Returns: undefined
      }
      award_loyalty_points: {
        Args: { _amount: number; _member_id: string; _transaction_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_biolink_view: { Args: { _slug: string }; Returns: undefined }
      redeem_loyalty_voucher: {
        Args: { _member_id: string; _voucher_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      loyalty_discount_type: "percent" | "fixed"
      loyalty_tier: "bronze" | "silver" | "gold"
      loyalty_txn_type: "earn" | "redeem" | "adjust" | "bonus"
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
      app_role: ["admin", "staff"],
      loyalty_discount_type: ["percent", "fixed"],
      loyalty_tier: ["bronze", "silver", "gold"],
      loyalty_txn_type: ["earn", "redeem", "adjust", "bonus"],
    },
  },
} as const
