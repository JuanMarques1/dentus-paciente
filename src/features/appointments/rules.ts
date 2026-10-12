import type { Appointment } from '../../services/types';
export function canCancelAt(_startsAt:string,_now:number):boolean { return false; }
export function formatAppointmentDate(_appointment:Appointment):string { return ''; }
