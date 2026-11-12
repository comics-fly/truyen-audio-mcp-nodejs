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
  readonly views?: number;
  readonly likes?: number;
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
  readonly category_id?: number;
  readonly category_ids?: string | readonly number[];
  readonly category_slug?: string;
  readonly category_slugs?: string | readonly string[];
  readonly category_mode?: 'any' | 'all';
  readonly status?: StoryStatus;
  readonly statuses?: string | readonly StoryStatus[];
  readonly approval?: 'approved' | 'pending' | 'rejected' | 'all';
  readonly is_featured?: boolean;
  readonly user_id?: number;
  readonly author_name?: string;
  readonly only_mine?: boolean;
  readonly has_audio?: boolean;
  readonly has_video?: boolean;
  readonly is_paid?: boolean;
  readonly min_chapters?: number;
  readonly max_chapters?: number;
  readonly views?: number;
  readonly min_views?: number;
  readonly max_views?: number;
  readonly views_from?: number;
  readonly views_to?: number;
  readonly from_views?: number;
  readonly to_views?: number;
  readonly views_range?: string;
  readonly views_between?: string;
  readonly likes?: number;
  readonly min_likes?: number;
  readonly max_likes?: number;
  readonly likes_from?: number;
  readonly likes_to?: number;
  readonly from_likes?: number;
  readonly to_likes?: number;
  readonly likes_range?: string;
  readonly likes_between?: string;
  readonly updated_from?: string;
  readonly updated_to?: string;
  readonly sort_by?: 'updated_at' | 'created_at' | 'views' | 'likes' | 'chapters_count' | 'title' | 'id';
  readonly sort_dir?: 'asc' | 'desc';
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
  readonly has_audio?: boolean;
  readonly audio_duration_seconds?: number;
  readonly has_youtube?: boolean;
  readonly has_summary?: boolean;
  readonly views?: number;
  readonly likes?: number;
  readonly price?: number;
  readonly is_free?: boolean;
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
  readonly story_id?: number;
  readonly search?: string;
  readonly chapter_number?: number;
  readonly chapter_numbers?: string | readonly number[];
  readonly from_chapter?: number;
  readonly to_chapter?: number;
  readonly min_chapter?: number;
  readonly max_chapter?: number;
  readonly status?: ChapterStatus;
  readonly statuses?: string | readonly ChapterStatus[];
  readonly has_audio?: boolean;
  readonly has_video?: boolean;
  readonly has_youtube?: boolean;
  readonly has_summary?: boolean;
  readonly has_content?: boolean;
  readonly is_free?: boolean;
  readonly is_locked?: boolean;
  readonly price?: number;
  readonly min_price?: number;
  readonly max_price?: number;
  readonly from_price?: number;
  readonly to_price?: number;
  readonly price_from?: number;
  readonly price_to?: number;
  readonly price_range?: string;
  readonly price_between?: string;
  readonly views?: number;
  readonly min_views?: number;
  readonly max_views?: number;
  readonly from_views?: number;
  readonly to_views?: number;
  readonly views_from?: number;
  readonly views_to?: number;
  readonly views_range?: string;
  readonly views_between?: string;
  readonly likes?: number;
  readonly min_likes?: number;
  readonly max_likes?: number;
  readonly from_likes?: number;
  readonly to_likes?: number;
  readonly likes_from?: number;
  readonly likes_to?: number;
  readonly likes_range?: string;
  readonly likes_between?: string;
  readonly updated_from?: string;
  readonly updated_to?: string;
  readonly scheduled_from?: string;
  readonly scheduled_to?: string;
  readonly sort_by?: 'chapter_number' | 'id' | 'created_at' | 'updated_at' | 'title' | 'views' | 'likes' | 'price';
  readonly sort_dir?: 'asc' | 'desc';
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
  readonly chapter_id?: number | null;
  readonly chapter_number?: number | null;
  readonly parent_id: number | null;
  readonly depth?: number;
  readonly can_reply?: boolean;
  readonly content: string;
  readonly replies_count: number;
  readonly replies?: readonly CommentItem[];
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface CommentDetail {
  readonly id: number;
  readonly story_id: number;
  readonly story_title?: string | null;
  readonly chapter_id?: number | null;
  readonly chapter?: {
    readonly id: number;
    readonly title: string;
    readonly chapter_number: number;
  } | null;
  readonly user: {
    readonly id: number;
    readonly name: string;
  };
  readonly parent_id: number | null;
  readonly depth?: number;
  readonly can_reply?: boolean;
  readonly content: string;
  readonly replies_count: number;
  readonly replies?: readonly CommentItem[];
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface IndexCommentParams {
  readonly story_id?: number;
  readonly chapter_id?: number;
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
  readonly chapter_id?: number | null;
  readonly parent_id?: number | null;
  readonly user_id?: number;
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

// -------------------------------------------------------------
// Social Platform & Shared Types
// -------------------------------------------------------------
export type SocialPlatform =
  | 'facebook'
  | 'tiktok'
  | 'threads'
  | 'instagram'
  | 'youtube'
  | 'x'
  | 'telegram';

// -------------------------------------------------------------
// Post Social Types (Trích đoạn Mạng Xã Hội)
// -------------------------------------------------------------
export type PostSocialStatus = 'draft' | 'posted';

export interface PostSocialLinkItem {
  readonly id: number;
  readonly post_social_id: number;
  readonly platform: SocialPlatform;
  readonly platform_label?: string | null;
  readonly url: string;
  readonly user_id?: number | null;
  readonly user_name?: string | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface PostSocialItem {
  readonly id: number;
  readonly story_id: number;
  readonly story?: {
    readonly id: number;
    readonly title: string;
    readonly slug: string;
  };
  readonly chapter_id?: number | null;
  readonly chapter?: {
    readonly id: number;
    readonly chapter_number: number;
    readonly title: string;
    readonly slug: string;
  } | null;
  readonly user_id?: number | null;
  readonly user_name?: string | null;
  readonly status: PostSocialStatus;
  readonly status_label?: string | null;
  readonly image_url?: string | null;
  readonly links_count: number;
  readonly content?: string | null;
  readonly content_stats?: TextStats;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface PostSocialDetail extends PostSocialItem {
  readonly links?: readonly PostSocialLinkItem[];
}

export interface IndexPostSocialParams {
  readonly story_id?: number;
  readonly chapter_id?: number;
  readonly status?: PostSocialStatus;
  readonly platform?: SocialPlatform;
  readonly search?: string;
  readonly page?: number;
  readonly per_page?: number;
  readonly fields?: FieldsParam;
  readonly content?: TextMode;
}

export interface StorePostSocialPayload {
  readonly story_id?: number;
  readonly chapter_id?: number | null;
  readonly content: string;
  readonly image?: string | null;
  readonly status?: PostSocialStatus;
  readonly user_id?: number;
  readonly fields?: FieldsParam;
}

export interface UpdatePostSocialPayload {
  readonly story_id?: number;
  readonly chapter_id?: number | null;
  readonly content?: string;
  readonly image?: string | null;
  readonly status?: PostSocialStatus;
  readonly fields?: FieldsParam;
}

export interface StorePostSocialLinkPayload {
  readonly platform: SocialPlatform;
  readonly url: string;
  readonly user_id?: number;
  readonly fields?: FieldsParam;
}

export interface DeletePostSocialResult {
  readonly id: number;
  readonly deleted: boolean;
}

export interface DeletePostSocialLinkResult {
  readonly id: number;
  readonly post_social_id: number;
  readonly deleted: boolean;
}

// -------------------------------------------------------------
// Short Video Types (Kịch bản Video Ngắn)
// -------------------------------------------------------------
export type ShortVideoStatus = 'draft' | 'posted';

export interface ShortVideoLinkItem {
  readonly id: number;
  readonly short_video_id: number;
  readonly platform: SocialPlatform;
  readonly platform_label?: string | null;
  readonly url: string;
  readonly user_id?: number | null;
  readonly user_name?: string | null;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface ShortVideoItem {
  readonly id: number;
  readonly story_id: number;
  readonly story?: {
    readonly id: number;
    readonly title: string;
    readonly slug: string;
  };
  readonly chapter_id?: number | null;
  readonly chapter?: {
    readonly id: number;
    readonly chapter_number: number;
    readonly title: string;
    readonly slug: string;
  } | null;
  readonly user_id?: number | null;
  readonly user_name?: string | null;
  readonly status: ShortVideoStatus;
  readonly status_label?: string | null;
  readonly image_url?: string | null;
  readonly video_url?: string | null;
  readonly links_count: number;
  readonly script?: string | null;
  readonly script_stats?: TextStats;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface ShortVideoDetail extends ShortVideoItem {
  readonly links?: readonly ShortVideoLinkItem[];
}

export interface IndexShortVideoParams {
  readonly story_id?: number;
  readonly chapter_id?: number;
  readonly status?: ShortVideoStatus;
  readonly platform?: SocialPlatform;
  readonly search?: string;
  readonly page?: number;
  readonly per_page?: number;
  readonly fields?: FieldsParam;
  readonly script?: TextMode;
}

export interface StoreShortVideoPayload {
  readonly story_id?: number;
  readonly chapter_id?: number | null;
  readonly script: string;
  readonly image?: string | null;
  readonly video_url?: string | null;
  readonly status?: ShortVideoStatus;
  readonly user_id?: number;
  readonly fields?: FieldsParam;
}

export interface UpdateShortVideoPayload {
  readonly story_id?: number;
  readonly chapter_id?: number | null;
  readonly script?: string;
  readonly image?: string | null;
  readonly video_url?: string | null;
  readonly status?: ShortVideoStatus;
  readonly fields?: FieldsParam;
}

export interface StoreShortVideoLinkPayload {
  readonly platform: SocialPlatform;
  readonly url: string;
  readonly user_id?: number;
  readonly fields?: FieldsParam;
}

export interface DeleteShortVideoResult {
  readonly id: number;
  readonly deleted: boolean;
}

export interface DeleteShortVideoLinkResult {
  readonly short_video_id: number;
  readonly link_id: number;
  readonly deleted: boolean;
}
