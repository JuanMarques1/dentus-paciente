export type Session = { token: string; mustChangePassword: boolean };
export type Profile = { name: string; email: string; phone: string; photoUrl?: string };
export type Appointment = { id: string; procedure: string; dentist: string; startsAt: string; clinicTimeZone: string; status: 'pending'|'confirmed'|'cancelled'|'completed'; canConfirm: boolean; canCancel: boolean };
export type RecordSummary = { id: string; date: string; title: string; dentist: string; summary: string };
export type RecordDetails = RecordSummary & { instructions: string; treatmentPlan: string };
