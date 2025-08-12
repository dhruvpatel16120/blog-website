"use client";

import AdminLayout from '@/components/admin/AdminLayout';
import PostEditor from '@/components/admin/PostEditor';

export default function NewPostPage() {
  return (
    <AdminLayout title="Create New Post" adminSession={adminSession}>
      <PostEditor mode="create" />
    </AdminLayout>
  );
}


