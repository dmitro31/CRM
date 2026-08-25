import { IsEmail, IsUUID } from 'class-validator'

export class CreateInvitationDto {
  @IsEmail()
  email!: string

  @IsUUID()
  roleId!: string
}