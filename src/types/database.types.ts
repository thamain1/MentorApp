export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'mentor' | 'mentee';
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type SessionType = '1on1' | 'group';
export type MeetingType = 'video' | 'voice' | 'chat';
export type RecurrenceType = 'none' | 'weekly' | 'biweekly' | 'monthly';
export type ConversationType = 'direct' | 'announcement';

export interface Database {
  public: {
    Tables: {
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
          avatar_position_x: number;
          avatar_position_y: number;
          guidelines_accepted_at: string | null;
          created_at: string;
          updated_at: string;
          is_blocked: boolean;
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
          avatar_position_x?: number;
          avatar_position_y?: number;
          guidelines_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_blocked?: boolean;
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
          avatar_position_x?: number;
          avatar_position_y?: number;
          guidelines_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          is_blocked?: boolean;
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
      mentor_specialties: {
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
          requested_at: string;
          approved_at: string | null;
          approved_by: string | null;
          ended_at: string | null;
          mentee_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          mentee_id: string;
          status?: MatchStatus;
          requested_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          ended_at?: string | null;
          mentee_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          mentee_id?: string;
          status?: MatchStatus;
          requested_at?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          ended_at?: string | null;
          mentee_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sessions: {
        Row: {
          id: string;
          match_id: string | null;
          scheduled_at: string;
          google_event_id: string | null;
          status: SessionStatus;
          completed_at: string | null;
          mentee_notes: string | null;
          mentor_notes: string | null;
          created_at: string;
          session_type: SessionType;
          meeting_type: MeetingType;
          meeting_url: string | null;
          title: string | null;
          description: string | null;
          organizer_id: string | null;
          duration_mins: number;
          recurrence: RecurrenceType;
          recurrence_end_date: string | null;
        };
        Insert: {
          id?: string;
          match_id?: string | null;
          scheduled_at: string;
          google_event_id?: string | null;
          status?: SessionStatus;
          completed_at?: string | null;
          mentee_notes?: string | null;
          mentor_notes?: string | null;
          created_at?: string;
          session_type?: SessionType;
          meeting_type?: MeetingType;
          meeting_url?: string | null;
          title?: string | null;
          description?: string | null;
          organizer_id?: string | null;
          duration_mins?: number;
          recurrence?: RecurrenceType;
          recurrence_end_date?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string | null;
          scheduled_at?: string;
          google_event_id?: string | null;
          status?: SessionStatus;
          completed_at?: string | null;
          mentee_notes?: string | null;
          mentor_notes?: string | null;
          created_at?: string;
          session_type?: SessionType;
          meeting_type?: MeetingType;
          meeting_url?: string | null;
          title?: string | null;
          description?: string | null;
          organizer_id?: string | null;
          duration_mins?: number;
          recurrence?: RecurrenceType;
          recurrence_end_date?: string | null;
        };
        Relationships: [];
      };
      session_participants: {
        Row: {
          id: string;
          session_id: string;
          profile_id: string;
          status: string;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          profile_id: string;
          status?: string;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          profile_id?: string;
          status?: string;
          invited_by?: string | null;
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
          display_order: number;
          badge_image_url: string | null;
          target_role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          display_order?: number;
          badge_image_url?: string | null;
          target_role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          display_order?: number;
          badge_image_url?: string | null;
          target_role?: string;
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
          display_order: number;
          duration_mins: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          title: string;
          content: string;
          display_order?: number;
          duration_mins?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          title?: string;
          content?: string;
          display_order?: number;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          completed_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          image_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type?: string;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          group_id: string | null;
          user_id: string;
          content: string;
          image_urls: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string | null;
          user_id: string;
          content: string;
          image_urls?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string | null;
          user_id?: string;
          content?: string;
          image_urls?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          type: string;
          title: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type?: string;
          title?: string | null;
          created_by?: string | null;
        };
        Update: {
          type?: string;
          title?: string | null;
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          profile_id: string;
          added_by: string | null;
          joined_at: string;
        };
        Insert: {
          conversation_id: string;
          profile_id: string;
          added_by?: string | null;
        };
        Update: {
          added_by?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          match_id: string | null;
          conversation_id?: string | null;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id?: string | null;
          conversation_id?: string | null;
          sender_id: string;
          content: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string | null;
          conversation_id?: string | null;
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
      mentor_surveys: {
        Row: {
          id: string;
          match_id: string;
          mentee_id: string;
          mentor_id: string;
          survey_month: string;
          overall_rating: number;
          communication_rating: number;
          helpfulness_rating: number;
          feedback_text: string | null;
          created_at: string;
        };
        Insert: {
          match_id: string;
          mentee_id: string;
          mentor_id: string;
          survey_month: string;
          overall_rating: number;
          communication_rating: number;
          helpfulness_rating: number;
          feedback_text?: string | null;
        };
        Update: Record<string, never>;
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

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionParticipant = Database['public']['Tables']['session_participants']['Row'];
export type CheckIn = Database['public']['Tables']['check_ins']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type TrainingTrack = Database['public']['Tables']['training_tracks']['Row'];
export type TrainingModule = Database['public']['Tables']['training_modules']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type GroupMember = Database['public']['Tables']['group_members']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostLike = Database['public']['Tables']['post_likes']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type ConversationParticipant = Database['public']['Tables']['conversation_participants']['Row'];
export type MentorSurvey = Database['public']['Tables']['mentor_surveys']['Row'];
