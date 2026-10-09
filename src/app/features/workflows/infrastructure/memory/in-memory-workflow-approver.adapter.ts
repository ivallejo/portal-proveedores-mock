import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkflowApproverDirectoryPort } from '../../application/ports/out/workflow-approver-directory.port';

/** Personal interno de ejemplo (los usuarios no proveedores del antiguo modo demo), mientras no exista la API. */
const PEOPLE = [
  'Administrador del sistema',
  'María Torres',
  'Colaborador interno',
  'Cuentas por pagar',
  'Ana López',
  'Bruno Castro',
  'Carla Mendoza',
  'Diego Ramos',
  'Elena Salas',
  'Fabián Vargas',
  'Gabriela Ruiz',
  'Héctor Navarro',
  'Inés Paredes',
  'Jorge Silva',
  'Karina Ríos',
  'Lucas Fuentes',
  'Mariana Vega',
  'Nicolás Peña',
  'Olga Cárdenas',
  'Pablo Reyes',
  'Quena Martínez',
  'Roberto León',
  'Sofía Aguilar',
  'Tomás Miranda',
  'Úrsula Vera',
  'Víctor Ortiz',
  'Wendy Palomino',
  'Xavier Espinoza',
  'Yolanda Quinteros',
];

@Injectable()
export class InMemoryWorkflowApproverAdapter implements WorkflowApproverDirectoryPort {
  list(): Observable<string[]> {
    return of([...PEOPLE]);
  }
}
