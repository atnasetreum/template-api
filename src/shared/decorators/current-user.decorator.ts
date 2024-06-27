import { createParamDecorator } from '@nestjs/common';

import { User } from '@prisma/client';

export const CurrentUser = createParamDecorator((_, req) => {
  console.log({
    req,
  });
  return req.requestingUser as User;
});
