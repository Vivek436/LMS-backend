import { SetMetadata } from '@nestjs/common';

export const CHECK_OWNERSHIP_KEY = 'resourceType';
export const CheckOwnership = (resourceType: 'course' | 'section' | 'lesson' | 'enrollment') =>
    SetMetadata(CHECK_OWNERSHIP_KEY, resourceType);
