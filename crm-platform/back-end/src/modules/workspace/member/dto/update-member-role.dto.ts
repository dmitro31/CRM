import { IsUUID } from 'class-validator'

export class UpdateMemberRoleDto {
  @IsUUID()
  roleId!: string
}