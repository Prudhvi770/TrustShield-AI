-- TrustSphere schema for MySQL 8.0+ / MariaDB 10.5+.
--
-- This is the MySQL equivalent of the old Supabase/Postgres migration.
-- A few things changed on the way over:
--   * uuid -> varchar(36), populated by the app with crypto.randomUUID()
--   * jsonb -> json
--   * timestamptz -> timestamp/datetime
--   * Postgres Row Level Security + policies -> dropped entirely. MySQL
--     has no equivalent, so every query filters by session_id in the
--     application layer instead (see src/routes/api/**).
--
-- You can run this file directly, or generate the same thing with
-- `bun run db:push` once DATABASE_URL is set.

CREATE TABLE `analyses` (
  `id` varchar(36) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `input_type` varchar(64) NOT NULL,
  `input_text` text NOT NULL,
  `input_url` text,
  `overall_risk` varchar(32) NOT NULL DEFAULT 'UNVERIFIABLE',
  `verdict` varchar(32) NOT NULL DEFAULT 'UNVERIFIABLE',
  `confidence` int NOT NULL DEFAULT 0,
  `summary` text,
  `preprocessing` json NOT NULL,
  `nlp_results` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `analyses_session_idx` (`session_id`)
);

CREATE TABLE `claims` (
  `id` varchar(36) NOT NULL,
  `analysis_id` varchar(36) NOT NULL,
  `claim_text` text NOT NULL,
  `claim_type` varchar(64) NOT NULL DEFAULT 'VERIFIABLE CLAIM',
  `entities` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `claims_analysis_idx` (`analysis_id`),
  CONSTRAINT `claims_analysis_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE CASCADE
);

CREATE TABLE `risk_scores` (
  `id` varchar(36) NOT NULL,
  `analysis_id` varchar(36) NOT NULL,
  `fake_news_score` int NOT NULL DEFAULT 0,
  `financial_scam_score` int NOT NULL DEFAULT 0,
  `spam_score` int NOT NULL DEFAULT 0,
  `phishing_score` int NOT NULL DEFAULT 0,
  `url_risk` varchar(16) NOT NULL DEFAULT 'LOW',
  `overall_risk` varchar(16) NOT NULL DEFAULT 'LOW',
  `contributing_features` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `risk_scores_analysis_idx` (`analysis_id`),
  CONSTRAINT `risk_scores_analysis_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE CASCADE
);

CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `title` varchar(500) NOT NULL,
  `organization` varchar(255),
  `document_date` datetime,
  `source_url` text,
  `document_type` varchar(64) NOT NULL DEFAULT 'trusted_document',
  `file_name` varchar(500),
  `chunk_count` int NOT NULL DEFAULT 0,
  `embedding_status` varchar(32) NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `documents_session_idx` (`session_id`)
);

CREATE TABLE `document_chunks` (
  `id` varchar(36) NOT NULL,
  `document_id` varchar(36) NOT NULL,
  `chunk_index` int NOT NULL,
  `page_number` int,
  `text_chunk` text NOT NULL,
  `embedding` json,
  `metadata` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `document_chunks_document_idx` (`document_id`),
  CONSTRAINT `document_chunks_document_id_fk` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE
);

CREATE TABLE `evidence` (
  `id` varchar(36) NOT NULL,
  `analysis_id` varchar(36) NOT NULL,
  `claim_id` varchar(36),
  `document_id` varchar(36),
  `title` varchar(500) NOT NULL,
  `organization` varchar(255),
  `source_url` text,
  `page_number` int,
  `text_chunk` text NOT NULL,
  `similarity_score` decimal(5,4),
  `bm25_score` decimal(5,4),
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evidence_analysis_idx` (`analysis_id`),
  CONSTRAINT `evidence_analysis_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evidence_claim_id_fk` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE SET NULL
);

CREATE TABLE `model_results` (
  `id` varchar(36) NOT NULL,
  `analysis_id` varchar(36) NOT NULL,
  `model_name` varchar(128) NOT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'unavailable',
  `result` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `model_results_analysis_idx` (`analysis_id`),
  CONSTRAINT `model_results_analysis_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE CASCADE
);
