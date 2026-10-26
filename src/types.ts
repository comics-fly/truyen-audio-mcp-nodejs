/**
 * Định nghĩa các kiểu dữ liệu cho dự án Truyen Audio MCP
 */

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
  readonly hint?: string;
  readonly allowed_values?: readonly string[];
}

export interface ApiResponse<T> {
  readonly success?: boolean;
  readonly status?: 'success' | 'error';
  readonly data?: T;
  readonly error?: ApiError | null;
  readonly error_code?: string;
  readonly message?: string;
  readonly meta?: PaginationMeta;
}

export interface PaginationMeta {
  readonly current_page?: number;
  readonly page?: number;
  readonly last_page?: number;
  readonly per_page: number;
  readonly total: number;
  readonly has_more?: boolean;
}

export interface TextStats {
  readonly words: number;
  readonly characters: number;
  readonly sentences: number;
}

export type TextMode = 'full' | 'minimal' | 'none';
export type FieldsParam = string | readonly string[];

// -------------------------------------------------------------
// Story Types
// -------------------------------------------------------------
export type StoryStatus = 'draft' | 'ongoing' | 'completed' | 'paused' | 'scheduled';

export interface StoryCategoryItem {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
}

export interface StorySummary {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly status: StoryStatus;
  readonly scheduled_publish_at?: string | null;
  readonly author: string;
  readonly categories: readonly (string | StoryCategoryItem)[];
  readonly chapters_count: number;
  readonly updated_at: string | null;
}

export interface StoryDetail extends Omit<StorySummary, 'categories'> {
  readonly categories: readonly StoryCategoryItem[];
  readonly short_description: string | null;
  readonly short_description_stats?: TextStats;
  readonly summary: string | null;
  readonly summary_stats?: TextStats;
  readonly meta: {
    readonly views: number;
    readonly ranking: number;
    readonly seo_keywords: string | null;
    readonly seo_description: string | null;
    readonly scheduled_publish_at?: string | null;
  };
}

export interface IndexStoryParams {
  readonly search?: string;
  readonly status?: StoryStatus;
  readonly category_id?: number;
  readonly per_page?: number;
  readonly page?: number;
  readonly fields?: FieldsParam;
}

export interface GetStoryDetailParams {
  readonly fields?: FieldsParam;
  readonly summary?: TextMode;
  readonly short_description?: TextMode;
  readonly include_text?: boolean;
}

export interface StoreStoryPayload {
  readonly title: string;
  readonly slug?: string | null;
  readonly status?: StoryStatus;
  readonly scheduled_publish_at?: string | null;
  readonly summary?: string | null;
  readonly short_description?: string | null;
  readonly seo_keywords?: string | null;
  readonly seo_description?: string | null;
  readonly category_ids?: readonly number[];
  readonly category_id?: number;
  readonly user_id?: number;
  readonly fields?: FieldsParam;
}

export interface UpdateStoryPayload {
  readonly title?: string;
  readonly slug?: string;
  readonly status?: StoryStatus;
  readonly scheduled_publish_at?: string | null;
  readonly summary?: string;
  readonly short_description?: string;
  readonly seo_keywords?: string;
  readonly seo_description?: string;
  readonly category_ids?: readonly number[];
  readonly category_id?: number;
  readonly add_category_ids?: readonly number[];
  readonly add_category_id?: number;
  readonly remove_category_ids?: readonly number[];
  readonly remove_category_id?: number;
  readonly fields?: FieldsParam;
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
  readonly summary_stats?: TextStats;
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
  readonly meta: {
    readonly is_locked: boolean;
    readonly unlock_price: number;
    readonly scheduled_publish_at?: string | null;
  };
}

export interface IndexChapterParams {
  readonly status?: ChapterStatus;
  readonly direction?: 'asc' | 'desc';
  readonly per_page?: number;
  readonly page?: number;
  readonly fields?: FieldsParam;
}

export interface GetChapterDetailParams {
  readonly fields?: FieldsParam;
  readonly content?: TextMode;
  readonly summary?: TextMode;
  readonly include_text?: boolean;
}

export interface StoreChapterPayload {
  readonly chapter_number?: number | null;
  readonly title?: string | null;
  readonly slug?: string | null;
  readonly status?: ChapterStatus | null;
  readonly scheduled_publish_at?: string | null;
  readonly content?: string | null;
  readonly summary?: string | null;
  readonly is_locked?: boolean;
  readonly unlock_price?: number;
  readonly fields?: FieldsParam;
}

export interface UpdateChapterPayload {
  readonly chapter_number?: number | null;
  readonly title?: string | null;
  readonly slug?: string | null;
  readonly status?: ChapterStatus | null;
  readonly scheduled_publish_at?: string | null;
  readonly summary?: string | null;
  readonly content?: string | null;
  readonly is_locked?: boolean;
  readonly unlock_price?: number;
  readonly fields?: FieldsParam;
}

export interface BatchSummaryPayload {
  readonly story_id?: number;
  readonly chapter_ids?: readonly number[];
  readonly chapter_numbers?: readonly number[];
  readonly fields?: FieldsParam;
}

export interface ContextWindowParams {
  readonly before?: number;
  readonly after?: number;
  readonly context?: TextMode;
  readonly fields?: FieldsParam;
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
  readonly fields?: FieldsParam;
}

export interface StoreCategoryPayload {
  readonly name: string;
  readonly slug?: string | null;
  readonly seo_keywords?: string | null;
  readonly seo_description?: string | null;
  readonly note?: string | null;
  readonly fields?: FieldsParam;
}

export interface UpdateCategoryPayload {
  readonly name?: string;
  readonly slug?: string | null;
  readonly seo_keywords?: string | null;
  readonly seo_description?: string | null;
  readonly note?: string | null;
  readonly fields?: FieldsParam;
}

// -------------------------------------------------------------
// Comment Types
// -------------------------------------------------------------
export interface CommentItem {
  readonly id: number;
  readonly story_id: number;
  readonly user_id: number;
  readonly user_name: string;
  readonly parent_id: number | null;
  readonly content: string;
  readonly replies_count: number;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface CommentDetail {
  readonly id: number;
  readonly story_id: number;
  readonly story_title?: string | null;
  readonly user: {
    readonly id: number;
    readonly name: string;
  };
  readonly parent_id: number | null;
  readonly content: string;
  readonly replies_count: number;
  readonly replies?: readonly CommentItem[];
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface IndexCommentParams {
  readonly story_id?: number;
  readonly user_id?: number;
  readonly parent_id?: number;
  readonly search?: string;
  readonly direction?: 'asc' | 'desc';
  readonly page?: number;
  readonly per_page?: number;
  readonly fields?: FieldsParam;
}

export interface StoreCommentPayload {
  readonly story_id?: number;
  readonly parent_id?: number | null;
  readonly content: string;
  readonly fields?: FieldsParam;
}

export interface UpdateCommentPayload {
  readonly content: string;
  readonly fields?: FieldsParam;
}

export interface DeleteCommentResult {
  readonly id: number;
  readonly deleted: boolean;
}
