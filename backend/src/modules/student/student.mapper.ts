import { Injectable } from '@nestjs/common';
import { Student } from '@/database/entities/student.entity';
import { Person } from '@/database/entities/person.entity';
import { StudentResponseDto } from './dto/student-response.dto';

@Injectable()
export class StudentMapper {
  toResponse(student: Student, person?: Person | null): StudentResponseDto {
    const p = person ?? student.person;
    return {
      id: student.id,
      registrationNo: student.registrationNo,
      departmentId: student.departmentId,
      semesterId: student.semesterId,
      enrollmentYear: student.enrollmentYear,
      firstName: p?.firstName,
      lastName: p?.lastName,
      email: p?.email,
      genderId: p?.genderId,
      contactNo: p?.contactNo,
    };
  }

  toResponseList(students: Student[]): StudentResponseDto[] {
    return students.map((s) => this.toResponse(s));
  }
}
