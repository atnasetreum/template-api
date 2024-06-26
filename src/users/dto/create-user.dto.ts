import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @IsStrongPassword(
    {
      minLowercase: 2,
      minUppercase: 2,
      minNumbers: 2,
      minSymbols: 2,
    },
    {
      message:
        'password is not strong enough, must contain at least 2 lowercase, 2 uppercase, 2 numbers and 2 symbols',
    },
  )
  password: string;
}
