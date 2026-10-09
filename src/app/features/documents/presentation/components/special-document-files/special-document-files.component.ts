import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FileDropComponent } from '../file-drop/file-drop.component';
import { RegisterSectionTitleComponent } from '../register-section-title/register-section-title.component';
import { onlyDigits } from '../../../../../shared/utils/text-format.util';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Documento especial: RUC, fecha, número, importe y PDF. */
@Component({
  selector: 'app-special-document-files',
  imports: [FileDropComponent, RegisterSectionTitleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  templateUrl: './special-document-files.component.html',
})
export class SpecialDocumentFilesComponent {
  readonly facade = inject(RegisterDocumentFacade);

  onSpecialRuc(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = onlyDigits(input.value);
    this.facade.setSpecial('ruc', input.value);
  }

  onSpecialNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().slice(0, 20);
    this.facade.setSpecial('number', input.value);
  }

  onSpecialAmount(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d.,]/g, '').slice(0, 14);
    this.facade.setSpecial('amount', input.value);
  }
}
