// Database schema types generated from Supabase migrations
// This file should be kept in sync with SQL schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          customer_id: string | null
          name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          province: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          province: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          province?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artworks: {
        Row: {
          id: number
          title: string
          artist: string
          price: number
          category: string
          scale: 'large' | 'small'
          size: string
          year: number
          medium: string
          description: string
          details: string | null
          in_stock: boolean
          inventory: number
          edition: string
          image: string
          images: string[]
          tags: string[]
          base_processing_days: number
          processing_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          artist: string
          price: number
          category: string
          scale: 'large' | 'small'
          size: string
          year: number
          medium: string
          description: string
          details?: string | null
          in_stock?: boolean
          inventory?: number
          edition?: string
          image: string
          images?: string[]
          tags?: string[]
          base_processing_days?: number
          processing_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          artist?: string
          price?: number
          category?: string
          scale?: 'large' | 'small'
          size?: string
          year?: number
          medium?: string
          description?: string
          details?: string | null
          in_stock?: boolean
          inventory?: number
          edition?: string
          image?: string
          images?: string[]
          tags?: string[]
          base_processing_days?: number
          processing_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          shipping_name: string
          shipping_phone: string | null
          shipping_address: string
          shipping_city: string
          shipping_province: string
          shipping_postal_code: string
          shipping_country: string
          subtotal: number
          shipping_cost: number
          tax_amount: number
          total: number
          payment_type: 'full' | 'deposit' | 'invoice'
          payment_method: 'yoco' | 'stripe' | 'bank_transfer' | 'none' | null
          payment_status: 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'refunded'
          deposit_amount: number | null
          deposit_percentage: 30 | 40 | 50 | null
          balance_due: number | null
          balance_due_by: string | null
          status: 'pending_payment' | 'deposit_paid' | 'paid' | 'reserved' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          notes: string | null
          admin_notes: string | null
          estimated_processing_days: number | null
          estimated_ship_date: string | null
          estimated_delivery_date: string | null
          actual_processing_days: number | null
          processing_started_at: string | null
          processing_completed_at: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          reservation_expires_at: string | null
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          shipping_name: string
          shipping_phone?: string | null
          shipping_address: string
          shipping_city: string
          shipping_province: string
          shipping_postal_code: string
          shipping_country?: string
          subtotal: number
          shipping_cost?: number
          tax_amount?: number
          total: number
          payment_type: 'full' | 'deposit' | 'invoice'
          payment_method?: 'yoco' | 'stripe' | 'bank_transfer' | 'none' | null
          payment_status?: 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'refunded'
          deposit_amount?: number | null
          deposit_percentage?: 30 | 40 | 50 | null
          balance_due?: number | null
          balance_due_by?: string | null
          status?: 'pending_payment' | 'deposit_paid' | 'paid' | 'reserved' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          notes?: string | null
          admin_notes?: string | null
          estimated_processing_days?: number | null
          estimated_ship_date?: string | null
          estimated_delivery_date?: string | null
          actual_processing_days?: number | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          reservation_expires_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          shipping_name?: string
          shipping_phone?: string | null
          shipping_address?: string
          shipping_city?: string
          shipping_province?: string
          shipping_postal_code?: string
          shipping_country?: string
          subtotal?: number
          shipping_cost?: number
          tax_amount?: number
          total?: number
          payment_type?: 'full' | 'deposit' | 'invoice'
          payment_method?: 'yoco' | 'stripe' | 'bank_transfer' | 'none' | null
          payment_status?: 'pending' | 'deposit_paid' | 'paid' | 'failed' | 'refunded'
          deposit_amount?: number | null
          deposit_percentage?: 30 | 40 | 50 | null
          balance_due?: number | null
          balance_due_by?: string | null
          status?: 'pending_payment' | 'deposit_paid' | 'paid' | 'reserved' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          notes?: string | null
          admin_notes?: string | null
          estimated_processing_days?: number | null
          estimated_ship_date?: string | null
          estimated_delivery_date?: string | null
          actual_processing_days?: number | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          reservation_expires_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          artwork_id: number | null
          title: string
          artist: string
          price: number
          quantity: number
          image: string | null
          variant_selections: Json | null
          variant_price_adjustment: number | null
          processing_days: number | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          artwork_id?: number | null
          title: string
          artist: string
          price: number
          quantity?: number
          image?: string | null
          variant_selections?: Json | null
          variant_price_adjustment?: number | null
          processing_days?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          artwork_id?: number | null
          title?: string
          artist?: string
          price?: number
          quantity?: number
          image?: string | null
          variant_selections?: Json | null
          variant_price_adjustment?: number | null
          processing_days?: number | null
          created_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          order_id: string | null
          transaction_id: string
          payment_provider: 'yoco' | 'stripe'
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'refunded'
          payment_type: 'full' | 'deposit' | 'balance' | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          transaction_id: string
          payment_provider: 'yoco' | 'stripe'
          amount: number
          currency?: string
          status: 'pending' | 'succeeded' | 'failed' | 'refunded'
          payment_type?: 'full' | 'deposit' | 'balance' | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          transaction_id?: string
          payment_provider?: 'yoco' | 'stripe'
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded'
          payment_type?: 'full' | 'deposit' | 'balance' | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      inquiries: {
        Row: {
          id: string
          kind: 'artwork' | 'general'
          name: string
          email: string
          phone: string | null
          message: string
          artwork_id: number | null
          artwork_title: string | null
          status: 'new' | 'contacted' | 'responded' | 'closed'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          kind: 'artwork' | 'general'
          name: string
          email: string
          phone?: string | null
          message: string
          artwork_id?: number | null
          artwork_title?: string | null
          status?: 'new' | 'contacted' | 'responded' | 'closed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          kind?: 'artwork' | 'general'
          name?: string
          email?: string
          phone?: string | null
          message?: string
          artwork_id?: number | null
          artwork_title?: string | null
          status?: 'new' | 'contacted' | 'responded' | 'closed'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artwork_variants: {
        Row: {
          id: string
          artwork_id: number
          variant_type: 'frame' | 'canvas_type'
          name: string
          description: string | null
          price_adjustment: number
          processing_days: number
          in_stock: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artwork_id: number
          variant_type: 'frame' | 'canvas_type'
          name: string
          description?: string | null
          price_adjustment?: number
          processing_days?: number
          in_stock?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artwork_id?: number
          variant_type?: 'frame' | 'canvas_type'
          name?: string
          description?: string | null
          price_adjustment?: number
          processing_days?: number
          in_stock?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      artwork_videos: {
        Row: {
          id: string
          artwork_id: number
          title: string
          description: string | null
          video_type: 'process' | 'detail' | 'installation' | 'exhibition'
          storage_url: string | null
          youtube_id: string | null
          thumbnail_url: string | null
          duration: number | null
          sort_order: number
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artwork_id: number
          title: string
          description?: string | null
          video_type?: 'process' | 'detail' | 'installation' | 'exhibition'
          storage_url?: string | null
          youtube_id?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          sort_order?: number
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artwork_id?: number
          title?: string
          description?: string | null
          video_type?: 'process' | 'detail' | 'installation' | 'exhibition'
          storage_url?: string | null
          youtube_id?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          sort_order?: number
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      standalone_videos: {
        Row: {
          id: string
          title: string
          description: string | null
          video_type: 'interview' | 'studio_tour' | 'exhibition' | 'marketing' | 'tutorial'
          storage_url: string | null
          youtube_id: string | null
          thumbnail_url: string | null
          duration: number | null
          is_featured: boolean
          published: boolean
          slug: string
          tags: string[]
          view_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_type: 'interview' | 'studio_tour' | 'exhibition' | 'marketing' | 'tutorial'
          storage_url?: string | null
          youtube_id?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          is_featured?: boolean
          published?: boolean
          slug?: string
          tags?: string[]
          view_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_type?: 'interview' | 'studio_tour' | 'exhibition' | 'marketing' | 'tutorial'
          storage_url?: string | null
          youtube_id?: string | null
          thumbnail_url?: string | null
          duration?: number | null
          is_featured?: boolean
          published?: boolean
          slug?: string
          tags?: string[]
          view_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      updates: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          cover_image: string | null
          category: 'news' | 'exhibition' | 'studio_update' | 'press'
          tags: string[]
          author: string
          published: boolean
          published_at: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string
          content: string
          excerpt?: string | null
          cover_image?: string | null
          category?: 'news' | 'exhibition' | 'studio_update' | 'press'
          tags?: string[]
          author?: string
          published?: boolean
          published_at?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          cover_image?: string | null
          category?: 'news' | 'exhibition' | 'studio_update' | 'press'
          tags?: string[]
          author?: string
          published?: boolean
          published_at?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          status: 'active' | 'unsubscribed'
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          status?: 'active' | 'unsubscribed'
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          status?: 'active' | 'unsubscribed'
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
      }
      order_invoices: {
        Row: {
          id: string
          order_id: string
          invoice_number: string
          invoice_type: 'proforma' | 'final' | 'deposit' | 'balance'
          amount: number
          currency: string
          pdf_url: string | null
          issued_at: string
          due_date: string | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          invoice_number: string
          invoice_type: 'proforma' | 'final' | 'deposit' | 'balance'
          amount: number
          currency?: string
          pdf_url?: string | null
          issued_at?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          invoice_number?: string
          invoice_type?: 'proforma' | 'final' | 'deposit' | 'balance'
          amount?: number
          currency?: string
          pdf_url?: string | null
          issued_at?: string
          due_date?: string | null
          paid_at?: string | null
          created_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          payment_status: string | null
          note: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          payment_status?: string | null
          note?: string | null
          created_by?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          payment_status?: string | null
          note?: string | null
          created_by?: string
          created_at?: string
        }
      }
      order_updates: {
        Row: {
          id: string
          order_id: string
          update_type: 'payment' | 'shipping' | 'production' | 'general'
          title: string
          message: string
          is_customer_visible: boolean
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          update_type: 'payment' | 'shipping' | 'production' | 'general'
          title: string
          message: string
          is_customer_visible?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          update_type?: 'payment' | 'shipping' | 'production' | 'general'
          title?: string
          message?: string
          is_customer_visible?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      decrement_artwork_inventory: {
        Args: {
          artwork_id_param: number
          quantity_param: number
        }
        Returns: boolean
      }
      restore_artwork_inventory: {
        Args: {
          artwork_id_param: number
          quantity_param: number
        }
        Returns: boolean
      }
      calculate_shipping_cost: {
        Args: {
          subtotal_param: number
          country_param: string
        }
        Returns: number
      }
      calculate_vat: {
        Args: {
          amount: number
        }
        Returns: number
      }
      expire_reservations: {
        Args: Record<string, never>
        Returns: {
          expired_order_id: string
          order_number: string
        }[]
      }
      set_current_email: {
        Args: {
          email: string
        }
        Returns: void
      }
      calculate_variant_price: {
        Args: {
          base_price_param: number
          variant_ids: string[]
        }
        Returns: number
      }
      calculate_item_processing_days: {
        Args: {
          artwork_id_param: number
          variant_ids: string[]
        }
        Returns: number
      }
      increment_video_views: {
        Args: {
          video_id_param: string
          is_artwork_video: boolean
        }
        Returns: boolean
      }
      generate_invoice_number: {
        Args: Record<string, never>
        Returns: string
      }
      calculate_order_processing_time: {
        Args: {
          order_id_param: string
        }
        Returns: number
      }
      estimate_delivery_dates: {
        Args: {
          order_id_param: string
          processing_days_param: number
          shipping_country_param: string
        }
        Returns: {
          ship_date: string
          delivery_date: string
        }[]
      }
      create_order_update: {
        Args: {
          order_id_param: string
          update_type_param: string
          title_param: string
          message_param: string
        }
        Returns: string
      }
    }
  }
}
