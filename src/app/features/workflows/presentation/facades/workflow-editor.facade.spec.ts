import { TestBed } from '@angular/core/testing';
import { ToastService } from '../../../../shared/ui/toast/toast.service';
import { WORKFLOWS_PROVIDERS } from '../../di/workflows.providers';
import { InMemoryWorkflowAdapter } from '../../infrastructure/memory/in-memory-workflow.adapter';
import { WorkflowEditorFacade } from './workflow-editor.facade';
import { WorkflowListFacade } from './workflow-list.facade';

describe('WorkflowEditorFacade', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [
        ...WORKFLOWS_PROVIDERS,
        WorkflowListFacade,
        WorkflowEditorFacade,
        { provide: ToastService, useValue: { show: () => undefined } },
      ],
    });
    const list = TestBed.inject(WorkflowListFacade);
    const editor = TestBed.inject(WorkflowEditorFacade);
    list.load();
    editor.loadApprovers();
    return { list, editor };
  }

  it('crea un workflow con dos niveles y lo agrega al listado', () => {
    const { list, editor } = setup();
    expect(list.workflows().length).toBe(2);
    editor.openWorkflowForm();
    editor.workflowForm.name = '  Servicios  ';
    editor.addWorkflowLevel();
    editor.saveWorkflow();
    expect(editor.workflowError()).toBe('Cada nivel debe tener al menos un aprobador.');

    editor.setWorkflowApproverSearch(1, 'maría');
    expect(editor.filteredWorkflowApprovers(1)).toEqual(['María Torres']);
    editor.toggleWorkflowApprover(1, 'María Torres');
    editor.moveWorkflowLevel(1, -1);
    editor.saveWorkflow();
    const saved = list.workflows().at(-1)!;
    expect(saved).toEqual(jasmine.objectContaining({ id: 3, name: 'Servicios', isActive: true }));
    expect(saved.approvalLevels.map((level) => level.approvers)).toEqual([
      ['María Torres'],
      ['Área Usuaria'],
    ]);
    expect(editor.showWorkflowForm()).toBeFalse();
  });

  it('activa y desactiva, y lo guardado sigue al volver a la pantalla', () => {
    const { list } = setup();
    list.toggleWorkflow(list.workflows()[0]);
    expect(list.workflows()[0].isActive).toBeFalse();
    let stored = true;
    TestBed.inject(InMemoryWorkflowAdapter)
      .get(1)
      .subscribe((workflow) => (stored = workflow!.isActive));
    expect(stored).toBeFalse();
  });
});
