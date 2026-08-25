import {
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'core/database/prisma.service'

import { CreateWorkspaceDto } from './dto/create-workspace.dto'
import { UpdateWorkspaceDto } from './dto/update-workspace'

@Injectable()
export class WorkspaceService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        userId: string,
        dto: CreateWorkspaceDto,
    ) {
        const slug = await this.generateUniqueSlug(
            dto.name ?? 'workspace',
        )

        return this.prisma.$transaction(async tx => {
            const workspace = await tx.workspace.create({
                data: {
                    name: dto.name,
                    slug,
                    description: dto.description,
                    logo: dto.logo,
                    ownerId: userId,
                },
            })

            const ownerRole = await tx.role.create({
                data: {
                    workspaceId: workspace.id,
                    name: 'Owner',
                    description:
                        'Full access to workspace',
                    permissions: {
                        all: true,
                    },
                },
            })

            await tx.workspaceMember.create({
                data: {
                    workspaceId: workspace.id,
                    userId,
                    roleId: ownerRole.id,
                },
            })

            return tx.workspace.findUniqueOrThrow({
                where: {
                    id: workspace.id,
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                            role: true,
                        },
                    },
                    roles: true,
                },
            })
        })
    }

    async findAll(userId: string) {
        return this.prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                        role: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    async findOne(
        workspaceId: string,
        userId: string,
    ) {
        const workspace =
            await this.prisma.workspace.findFirst({
                where: {
                    id: workspaceId,
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                            role: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,
                                    permissions: true,
                                },
                            },
                        },
                    },
                    roles: true,
                },
            })

        if (!workspace) {
            throw new NotFoundException(
                'Workspace not found',
            )
        }

        return workspace
    }

    async update(
        workspaceId: string,
        userId: string,
        dto: UpdateWorkspaceDto,
    ) {
        await this.ensureOwner(
            workspaceId,
            userId,
        )

        return this.prisma.workspace.update({
            where: {
                id: workspaceId,
            },
            data: {
                name: dto.name,
                description: dto.description,
                logo: dto.logo,
            },
        })
    }

    async remove(
        workspaceId: string,
        userId: string,
    ) {
        await this.ensureOwner(
            workspaceId,
            userId,
        )

        await this.prisma.workspace.delete({
            where: {
                id: workspaceId,
            },
        })

        return {
            message:
                'Workspace deleted successfully',
        }
    }

    private async ensureOwner(
        workspaceId: string,
        userId: string,
    ) {
        const workspace =
            await this.prisma.workspace.findFirst({
                where: {
                    id: workspaceId,
                    ownerId: userId,
                },
                select: {
                    id: true,
                },
            })

        if (!workspace) {
            throw new NotFoundException(
                'Workspace not found or access denied',
            )
        }

        return workspace
    }

    private async generateUniqueSlug(
        name: string,
    ): Promise<string> {
        const baseSlug = this.slugify(name)

        let slug = baseSlug
        let counter = 1

        while (true) {
            const existing =
                await this.prisma.workspace.findUnique({
                    where: {
                        slug,
                    },
                    select: {
                        id: true,
                    },
                })

            if (!existing) {
                return slug
            }

            counter += 1
            slug = `${baseSlug}-${counter}`
        }
    }

    private slugify(value: string): string {
        const transliteration: Record<string, string> = {
            а: 'a',
            б: 'b',
            в: 'v',
            г: 'h',
            ґ: 'g',
            д: 'd',
            е: 'e',
            є: 'ye',
            ж: 'zh',
            з: 'z',
            и: 'y',
            і: 'i',
            ї: 'yi',
            й: 'y',
            к: 'k',
            л: 'l',
            м: 'm',
            н: 'n',
            о: 'o',
            п: 'p',
            р: 'r',
            с: 's',
            т: 't',
            у: 'u',
            ф: 'f',
            х: 'kh',
            ц: 'ts',
            ч: 'ch',
            ш: 'sh',
            щ: 'shch',
            ю: 'yu',
            я: 'ya',
            ь: '',
            "'": '',
            '’': '',
            'ъ': '',
            ы: 'y',
            э: 'e',
            ё: 'yo',
        }

        const normalized = value
            .toLowerCase()
            .split('')
            .map(character =>
                transliteration[character] ??
                character,
            )
            .join('')

        const slug = normalized
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-')

        return slug || 'workspace'
    }
}