export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'mentor' | 'mentee';
export type MatchStatus = 'pending' | 'active' | 'completed' | 'paused';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: UserRole;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: UserRole;
          first_name: string;
          last_name: string;
          age: number;
          bio: string | null;
          interests: string[];
          goals: string[];
          specialties: string[];
          location: string | null;
          avatar_url: string | null;
          guidelines_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: UserRole;
          first_name: string;
          last_name?: string;
          age: number;
          bio?: string | null;
          interests?: string[];
          goals?: string[];
          specialties?: string[];
          location?: string | null;
          avatar_url?: string | null;
          guidelines_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: UserRole;
          first_name?: string;
          last_name?: string;
          age?: number;
          bio?: string | null;
          interests?: string[];
          goals?: string[];
          specialties?: string[];
          location?: string | null;
          avatar_url?: string | null;
          guidelines_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      interest_categories: {
        Row: {
          id: string;
          name: string;
          group_label: string;
          display_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          group_label?: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          group_label?: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      focus_areas: {
        Row: {
          id: string;
          name: string;
          group_label: string;
          display_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          group_label?: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          group_label?: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      mentor_specialties_lookup: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          mentor_id: string;
          mentee_id: string;
          status: MatchStatus;
          match_notes: string | null;
          matched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          mentee_id: string;
          status?: MatchStatus;
          match_notes?: string | null;
          matched_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          mentee_id?: string;
          status?: MatchStatus;
          match_notes?: string | null;
          matched_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          match_id: string;
          scheduled_at: string;
          google_event_id: string | null;
          status: SessionStatus;
          completed_at: string | null;
          mentee_notes: string | null;
          mentor_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          scheduled_at: string;
          google_event_id?: string | null;
          status?: SessionStatus;
          completed_at?: string | null;
          mentee_notes?: string | null;
          mentor_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          scheduled_at?: string;
          google_event_id?: string | null;
          status?: SessionStatus;
          completed_at?: string | null;
          mentee_notes?: string | null;
          mentor_notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          mood: number;
          reflection: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: number;
          reflection?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: number;
          reflection?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          match_id: string | null;
          title: string;
          description: string | null;
          target_date: string | null;
          status: GoalStatus;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id?: string | null;
          title: string;
          description?: string | null;
          target_date?: string | null;
          status?: GoalStatus;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string | null;
          title?: string;
          description?: string | null;
          target_date?: string | null;
          status?: GoalStatus;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      training_tracks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          order: number;
          badge_image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          order?: number;
          badge_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          order?: number;
          badge_image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      training_modules: {
        Row: {
          id: string;
          track_id: string;
          title: string;
          content: string;
          order: number;
          duration_mins: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          title: string;
          content: string;
          order?: number;
          duration_mins?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          title?: string;
          content?: string;
          order?: number;
          duration_mins?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      user_training_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          group_id: string | null;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string | null;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string | null;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          content?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          action_url: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          action_url?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          action_url?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      match_status: MatchStatus;
      session_status: SessionStatus;
      goal_status: GoalStatus;
    };
  };
}

export type User = Database['public']['Tables']['users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type CheckIn = Database['public']['Tables']['check_ins']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type TrainingTrack = Database['public']['Tables']['training_tracks']['Row'];
export type TrainingModule = Database['public']['Tables']['training_modules']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
