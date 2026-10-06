/**
 * Định nghĩa các kiểu dữ liệu cho dự án Truyen Audio MCP
 */

export interface ApiResponse<T> {
  readonly status: 'success' | 'error';
  readonly data?: T;
  readonly error_code?: string;
  readonly message?: string;
  readonly meta?: PaginationMeta;
}

export interface PaginationMeta {
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

// -------------------------------------------------------------
// Story Types
// -------------------------------------------------------------
export type StoryStatus = 'draft' | 'published' | 'archived';

export interface StorySummary {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly status: StoryStatus;
  readonly author: string;
  readonly categories: readonly string[];
  readonly chapters_count: number;
  readonly updated_at: string | null;
}

export interface StoryDetail extends StorySummary {
  readonly short_description: string | null;
  readonly summary: string | null;
  readonly meta: {
    readonly views: number;
    readonly ranking: number;
    readonly seo_keywords: string | null;
    readonly seo_description: string | null;
  };
}

export interface IndexStoryParams {
  readonly search?: string;
  readonly status?: StoryStatus;
  readonly category?: string;
  readonly per_page?: number;
  readonly page?: number;
}

export interface StoreStoryPayload {
  readonly title: string;
  readonly categories?: readonly number[];
  readonly short_description?: string;
  readonly summary?: string;
  readonly meta?: {
    readonly seo_keywords?: string;
    readonly seo_description?: string;
  };
}

export interface UpdateStoryPayload {
  readonly status?: StoryStatus;
  readonly short_description?: string;
  readonly summary?: string;
}

// -------------------------------------------------------------
// Chapter Types
// -------------------------------------------------------------
export type ChapterStatus = 'draft' | 'published' | 'hidden';

export interface ChapterSummaryItem {
  readonly id: number;
  readonly story_id: number;
  readonly chapter_number: number;
  readonly title: string;
  readonly status: ChapterStatus;
  readonly summary: string | null;
}

export interface ChapterItem extends ChapterSummaryItem {
  readonly slug: string;
  readonly is_locked: boolean;
  readonly unlock_price: number;
  readonly updated_at: string | null;
}

export interface ChapterDetail extends ChapterItem {
  readonly content: string | null;
  readonly meta: {
    readonly is_locked: boolean;
    readonly unlock_price: number;
  };
}

export interface IndexChapterParams {
  readonly search?: string;
  readonly status?: ChapterStatus;
  readonly order_by?: 'asc' | 'desc';
  readonly per_page?: number;
  readonly page?: number;
}

export interface StoreChapterPayload {
  readonly title: string;
  readonly content?: string;
  readonly summary?: string;
  readonly meta?: {
    readonly is_locked?: boolean;
    readonly unlock_price?: number;
  };
}

export interface UpdateChapterPayload {
  readonly status?: ChapterStatus;
  readonly summary?: string;
  readonly content?: string;
}

export interface ContextWindowResult {
  readonly target_chapter: ChapterSummaryItem;
  readonly context_before: readonly ChapterSummaryItem[];
  readonly context_after: readonly ChapterSummaryItem[];
  readonly flags: {
    readonly has_more_before: boolean;
    readonly has_more_after: boolean;
  };
}

// -------------------------------------------------------------
// Category Types
// -------------------------------------------------------------
export interface CategorySummary {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly stories_count: number;
}

export interface CategoryDetail extends CategorySummary {
  readonly meta: {
    readonly image?: string | null;
    readonly seo_keywords?: string | null;
    readonly seo_description?: string | null;
    readonly note?: string | null;
  };
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface IndexCategoryParams {
  readonly search?: string;
  readonly per_page?: number;
  readonly page?: number;
}

export interface StoreCategoryPayload {
  readonly name: string;
  readonly slug?: string;
  readonly meta?: {
    readonly image?: string;
    readonly seo_keywords?: string;
    readonly seo_description?: string;
    readonly note?: string;
  };
}

export interface UpdateCategoryPayload {
  readonly name?: string;
  readonly slug?: string;
  readonly meta?: {
    readonly image?: string;
    readonly seo_keywords?: string;
    readonly seo_description?: string;
    readonly note?: string;
  };
}
