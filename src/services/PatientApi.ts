import type {
  Session,
  Profile,
  Appointment,
  RecordSummary,
  RecordDetails,
} from "./types";
export interface PatientApi {
  login(email: string, password: string): Promise<Session>;
  changePassword(current: string, next: string): Promise<void>;
  getProfile(): Promise<Profile>;
  updateProfile(input: Pick<Profile, "email" | "phone">): Promise<Profile>;
  uploadPhoto(file: File): Promise<Profile>;
  listAppointments(): Promise<Appointment[]>;
  confirmAppointment(id: string): Promise<Appointment>;
  cancelAppointment(id: string): Promise<Appointment>;
  listRecords(): Promise<RecordSummary[]>;
  getRecord(id: string): Promise<RecordDetails>;
  setToken(token: string | null): void;
}
