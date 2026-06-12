export interface Database {
  public: {
    Tables: {
      design_templates: {
        Row: {
          id: string;
          template_id: string;
          industry: string;
          style: string;
          layout_type: string;
          metadata: Record<string, unknown>;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          industry: string;
          style: string;
          layout_type: string;
          metadata: Record<string, unknown>;
          embedding?: number[] | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['design_templates']['Insert']>;
      };
      posters: {
        Row: {
          id: string;
          user_session: string | null;
          prompt: string;
          layout: Record<string, unknown>;
          cloudinary_url: string | null;
          template_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_session?: string | null;
          prompt: string;
          layout: Record<string, unknown>;
          cloudinary_url?: string | null;
          template_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['posters']['Insert']>;
      };
    };
    Functions: {
      search_design_templates: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
        };
        Returns: {
          id: string;
          template_id: string;
          industry: string;
          style: string;
          layout_type: string;
          metadata: Record<string, unknown>;
          similarity: number;
        }[];
      };
    };
  };
}
