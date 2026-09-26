import { Injectable, signal } from '@angular/core';

export interface ClassItem {
  day: string;
  date: string;
  course: string;
  section: string;
  room: string;
  time: string;
  mode: string;
}
export interface AttendanceItem {
  date: string;
  course: string;
  start: string;
  end: string;
  status: string;
}
export interface GradeItem {
  course: string;
  section: string;
  students: number;
  average: number;
  progress: number;
}
export interface RequestItem {
  type: string;
  detail: string;
  date: string;
  status: 'Pendiente' | 'Atendida';
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  readonly classes = signal<ClassItem[]>([
    {
      day: 'Lun',
      date: '16 Jun',
      course: 'Comunicación empresarial',
      section: 'A-301',
      room: 'Aula 204',
      time: '08:00 - 10:00',
      mode: 'Presencial',
    },
    {
      day: 'Mar',
      date: '17 Jun',
      course: 'Marketing digital',
      section: 'B-202',
      room: 'Lab. 3',
      time: '10:00 - 12:00',
      mode: 'Presencial',
    },
    {
      day: 'Mié',
      date: '18 Jun',
      course: 'Gestión de negocios',
      section: 'A-105',
      room: 'Virtual',
      time: '18:30 - 20:30',
      mode: 'Virtual',
    },
    {
      day: 'Jue',
      date: '19 Jun',
      course: 'Comunicación empresarial',
      section: 'A-301',
      room: 'Aula 204',
      time: '08:00 - 10:00',
      mode: 'Presencial',
    },
    {
      day: 'Vie',
      date: '20 Jun',
      course: 'Marketing digital',
      section: 'B-202',
      room: 'Lab. 3',
      time: '10:00 - 12:00',
      mode: 'Presencial',
    },
  ]);
  readonly attendance = signal<AttendanceItem[]>([
    {
      date: '16 Jun 2025',
      course: 'Comunicación empresarial',
      start: '07:56',
      end: '10:03',
      status: 'Registrada',
    },
    {
      date: '13 Jun 2025',
      course: 'Marketing digital',
      start: '09:55',
      end: '12:01',
      status: 'Registrada',
    },
    {
      date: '12 Jun 2025',
      course: 'Gestión de negocios',
      start: '18:25',
      end: '20:31',
      status: 'Registrada',
    },
  ]);
  readonly grades = signal<GradeItem[]>([
    {
      course: 'Comunicación empresarial',
      section: 'A-301',
      students: 28,
      average: 16.2,
      progress: 85,
    },
    { course: 'Marketing digital', section: 'B-202', students: 24, average: 15.8, progress: 72 },
    { course: 'Gestión de negocios', section: 'A-105', students: 31, average: 14.9, progress: 64 },
  ]);
  readonly requests = signal<RequestItem[]>([
    {
      type: 'Justificación de asistencia',
      detail: '16 Jun · Comunicación empresarial',
      date: '12 Jun 2025',
      status: 'Pendiente',
    },
    {
      type: 'Ampliación de notas',
      detail: 'Marketing digital · Parcial 2',
      date: '05 Jun 2025',
      status: 'Atendida',
    },
  ]);
  addRequest(): void {
    this.requests.update((items) => [
      {
        type: 'Justificación de asistencia',
        detail: 'Solicitud de demostración',
        date: 'Hoy',
        status: 'Pendiente',
      },
      ...items,
    ]);
  }
}
