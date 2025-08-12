"use client";

import { useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import PostEditor from '@/components/admin/PostEditor';

export default function EditPostPage() {
  const params = useParams();
  return (
    <AdminLayout adminSession={adminSession}>
      <PostEditor mode="edit" postId={params.id} />
    </AdminLayout>
  );
}


