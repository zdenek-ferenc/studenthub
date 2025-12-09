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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      AcademicRequest: {
        Row: {
          created_at: string
          description: string | null
          id: string
          join_code: string | null
          professor_id: string
          semester: string | null
          status: string | null
          student_count: number | null
          subject_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          join_code?: string | null
          professor_id: string
          semester?: string | null
          status?: string | null
          student_count?: number | null
          subject_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          join_code?: string | null
          professor_id?: string
          semester?: string | null
          status?: string | null
          student_count?: number | null
          subject_name?: string
        }
        Relationships: []
      }
      Category: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      Challenge: {
        Row: {
          academic_request_id: string | null
          attachments_urls: string[] | null
          created_at: string | null
          deadline: string | null
          description: string | null
          entry_fee_amount: number | null
          expected_outputs: string | null
          goals: string | null
          has_financial_reward: boolean | null
          id: string
          max_applicants: number | null
          number_of_winners: number | null
          payment_status: string | null
          prize_amount: number | null
          reward_description: string | null
          reward_first_place: number | null
          reward_second_place: number | null
          reward_third_place: number | null
          short_description: string | null
          startup_id: string
          status: Database["public"]["Enums"]["challenge_status"] | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          title: string
          top_until: string | null
          type: Database["public"]["Enums"]["challenge_type"] | null
          updated_at: string | null
        }
        Insert: {
          academic_request_id?: string | null
          attachments_urls?: string[] | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          entry_fee_amount?: number | null
          expected_outputs?: string | null
          goals?: string | null
          has_financial_reward?: boolean | null
          id?: string
          max_applicants?: number | null
          number_of_winners?: number | null
          payment_status?: string | null
          prize_amount?: number | null
          reward_description?: string | null
          reward_first_place?: number | null
          reward_second_place?: number | null
          reward_third_place?: number | null
          short_description?: string | null
          startup_id: string
          status?: Database["public"]["Enums"]["challenge_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          title: string
          top_until?: string | null
          type?: Database["public"]["Enums"]["challenge_type"] | null
          updated_at?: string | null
        }
        Update: {
          academic_request_id?: string | null
          attachments_urls?: string[] | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          entry_fee_amount?: number | null
          expected_outputs?: string | null
          goals?: string | null
          has_financial_reward?: boolean | null
          id?: string
          max_applicants?: number | null
          number_of_winners?: number | null
          payment_status?: string | null
          prize_amount?: number | null
          reward_description?: string | null
          reward_first_place?: number | null
          reward_second_place?: number | null
          reward_third_place?: number | null
          short_description?: string | null
          startup_id?: string
          status?: Database["public"]["Enums"]["challenge_status"] | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          title?: string
          top_until?: string | null
          type?: Database["public"]["Enums"]["challenge_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Challenge_academic_request_id_fkey"
            columns: ["academic_request_id"]
            isOneToOne: false
            referencedRelation: "AcademicRequest"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Challenge_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "StartupProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ChallengeQuestion: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          challenge_id: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          question_text: string
          student_id: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          challenge_id: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          question_text: string
          student_id: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          challenge_id?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          question_text?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChallengeQuestion_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "Challenge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChallengeQuestion_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_challengequestion_studentprofile"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ChallengeSkill: {
        Row: {
          challenge_id: string
          skill_id: string
        }
        Insert: {
          challenge_id: string
          skill_id: string
        }
        Update: {
          challenge_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ChallengeSkill_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "Challenge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ChallengeSkill_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "Skill"
            referencedColumns: ["id"]
          },
        ]
      }
      ContactRequest: {
        Row: {
          created_at: string
          id: string
          message: string | null
          originating_challenge_id: string | null
          startup_id: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          originating_challenge_id?: string | null
          startup_id: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          originating_challenge_id?: string | null
          startup_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ContactRequest_originating_challenge_id_fkey"
            columns: ["originating_challenge_id"]
            isOneToOne: false
            referencedRelation: "Challenge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ContactRequest_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ContactRequest_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CourseEnrollment: {
        Row: {
          academic_request_id: string
          id: string
          joined_at: string
          student_id: string
        }
        Insert: {
          academic_request_id: string
          id?: string
          joined_at?: string
          student_id: string
        }
        Update: {
          academic_request_id?: string
          id?: string
          joined_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "CourseEnrollment_academic_request_id_fkey"
            columns: ["academic_request_id"]
            isOneToOne: false
            referencedRelation: "AcademicRequest"
            referencedColumns: ["id"]
          },
        ]
      }
      Feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          reviewer_id: string
          submission_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reviewer_id: string
          submission_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reviewer_id?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Feedback_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "Submission"
            referencedColumns: ["id"]
          },
        ]
      }
      Language: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          related_contact_request_id: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          related_contact_request_id?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          related_contact_request_id?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_contact_request_id_fkey"
            columns: ["related_contact_request_id"]
            isOneToOne: false
            referencedRelation: "ContactRequest"
            referencedColumns: ["id"]
          },
        ]
      }
      Payment: {
        Row: {
          amount_in_cents: number
          created_at: string | null
          currency: string
          id: string
          product_metadata: Json | null
          product_type: Database["public"]["Enums"]["payment_product"] | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_in_cents: number
          created_at?: string | null
          currency?: string
          id?: string
          product_metadata?: Json | null
          product_type?: Database["public"]["Enums"]["payment_product"] | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_in_cents?: number
          created_at?: string | null
          currency?: string
          id?: string
          product_metadata?: Json | null
          product_type?: Database["public"]["Enums"]["payment_product"] | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ProfessorProfile: {
        Row: {
          bio: string | null
          created_at: string
          faculty_name: string | null
          id: string
          title_after: string | null
          title_before: string | null
          university_name: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          faculty_name?: string | null
          id?: string
          title_after?: string | null
          title_before?: string | null
          university_name: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          faculty_name?: string | null
          id?: string
          title_after?: string | null
          title_before?: string | null
          university_name?: string
          user_id?: string
        }
        Relationships: []
      }
      SavedChallenge: {
        Row: {
          challenge_id: string
          created_at: string
          student_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          student_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "SavedChallenge_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "Challenge"
            referencedColumns: ["id"]
          },
        ]
      }
      Skill: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      StartupCategory: {
        Row: {
          category_id: string
          startup_id: string
        }
        Insert: {
          category_id: string
          startup_id: string
        }
        Update: {
          category_id?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StartupCategory_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StartupCategory_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "StartupProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      StartupProfile: {
        Row: {
          address: string | null
          company_name: string | null
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          contact_position: string | null
          created_at: string | null
          credits: number | null
          description: string | null
          gdpr_consent: boolean | null
          ico: string | null
          ideal_candidate_description: string | null
          logo_url: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          registration_step: number | null
          updated_at: string | null
          user_id: string
          vision: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_position?: string | null
          created_at?: string | null
          credits?: number | null
          description?: string | null
          gdpr_consent?: boolean | null
          ico?: string | null
          ideal_candidate_description?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          registration_step?: number | null
          updated_at?: string | null
          user_id: string
          vision?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          contact_email?: string | null
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_position?: string | null
          created_at?: string | null
          credits?: number | null
          description?: string | null
          gdpr_consent?: boolean | null
          ico?: string | null
          ideal_candidate_description?: string | null
          logo_url?: string | null
          onboarding_completed?: boolean | null
          phone_number?: string | null
          registration_step?: number | null
          updated_at?: string | null
          user_id?: string
          vision?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "StartupProfile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StartupQuestion: {
        Row: {
          answer_text: string | null
          answered_at: string | null
          asker_id: string | null
          created_at: string
          id: string
          is_approved: boolean
          question_text: string
          startup_id: string
        }
        Insert: {
          answer_text?: string | null
          answered_at?: string | null
          asker_id?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          question_text: string
          startup_id: string
        }
        Update: {
          answer_text?: string | null
          answered_at?: string | null
          asker_id?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          question_text?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StartupQuestion_asker_id_fkey"
            columns: ["asker_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StartupQuestion_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "StartupProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      StartupTechnology: {
        Row: {
          startup_id: string
          technology_id: string
        }
        Insert: {
          startup_id: string
          technology_id: string
        }
        Update: {
          startup_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StartupTechnology_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "StartupProfile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "StartupTechnology_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "Technology"
            referencedColumns: ["id"]
          },
        ]
      }
      StudentLanguage: {
        Row: {
          language_id: string
          student_id: string
        }
        Insert: {
          language_id: string
          student_id: string
        }
        Update: {
          language_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "StudentLanguage_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "Language"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudentLanguage_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      StudentProfile: {
        Row: {
          bio: string | null
          charges_enabled: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dribbble_url: string | null
          field_of_study: string | null
          first_name: string | null
          gdpr_consent: boolean | null
          github_url: string | null
          last_name: string | null
          level: number
          linkedin_url: string | null
          onboarding_completed: boolean | null
          personal_website_url: string | null
          phone_number: string | null
          profile_picture_url: string | null
          recruitment_status: string | null
          registration_step: number | null
          specialization: string | null
          stripe_connect_id: string | null
          university: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          xp: number
          year_of_study: number | null
        }
        Insert: {
          bio?: string | null
          charges_enabled?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          dribbble_url?: string | null
          field_of_study?: string | null
          first_name?: string | null
          gdpr_consent?: boolean | null
          github_url?: string | null
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          personal_website_url?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          recruitment_status?: string | null
          registration_step?: number | null
          specialization?: string | null
          stripe_connect_id?: string | null
          university?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          xp?: number
          year_of_study?: number | null
        }
        Update: {
          bio?: string | null
          charges_enabled?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          dribbble_url?: string | null
          field_of_study?: string | null
          first_name?: string | null
          gdpr_consent?: boolean | null
          github_url?: string | null
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          onboarding_completed?: boolean | null
          personal_website_url?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          recruitment_status?: string | null
          registration_step?: number | null
          specialization?: string | null
          stripe_connect_id?: string | null
          university?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          xp?: number
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "StudentProfile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      StudentSkill: {
        Row: {
          level: number | null
          skill_id: string
          student_id: string
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          level?: number | null
          skill_id: string
          student_id: string
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          level?: number | null
          skill_id?: string
          student_id?: string
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "StudentSkill_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "Skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "StudentSkill_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Submission: {
        Row: {
          academic_feedback: string | null
          academic_grade: string | null
          business_score: number | null
          challenge_id: string
          completed_outputs: Json | null
          created_at: string | null
          feedback_comment: string | null
          file_url: string | null
          id: string
          is_favorite: boolean | null
          is_open_to_work: boolean | null
          is_public_on_profile: boolean
          link: string | null
          position: number | null
          rating: number | null
          status: Database["public"]["Enums"]["submission_status"] | null
          student_id: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          academic_feedback?: string | null
          academic_grade?: string | null
          business_score?: number | null
          challenge_id: string
          completed_outputs?: Json | null
          created_at?: string | null
          feedback_comment?: string | null
          file_url?: string | null
          id?: string
          is_favorite?: boolean | null
          is_open_to_work?: boolean | null
          is_public_on_profile?: boolean
          link?: string | null
          position?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          student_id: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_feedback?: string | null
          academic_grade?: string | null
          business_score?: number | null
          challenge_id?: string
          completed_outputs?: Json | null
          created_at?: string | null
          feedback_comment?: string | null
          file_url?: string | null
          id?: string
          is_favorite?: boolean | null
          is_open_to_work?: boolean | null
          is_public_on_profile?: boolean
          link?: string | null
          position?: number | null
          rating?: number | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          student_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Submission_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "Challenge"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Submission_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "StudentProfile"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Technology: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      User: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          last_login_at: string | null
          password_hash: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          password_hash?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          password_hash?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      XpEvent: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_seen: boolean
          new_level: number | null
          skill_id: string | null
          student_id: string
          submission_id: string | null
          xp_gained: number
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          is_seen?: boolean
          new_level?: number | null
          skill_id?: string | null
          student_id: string
          submission_id?: string | null
          xp_gained: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_seen?: boolean
          new_level?: number | null
          skill_id?: string | null
          student_id?: string
          submission_id?: string | null
          xp_gained?: number
        }
        Relationships: [
          {
            foreignKeyName: "XpEvent_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "Skill"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "XpEvent_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "XpEvent_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "Submission"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_contact_eligibility: {
        Args: { p_startup_id: string; p_student_id: string }
        Returns: Database["public"]["CompositeTypes"]["contact_eligibility_status"]
        SetofOptions: {
          from: "*"
          to: "contact_eligibility_status"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_user_auth_role: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      get_challenge_applicant_count: {
        Args: { challenge_id: string }
        Returns: number
      }
      get_challenges_with_skills: {
        Args: { p_search_term: string; p_skill_ids: string[] }
        Returns: {
          academic_request_id: string | null
          attachments_urls: string[] | null
          created_at: string | null
          deadline: string | null
          description: string | null
          entry_fee_amount: number | null
          expected_outputs: string | null
          goals: string | null
          has_financial_reward: boolean | null
          id: string
          max_applicants: number | null
          number_of_winners: number | null
          payment_status: string | null
          prize_amount: number | null
          reward_description: string | null
          reward_first_place: number | null
          reward_second_place: number | null
          reward_third_place: number | null
          short_description: string | null
          startup_id: string
          status: Database["public"]["Enums"]["challenge_status"] | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          title: string
          top_until: string | null
          type: Database["public"]["Enums"]["challenge_type"] | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "Challenge"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_startups_with_categories: {
        Args: { category_ids: string[]; search_term: string }
        Returns: {
          address: string | null
          company_name: string | null
          contact_email: string | null
          contact_first_name: string | null
          contact_last_name: string | null
          contact_position: string | null
          created_at: string | null
          credits: number | null
          description: string | null
          gdpr_consent: boolean | null
          ico: string | null
          ideal_candidate_description: string | null
          logo_url: string | null
          onboarding_completed: boolean | null
          phone_number: string | null
          registration_step: number | null
          updated_at: string | null
          user_id: string
          vision: string | null
          website: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "StartupProfile"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_student_rewards: {
        Args: { p_student_id: string }
        Returns: {
          total_earnings: number
          total_wins: number
        }[]
      }
      get_students_with_all_skills: {
        Args: { p_search_term: string; p_skill_ids: string[] }
        Returns: {
          user_id: string
        }[]
      }
      get_students_with_skills: {
        Args: { search_term: string; skill_ids: string[] }
        Returns: {
          bio: string | null
          charges_enabled: boolean | null
          created_at: string | null
          date_of_birth: string | null
          dribbble_url: string | null
          field_of_study: string | null
          first_name: string | null
          gdpr_consent: boolean | null
          github_url: string | null
          last_name: string | null
          level: number
          linkedin_url: string | null
          onboarding_completed: boolean | null
          personal_website_url: string | null
          phone_number: string | null
          profile_picture_url: string | null
          recruitment_status: string | null
          registration_step: number | null
          specialization: string | null
          stripe_connect_id: string | null
          university: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          xp: number
          year_of_study: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "StudentProfile"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      handle_deadline_reminders_v2: { Args: never; Returns: undefined }
      mark_all_xp_events_as_seen: { Args: never; Returns: undefined }
      recalculate_student_progress: {
        Args: { student_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      challenge_status: "draft" | "open" | "closed" | "archived"
      challenge_type: "public" | "anonymous"
      contact_status: "pending" | "accepted" | "rejected"
      payment_product: "credits" | "subscription" | "promotion"
      payment_status: "pending" | "succeeded" | "failed"
      submission_status:
        | "applied"
        | "submitted"
        | "reviewed"
        | "winner"
        | "rejected"
      user_role: "student" | "startup" | "admin" | "professor"
    }
    CompositeTypes: {
      contact_eligibility_status: {
        can_contact: boolean | null
        reason: string | null
        status: string | null
        challenge_id: string | null
      }
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
      challenge_status: ["draft", "open", "closed", "archived"],
      challenge_type: ["public", "anonymous"],
      contact_status: ["pending", "accepted", "rejected"],
      payment_product: ["credits", "subscription", "promotion"],
      payment_status: ["pending", "succeeded", "failed"],
      submission_status: [
        "applied",
        "submitted",
        "reviewed",
        "winner",
        "rejected",
      ],
      user_role: ["student", "startup", "admin", "professor"],
    },
  },
} as const
