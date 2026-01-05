# Supabase Storage Setup Guide

## 📦 Required Storage Buckets

Your app needs two storage buckets in Supabase for image uploads. Follow these steps:

### 1. Create Storage Buckets

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New Bucket**

#### Bucket 1: tussle-images
- **Name:** `tussle-images`
- **Public:** ✅ Yes (check "Public bucket")
- **File size limit:** 5MB
- **Allowed MIME types:** image/*

#### Bucket 2: receipts
- **Name:** `receipts`
- **Public:** ✅ Yes (check "Public bucket")
- **File size limit:** 5MB
- **Allowed MIME types:** image/*

### 2. Set Bucket Policies

For each bucket, go to **Policies** tab and add these policies:

#### Allow INSERT for authenticated users:
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tussle-images');

CREATE POLICY "Allow authenticated uploads receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');
```

#### Allow SELECT for everyone (public reads):
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tussle-images');

CREATE POLICY "Allow public reads receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
```

#### Allow DELETE for authenticated users:
```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'tussle-images');

CREATE POLICY "Allow authenticated deletes receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');
```

### 3. Verify Setup

Test the storage:
1. Try creating a new tussle with an image
2. Try uploading a receipt in the expenses section
3. Check that images display correctly in cards

### 4. Troubleshooting

**Images not uploading?**
- Check bucket names are exact: `tussle-images` and `receipts`
- Ensure buckets are set to **Public**
- Verify policies are created correctly

**Images not displaying?**
- Check browser console for errors
- Verify the bucket is public
- Check the public URL format in Storage settings

**File size errors?**
- Images must be under 5MB
- Try compressing images before upload

### 5. Alternative: Quick Setup via SQL

Run this in SQL Editor to create policies automatically:

```sql
-- Tussle Images Policies
CREATE POLICY "Allow authenticated uploads tussle-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'tussle-images');

CREATE POLICY "Allow public reads tussle-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'tussle-images');

CREATE POLICY "Allow authenticated deletes tussle-images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'tussle-images');

-- Receipts Policies
CREATE POLICY "Allow authenticated uploads receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow public reads receipts"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated deletes receipts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'receipts');
```

## ✅ Checklist

- [ ] Created `tussle-images` bucket (public)
- [ ] Created `receipts` bucket (public)
- [ ] Added INSERT policies for authenticated users
- [ ] Added SELECT policies for public access
- [ ] Added DELETE policies for authenticated users
- [ ] Tested image upload in tussle creation
- [ ] Tested receipt upload in expenses
- [ ] Verified images display correctly

---

**Note:** Make sure to complete this setup BEFORE deploying or testing the app, otherwise image uploads will fail silently.
