import { Injectable } from '@nestjs/common';
import { AiService } from 'core/ai/ai.service';
import { WorkspaceAccessService } from 'modules/workspace/workspace-access.service';
import { ModuleService } from 'modules/metadata/module/module.service';
import { FieldService } from 'modules/metadata/field/field.service';

import { GenerateFormDto } from './dto/generate-form.dto';
import { CreateFormFromDraftDto } from './dto/create-form-from-draft.dto';

const FORM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    fields: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          type: {
            type: 'STRING',
            enum: [
              'TEXT',
              'TEXTAREA',
              'NUMBER',
              'BOOLEAN',
              'DATE',
              'DATETIME',
              'EMAIL',
              'PHONE',
              'URL',
              'SELECT',
              'MULTI_SELECT',
            ],
          },
          required: { type: 'BOOLEAN' },
          options: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['name', 'type'],
      },
    },
  },
  required: ['name', 'fields'],
};

interface FormDraft {
  name: string;
  fields: {
    name: string;
    type: string;
    required?: boolean;
    options?: string[];
  }[];
}

@Injectable()
export class AiFormService {
  constructor(
    private readonly ai: AiService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly moduleService: ModuleService,
    private readonly fieldService: FieldService,
  ) {}

  async generateDraft(
    workspaceId: string,
    userId: string,
    dto: GenerateFormDto,
  ): Promise<FormDraft> {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    const prompt = `Ти — асистент, що проєктує структуру CRM-модуля.
Користувач описав, що йому треба: "${dto.prompt}".
Згенеруй назву модуля (українською) і список полів з типами.
Доступні типи полів: TEXT, TEXTAREA, NUMBER, BOOLEAN, DATE, DATETIME, EMAIL, PHONE, URL, SELECT, MULTI_SELECT.
Для SELECT і MULTI_SELECT обовʼязково додай масив "options" з варіантами.
Назви полів пиши українською, коротко і зрозуміло.`;

    return this.ai.generateJson<FormDraft>(prompt, FORM_SCHEMA);
  }

  async createFromDraft(
    workspaceId: string,
    userId: string,
    dto: CreateFormFromDraftDto,
  ) {
    await this.workspaceAccess.ensureMembership(workspaceId, userId);

    const module = await this.moduleService.create(workspaceId, userId, {
      name: dto.name,
    });

    const createdFields = await Promise.all(
      dto.fields.map((field) =>
        this.fieldService.create(module.id, userId, {
          name: field.name,
          type: field.type,
          required: field.required,
          options: field.options,
        }),
      ),
    );

    return {
      module,
      fields: createdFields,
    };
  }
}