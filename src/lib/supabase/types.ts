// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          code: string
          company_id: string
          created_at: string | null
          id: string
          level: number | null
          name: string
          nature: string | null
          parent_code: string | null
          type: string | null
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string | null
          id?: string
          level?: number | null
          name: string
          nature?: string | null
          parent_code?: string | null
          type?: string | null
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string | null
          id?: string
          level?: number | null
          name?: string
          nature?: string | null
          parent_code?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'accounts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
        ]
      }
      balances: {
        Row: {
          account_id: string
          credit: number | null
          debit: number | null
          final_balance: number | null
          final_indicator: string | null
          id: string
          initial_balance: number | null
          initial_indicator: string | null
          period: string
        }
        Insert: {
          account_id: string
          credit?: number | null
          debit?: number | null
          final_balance?: number | null
          final_indicator?: string | null
          id?: string
          initial_balance?: number | null
          initial_indicator?: string | null
          period: string
        }
        Update: {
          account_id?: string
          credit?: number | null
          debit?: number | null
          final_balance?: number | null
          final_indicator?: string | null
          id?: string
          initial_balance?: number | null
          initial_indicator?: string | null
          period?: string
        }
        Relationships: [
          {
            foreignKeyName: 'balances_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
      companies: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_configs: {
        Row: {
          company_id: string | null
          config_data: Json
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          config_data?: Json
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          config_data?: Json
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_configs_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: accounts
//   id: uuid (not null, default: gen_random_uuid())
//   company_id: uuid (not null)
//   code: text (not null)
//   name: text (not null)
//   type: text (nullable)
//   level: integer (nullable)
//   nature: text (nullable)
//   parent_code: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: balances
//   id: uuid (not null, default: gen_random_uuid())
//   account_id: uuid (not null)
//   period: text (not null)
//   initial_balance: numeric (nullable)
//   initial_indicator: text (nullable)
//   debit: numeric (nullable)
//   credit: numeric (nullable)
//   final_balance: numeric (nullable)
//   final_indicator: text (nullable)
// Table: companies
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   cnpj: text (not null)
//   name: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   full_name: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: user_configs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   company_id: uuid (nullable)
//   config_data: jsonb (not null, default: '{}'::jsonb)
//   updated_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: accounts
//   FOREIGN KEY accounts_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY accounts_pkey: PRIMARY KEY (id)
// Table: balances
//   FOREIGN KEY balances_account_id_fkey: FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
//   PRIMARY KEY balances_pkey: PRIMARY KEY (id)
// Table: companies
//   PRIMARY KEY companies_pkey: PRIMARY KEY (id)
//   FOREIGN KEY companies_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: user_configs
//   FOREIGN KEY user_configs_company_id_fkey: FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
//   PRIMARY KEY user_configs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_configs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: accounts
//   Policy "Users can manage accounts of own companies" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM companies   WHERE ((companies.id = accounts.company_id) AND (companies.user_id = auth.uid()))))
// Table: balances
//   Policy "Users can manage balances of own companies" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM (accounts a      JOIN companies c ON ((c.id = a.company_id)))   WHERE ((a.id = balances.account_id) AND (c.user_id = auth.uid()))))
// Table: companies
//   Policy "Users can manage own companies" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: profiles
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: user_configs
//   Policy "Users can manage own configs" (ALL, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
