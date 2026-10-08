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

export interface TextStats {
  readonly words: number;
  readonly characters: number;
  readonly sentences: number;
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
  readonly short_description_stats?: TextStats;
  readonly summary: string | null;
  readonly summary_stats?: TextStats;
  readonly meta: {
    readonly views: number;
    readonly ranking: number;
    readonly seo_keywords: string | null;
    readonly seo_description: string | null;
  };
}

export interface GetStoryDetailParams {
  readonly include_text?: boolean;
  readonly include_summary?: boolean;
  readonly include_short_description?: boolean;
}

export interface StorySummaryResponse {
  readonly id: number;
  readonly title: string;
  readonly summary: string | null;
  readonly stats: TextStats;
}

export interface StoryShortDescriptionResponse {
  readonly id: number;
  readonly title: string;
  readonly short_description: string | null;
  readonly stats: TextStats;
}

export interface IndexStoryParams {
  readonly search?: string;
  readonly status?: StoryStatus;
  readonly category_id?: number;
  readonly per_page?: number;
  readonly page?: number;
}

export interface StoreStoryPayload {
  readonly title: string;
  readonly user_id?: number;
}

export interface UpdateStoryPayload {
  readonly status?: StoryStatus;
  readonly short_description?: string;
  readonly summary?: string;
}

export interface UpdateStorySummaryPayload {
  readonly summary: string;
}

export interface UpdateStoryShortDescriptionPayload {
  readonly short_description: string;
}

// -------------------------------------------------------------
// Chapter Types
// -------------------------------------------------------------
export type ChapterStatus = 'draft' | 'published' | 'hidden' | 'scheduled';

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
  readonly scheduled_publish_at?: string | null;
  readonly updated_at: string | null;
}

export interface ChapterDetail extends ChapterItem {
  readonly content: string | null;
  readonly content_stats?: TextStats;
  readonly summary_stats?: TextStats;
  readonly meta: {
    readonly is_locked: boolean;
    readonly unlock_price: number;
    readonly scheduled_publish_at?: string | null;
  };
}

export interface GetChapterDetailParams {
  readonly include_text?: boolean;
  readonly include_summary?: boolean;
  readonly include_content?: boolean;
}

export interface IndexChapterParams {
  readonly status?: ChapterStatus;
  readonly direction?: 'asc' | 'desc';
  readonly per_page?: number;
  readonly page?: number;
}

export interface StoreChapterPayload {
  readonly chapter_number?: number | null;
  readonly title?: string | null;
  readonly slug?: string | null;
  readonly status?: ChapterStatus | null;
  readonly content?: string | null;
  readonly summary?: string | null;
  readonly is_locked?: boolean;
  readonly unlock_price?: number;
  readonly scheduled_publish_at?: string | null;
}

export interface UpdateChapterPayload {
  readonly chapter_number?: number | null;
  readonly title?: string | null;
  readonly slug?: string | null;
  readonly status?: ChapterStatus | null;
  readonly summary?: string | null;
  readonly content?: string | null;
  readonly is_locked?: boolean;
  readonly unlock_price?: number;
  readonly scheduled_publish_at?: string | null;
}

export interface UpdateChapterSchedulePayload {
  readonly scheduled_publish_at: string;
}

export interface ChapterSummaryResponse {
  readonly id: number;
  readonly story_id: number;
  readonly chapter_number: number;
  readonly title: string;
  readonly summary: string | null;
  readonly stats: TextStats;
}

export interface ChapterContentResponse {
  readonly id: number;
  readonly story_id: number;
  readonly chapter_number: number;
  readonly title: string;
  readonly content: string | null;
  readonly stats: TextStats;
}

export interface UpdateChapterSummaryPayload {
  readonly summary: string;
}

export interface UpdateChapterContentPayload {
  readonly content: string;
}

export interface BatchSummaryPayload {
  readonly chapter_ids?: readonly number[];
  readonly chapter_numbers?: readonly number[];
}

export interface ContextWindowParams {
  readonly before?: number;
  readonly after?: number;
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
  readonly slug?: string | null;
  readonly seo_keywords?: string | null;
  readonly seo_description?: string | null;
  readonly note?: string | null;
}

export interface UpdateCategoryPayload {
  readonly name?: string;
  readonly slug?: string | null;
  readonly seo_keywords?: string | null;
  readonly seo_description?: string | null;
  readonly note?: string | null;
}
