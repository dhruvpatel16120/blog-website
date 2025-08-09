"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import PostEditor from '@/components/admin/PostEditor';

export default function NewPostPage() {
  return (
    <AdminLayout>
      <PostEditor mode="create" />
    </AdminLayout>
  );
}


