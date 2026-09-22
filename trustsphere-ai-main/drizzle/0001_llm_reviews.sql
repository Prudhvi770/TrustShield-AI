-- Adds the llm_reviews table (MODULE 20/21): one row per model per
-- analysis (Qwen3-8B as "primary", Llama 3.1 8B as "reviewer"), so the
-- independent-review verdict, confidence, reasoning, and any issues found
-- with the primary model's reasoning are persisted alongside the rest of
-- the analysis.
CREATE TABLE `llm_reviews` (
  `id` varchar(36) NOT NULL,
  `analysis_id` varchar(36) NOT NULL,
  `model_name` varchar(128) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'reviewer',
  `verdict` varchar(32) NOT NULL DEFAULT 'UNVERIFIABLE',
  `confidence` int NOT NULL DEFAULT 0,
  `reasoning` text,
  `agreement` varchar(8),
  `issues_found` json NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `llm_reviews_analysis_idx` (`analysis_id`),
  CONSTRAINT `llm_reviews_analysis_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses` (`id`) ON DELETE CASCADE
);
