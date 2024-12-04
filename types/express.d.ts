import { Document, Types } from "mongoose";
import { Request } from "express-serve-static-core";
import { S3Client } from "@aws-sdk/client-s3";

interface SocialMediaEntry {
  platform?: string | null;
  url?: string | null;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  about: string;
  role: "admin" | "user";
  socialMedia: SocialMediaEntry[];
  preferredContact: string;
  skills: string[];
  languages: string[];
  badges: string[];
  availability?: {
    status: "Available" | "Partially Available" | "Unavailable";
    hoursPerDay: number;
    daysPerWeek: number;
  } | null;
  passions: string[];
}

export interface UserDocument extends Omit<IUser, 'socialMedia'>, Document {
  _id: Types.ObjectId;
  socialMedia: Types.DocumentArray<SocialMediaEntry>;
  createdAt: Date;
  updatedAt: Date;
}
  declare global {
    namespace Express {
      interface Request {
        authenticatedUser?: UserDocument;
      }
    }
  }

export interface MulterS3File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    bucket: string;
    key: string;
    acl: string;
    contentType: string;
    contentDisposition: string;
    storageClass: string;
    serverSideEncryption: string;
    metadata: any;
    location: string;
    etag: string;
}

export interface FileRequest extends Request {
    files?: {
        [fieldname: string]: MulterS3File[];
    };
    file?: MulterS3File;
}
