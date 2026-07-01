import type { UserProfile } from "@/types";
import type { AuthProfileDto } from "@/types/api";

export function mapAuthProfile(dto: AuthProfileDto): UserProfile {
  return {
    id: dto.userAccountId,
    personId: dto.personId,
    username: dto.username,
    email: dto.email ?? "",
    role: dto.role,
    firstName: dto.firstName,
    lastName: dto.lastName,
  };
}
