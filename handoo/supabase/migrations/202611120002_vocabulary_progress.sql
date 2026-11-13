-- Apply after 202611120001_learning_progress.sql.
-- Existing grammar progress is preserved; vocabulary uses stable V<book>-<lesson>-<entry> IDs.
alter table public.learning_progress
  drop constraint learning_progress_grammar_id_check;
alter table public.learning_progress
  add constraint learning_progress_grammar_id_check
  check (grammar_id ~ '^(E[0-9]+|V[1-6]-[0-9]+-[0-9]+)$');
