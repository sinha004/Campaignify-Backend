export class SegmentResponseDto {
  id: string;
  userId: number;
  name: string;
  fileName: string;
  fileSize: number;
  totalRecords: number;
  status: string;
  uploadedAt: Date;
  s3Url?: string;
  downloadUrl?: string;
}
