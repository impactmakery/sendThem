/** Maximum rows allowed in an uploaded Excel file */
export const MAX_EXCEL_ROWS = 50_000;

/** Maximum file size for Excel upload (10 MB) */
export const MAX_EXCEL_FILE_SIZE = 10 * 1024 * 1024;

/** Accepted file extensions for upload */
export const ACCEPTED_FILE_EXTENSIONS = ['.xlsx', '.xls', '.csv'] as const;

/** Accepted MIME types for upload */
export const ACCEPTED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
  'application/csv',
] as const;

/** Meta template body character limit */
export const META_TEMPLATE_CHAR_LIMIT = 1024;

/** Minutes before scheduled send when cancel is locked */
export const SCHEDULE_LOCK_MINUTES = 5;

/** Maximum days in the future a campaign can be scheduled */
export const MAX_SCHEDULE_DAYS_AHEAD = 90;

/** Default free credits on signup */
export const SIGNUP_BONUS_CREDITS = 50;

/** Temp file retention in hours */
export const TEMP_FILE_RETENTION_HOURS = 24;
