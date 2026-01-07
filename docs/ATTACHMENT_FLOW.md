# Corporate Announcements Attachment Flow

## Overview
Attachments are stored in the database using the **announcement ID** as the key. There is no separate attachment ID - the attachment is linked to the announcement via the announcement's `id` field.

## Database Schema

The `corporate_announcements` table stores attachments in the same row as the announcement:

```sql
CREATE TABLE corporate_announcements (
    id VARCHAR PRIMARY KEY,                    -- Announcement ID (used as attachment key)
    ...
    attachment_data BLOB,                      -- Binary attachment file data
    attachment_content_type VARCHAR,           -- MIME type (e.g., 'application/pdf')
    ...
)
```

**Key Points:**
- **Attachment ID = Announcement ID** (same value)
- Attachment data is stored as BLOB in `attachment_data` column
- Content type (MIME type) is stored in `attachment_content_type` column
- Both are stored in the same row as the announcement

## Attachment Flow

### 1. User Clicks View/Download Button
- Frontend calls: `GET /api/v1/announcements/{announcement_id}/attachment`
- Uses the announcement's `id` as the attachment identifier

### 2. Backend Processing (DB-First Strategy)

```
┌─────────────────────────────────────────────────────────────┐
│  GET /api/v1/announcements/{announcement_id}/attachment     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Check Database First         │
        │  SELECT attachment_data,       │
        │       attachment_content_type  │
        │  FROM corporate_announcements  │
        │  WHERE id = ?                  │
        │    AND attachment_data IS NOT NULL│
        └───────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
         Found?                  Not Found?
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌──────────────────┐
    │ Return from   │      │ Fetch from       │
    │ Database      │      │ TrueData API     │
    │ (Fast)        │      │ /announcementfile│
    └───────────────┘      └──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Store in Database│
                          │ UPDATE SET       │
                          │   attachment_data = ?,│
                          │   attachment_content_type = ?│
                          │ WHERE id = ?     │
                          └──────────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ Return File      │
                          └──────────────────┘
```

### 3. Code Flow

**Step 1: Check Database**
```python
# backend/app/api/v1/announcements.py
attachment = service.get_attachment(announcement_id)

if attachment:
    # Found in DB - return immediately (fast!)
    return StreamingResponse(io.BytesIO(attachment['data']), ...)
```

**Step 2: Fetch from TrueData (if not in DB)**
```python
# Fetch from TrueData API
response = api_service.get_announcement_attachment(announcement_id)
attachment_data = response.content
content_type = response.headers.get('Content-Type', 'application/pdf')
```

**Step 3: Store in Database**
```python
# Store for future use
service.store_attachment(announcement_id, attachment_data, content_type)
# This updates the row WHERE id = announcement_id
```

**Step 4: Return File**
```python
return StreamingResponse(io.BytesIO(attachment_data), ...)
```

## Storage Location

- **Database**: DuckDB file at `data/Company Fundamentals/corporate_announcements.duckdb`
- **Table**: `corporate_announcements`
- **Key Column**: `id` (VARCHAR) - the announcement ID
- **Attachment Columns**:
  - `attachment_data` (BLOB) - binary file data
  - `attachment_content_type` (VARCHAR) - MIME type

## Benefits of This Approach

1. **Fast Subsequent Access**: Once downloaded, attachments are served from the database (no API call needed)
2. **Reduced API Calls**: Only fetches from TrueData once per attachment
3. **Offline Access**: Cached attachments available even if TrueData API is down
4. **Simple Key**: Uses existing announcement ID, no separate attachment ID needed

## Example

```python
# Announcement ID: "12345"
# Attachment is stored in the same row:
{
    "id": "12345",
    "news_headline": "Quarterly Results",
    "attachment_data": <binary PDF data>,
    "attachment_content_type": "application/pdf",
    ...
}

# To retrieve attachment:
# SELECT attachment_data, attachment_content_type 
# FROM corporate_announcements 
# WHERE id = '12345' AND attachment_data IS NOT NULL
```

## API Endpoint

```
GET /api/v1/announcements/{announcement_id}/attachment

Response:
- 200: File stream (PDF/document)
- 404: Attachment not found (not in DB and not available from TrueData)
- 500: Server error
```

