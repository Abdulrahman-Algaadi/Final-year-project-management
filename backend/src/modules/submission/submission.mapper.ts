import { Submission } from '@/database/entities/submission.entity';
import { Injectable } from '@nestjs/common';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@Injectable()
export class SubmissionMapper {
  toResponse(entity: Submission): SubmissionResponseDto {
    return {
      id: entity.id,
      groupId: entity.groupId,
      title: entity.title,
      filePath: entity.filePath,
      versionNo: entity.versionNo,
      submittedAt: entity.submittedAt,
      submissionType: entity.submissionType,
      status: entity.status,
    };
  }

  toResponseList(entities: Submission[]): SubmissionResponseDto[] {
    return entities.map((e) => this.toResponse(e));
  }
}
