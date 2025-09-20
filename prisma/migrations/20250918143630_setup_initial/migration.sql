/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Album` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AlbumCollaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AlbumFavorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AlbumOnContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Annotation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DemoQuota` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FollowRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follower` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SeedContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShareToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_userId_fkey";

-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Album" DROP CONSTRAINT "Album_shareTokenId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumCollaborator" DROP CONSTRAINT "AlbumCollaborator_albumId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumCollaborator" DROP CONSTRAINT "AlbumCollaborator_userId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumFavorite" DROP CONSTRAINT "AlbumFavorite_albumId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumFavorite" DROP CONSTRAINT "AlbumFavorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumOnContent" DROP CONSTRAINT "AlbumOnContent_albumId_fkey";

-- DropForeignKey
ALTER TABLE "AlbumOnContent" DROP CONSTRAINT "AlbumOnContent_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_shareTokenId_fkey";

-- DropForeignKey
ALTER TABLE "Annotation" DROP CONSTRAINT "Annotation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentCommentId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_copiedFromId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_shareTokenId_fkey";

-- DropForeignKey
ALTER TABLE "DemoQuota" DROP CONSTRAINT "DemoQuota_userId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_fromId_fkey";

-- DropForeignKey
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_toId_fkey";

-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follower" DROP CONSTRAINT "Follower_followingId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_albumId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_annotationId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "ShareToken" DROP CONSTRAINT "ShareToken_createdById_fkey";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Album";

-- DropTable
DROP TABLE "AlbumCollaborator";

-- DropTable
DROP TABLE "AlbumFavorite";

-- DropTable
DROP TABLE "AlbumOnContent";

-- DropTable
DROP TABLE "Annotation";

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Content";

-- DropTable
DROP TABLE "DemoQuota";

-- DropTable
DROP TABLE "Favorite";

-- DropTable
DROP TABLE "FollowRequest";

-- DropTable
DROP TABLE "Follower";

-- DropTable
DROP TABLE "Invite";

-- DropTable
DROP TABLE "Media";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "SeedContent";

-- DropTable
DROP TABLE "ShareToken";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password_hash" TEXT,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "visibility" "UserVisibility" NOT NULL DEFAULT 'PRIVATE',
    "avatar_url" TEXT,
    "bio" TEXT,
    "comments_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_codes" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "email_verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_codes" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_requests" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "message" TEXT,
    "status" "FollowRequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "follow_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "Category" NOT NULL,
    "cover_url" TEXT,
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "ConsumptionStatus" NOT NULL DEFAULT 'TO_WATCH',
    "rating" REAL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "shareTokenId" TEXT,
    "copiedFromId" TEXT,

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "share_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "albums" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_url" TEXT,
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "shareTokenId" TEXT,

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album_on_content" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "order_index" INTEGER,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,

    CONSTRAINT "album_on_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album_collaborators" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_collaborators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "album_favorites" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "contentId" TEXT,
    "albumId" TEXT,
    "parentCommentId" TEXT,
    "text" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "shareTokenId" TEXT,

    CONSTRAINT "annotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entity_type" "ReactionEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "emoji" "EmojiType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT,
    "commentId" TEXT,
    "annotationId" TEXT,

    CONSTRAINT "reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" "EntityType",
    "entityId" TEXT,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "entityId" TEXT,
    "entity_type" "EntityType",
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentId" TEXT,
    "albumId" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seed_contents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "Category" NOT NULL,
    "cover_url" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seed_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toUserId" TEXT,
    "toEmail" TEXT,
    "albumId" TEXT,
    "message" TEXT,
    "status" "FollowRequestStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_quotas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "max_allowed" INTEGER NOT NULL DEFAULT 50,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "mimetype" TEXT,
    "size" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_is_demo_idx" ON "users"("is_demo");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_visibility_idx" ON "users"("visibility");

-- CreateIndex
CREATE INDEX "followers_followingId_idx" ON "followers"("followingId");

-- CreateIndex
CREATE INDEX "followers_followerId_idx" ON "followers"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "followers_followerId_followingId_key" ON "followers"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "follow_requests_status_idx" ON "follow_requests"("status");

-- CreateIndex
CREATE INDEX "follow_requests_created_at_idx" ON "follow_requests"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "follow_requests_fromId_toId_key" ON "follow_requests"("fromId", "toId");

-- CreateIndex
CREATE UNIQUE INDEX "contents_shareTokenId_key" ON "contents"("shareTokenId");

-- CreateIndex
CREATE INDEX "contents_ownerId_idx" ON "contents"("ownerId");

-- CreateIndex
CREATE INDEX "contents_category_visibility_idx" ON "contents"("category", "visibility");

-- CreateIndex
CREATE INDEX "contents_status_ownerId_idx" ON "contents"("status", "ownerId");

-- CreateIndex
CREATE INDEX "contents_is_favorite_ownerId_idx" ON "contents"("is_favorite", "ownerId");

-- CreateIndex
CREATE INDEX "contents_created_at_idx" ON "contents"("created_at");

-- CreateIndex
CREATE INDEX "contents_rating_idx" ON "contents"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "share_tokens_token_key" ON "share_tokens"("token");

-- CreateIndex
CREATE INDEX "share_tokens_token_idx" ON "share_tokens"("token");

-- CreateIndex
CREATE INDEX "share_tokens_entity_type_entityId_idx" ON "share_tokens"("entity_type", "entityId");

-- CreateIndex
CREATE INDEX "share_tokens_expires_at_idx" ON "share_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "albums_shareTokenId_key" ON "albums"("shareTokenId");

-- CreateIndex
CREATE INDEX "albums_ownerId_idx" ON "albums"("ownerId");

-- CreateIndex
CREATE INDEX "albums_visibility_idx" ON "albums"("visibility");

-- CreateIndex
CREATE INDEX "albums_created_at_idx" ON "albums"("created_at");

-- CreateIndex
CREATE INDEX "albums_is_favorite_ownerId_idx" ON "albums"("is_favorite", "ownerId");

-- CreateIndex
CREATE INDEX "album_on_content_contentId_idx" ON "album_on_content"("contentId");

-- CreateIndex
CREATE INDEX "album_on_content_order_index_idx" ON "album_on_content"("order_index");

-- CreateIndex
CREATE UNIQUE INDEX "album_on_content_albumId_contentId_key" ON "album_on_content"("albumId", "contentId");

-- CreateIndex
CREATE INDEX "album_collaborators_userId_idx" ON "album_collaborators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "album_collaborators_albumId_userId_key" ON "album_collaborators"("albumId", "userId");

-- CreateIndex
CREATE INDEX "album_favorites_userId_idx" ON "album_favorites"("userId");

-- CreateIndex
CREATE INDEX "album_favorites_created_at_idx" ON "album_favorites"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "album_favorites_albumId_userId_key" ON "album_favorites"("albumId", "userId");

-- CreateIndex
CREATE INDEX "comments_contentId_idx" ON "comments"("contentId");

-- CreateIndex
CREATE INDEX "comments_albumId_idx" ON "comments"("albumId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "comments_created_at_idx" ON "comments"("created_at");

-- CreateIndex
CREATE INDEX "comments_is_pinned_created_at_idx" ON "comments"("is_pinned", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "annotations_shareTokenId_key" ON "annotations"("shareTokenId");

-- CreateIndex
CREATE INDEX "annotations_contentId_idx" ON "annotations"("contentId");

-- CreateIndex
CREATE INDEX "annotations_userId_idx" ON "annotations"("userId");

-- CreateIndex
CREATE INDEX "annotations_is_public_contentId_idx" ON "annotations"("is_public", "contentId");

-- CreateIndex
CREATE INDEX "annotations_is_pinned_created_at_idx" ON "annotations"("is_pinned", "created_at");

-- CreateIndex
CREATE INDEX "reactions_entity_type_entityId_idx" ON "reactions"("entity_type", "entityId");

-- CreateIndex
CREATE INDEX "reactions_userId_idx" ON "reactions"("userId");

-- CreateIndex
CREATE INDEX "reactions_created_at_idx" ON "reactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reactions_userId_entity_type_entityId_emoji_key" ON "reactions"("userId", "entity_type", "entityId", "emoji");

-- CreateIndex
CREATE INDEX "notifications_userId_created_at_idx" ON "notifications"("userId", "created_at");

-- CreateIndex
CREATE INDEX "notifications_userId_is_read_idx" ON "notifications"("userId", "is_read");

-- CreateIndex
CREATE INDEX "notifications_entity_type_entityId_idx" ON "notifications"("entity_type", "entityId");

-- CreateIndex
CREATE INDEX "notifications_expires_at_idx" ON "notifications"("expires_at");

-- CreateIndex
CREATE INDEX "activities_userId_created_at_idx" ON "activities"("userId", "created_at");

-- CreateIndex
CREATE INDEX "activities_type_created_at_idx" ON "activities"("type", "created_at");

-- CreateIndex
CREATE INDEX "activities_entity_type_entityId_idx" ON "activities"("entity_type", "entityId");

-- CreateIndex
CREATE INDEX "seed_contents_category_idx" ON "seed_contents"("category");

-- CreateIndex
CREATE INDEX "seed_contents_title_idx" ON "seed_contents"("title");

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_token_idx" ON "invites"("token");

-- CreateIndex
CREATE INDEX "invites_status_idx" ON "invites"("status");

-- CreateIndex
CREATE INDEX "invites_toEmail_idx" ON "invites"("toEmail");

-- CreateIndex
CREATE INDEX "invites_expires_at_idx" ON "invites"("expires_at");

-- CreateIndex
CREATE INDEX "favorites_contentId_idx" ON "favorites"("contentId");

-- CreateIndex
CREATE INDEX "favorites_userId_created_at_idx" ON "favorites"("userId", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_contentId_key" ON "favorites"("userId", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "demo_quotas_userId_key" ON "demo_quotas"("userId");

-- CreateIndex
CREATE INDEX "demo_quotas_date_idx" ON "demo_quotas"("date");

-- CreateIndex
CREATE INDEX "media_uploadedById_idx" ON "media"("uploadedById");

-- CreateIndex
CREATE INDEX "media_created_at_idx" ON "media"("created_at");

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_requests" ADD CONSTRAINT "follow_requests_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_requests" ADD CONSTRAINT "follow_requests_toId_fkey" FOREIGN KEY ("toId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_shareTokenId_fkey" FOREIGN KEY ("shareTokenId") REFERENCES "share_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contents" ADD CONSTRAINT "contents_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "contents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_tokens" ADD CONSTRAINT "share_tokens_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_shareTokenId_fkey" FOREIGN KEY ("shareTokenId") REFERENCES "share_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_on_content" ADD CONSTRAINT "album_on_content_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_on_content" ADD CONSTRAINT "album_on_content_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_collaborators" ADD CONSTRAINT "album_collaborators_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_collaborators" ADD CONSTRAINT "album_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_favorites" ADD CONSTRAINT "album_favorites_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "album_favorites" ADD CONSTRAINT "album_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_shareTokenId_fkey" FOREIGN KEY ("shareTokenId") REFERENCES "share_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_annotationId_fkey" FOREIGN KEY ("annotationId") REFERENCES "annotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "contents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_quotas" ADD CONSTRAINT "demo_quotas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
