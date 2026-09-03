export interface WorkspaceMember {
  id: string
  userId: string
  roleId: string
  user: { id: string; email: string; firstName: string; lastName: string | null; avatar: string | null }
  role: { id: string; name: string; permissions?: unknown }
}

export interface Role {
  id: string
  name: string
  description: string | null
  permissions: string[]
}

export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  owner?: { id: string; email: string; firstName: string; lastName: string | null; avatar: string | null }
  members?: WorkspaceMember[]
  roles?: Role[]
}