import { Injectable } from '@nestjs/common';

import * as argon2 from 'argon2';
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

import { Environment, envs } from '@config';

@Injectable()
export class SharedService {
  private readonly key = CryptoJS.enc.Utf8.parse(envs.CRYPTOJS_KEY);
  private readonly iv = CryptoJS.enc.Utf8.parse(envs.CRYPTOJS_IV);

  private readonly jwtSecret = envs.JWT_SECRET;
  private readonly jwtExpiresIn = envs.JWT_EXPIRES_IN;

  private readonly environment = envs.NODE_ENV;

  private readonly optsSerialize = {
    httpOnly: true,
    secure: this.environment === Environment.Production,
    sameSite: this.environment === Environment.Production ? 'none' : 'strict',
    path: '/',
    domain: 'localhost',
  };

  encryptPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  excludeFromObject<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !keys.includes(key as K)),
    ) as Omit<T, K>;
  }

  excludeFromList<T, K extends keyof T>(
    objects: T[],
    keysToDelete: K[],
  ): Omit<T, K>[] {
    return objects.map((obj) =>
      this.excludeFromObject(obj, keysToDelete),
    ) as Omit<T, K>[];
  }

  encryptCrypto(plaintext: string): string {
    const encrypted = CryptoJS.AES.encrypt(plaintext, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();

    return encrypted;
  }

  decryptCrypto(encrypted: string): string {
    const decrypted = CryptoJS.AES.decrypt(encrypted, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);

    return decrypted;
  }

  createJwt(id: string): string {
    const token = jwt.sign({ id }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
    return token;
  }

  verifyJwt(token: string): { id: string } {
    const decoded = jwt.verify(token, this.jwtSecret) as { id: string };
    return { id: decoded.id };
  }

  createCookie(value: string): string {
    return serialize('access_token', value, {
      ...this.optsSerialize,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }
}
