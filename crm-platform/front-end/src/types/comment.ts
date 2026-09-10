export interface Comment {
  id: string
  content: string
  recordId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author: { id: string; firstName: string; lastName: string | null; avatar: string | null }
}