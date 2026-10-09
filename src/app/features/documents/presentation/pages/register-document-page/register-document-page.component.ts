import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PageLoadingService } from '../../../../../core/layout/page-loading.service';
import { PageHeaderComponent } from '../../../../../shared/ui/page-header/page-header.component';
import { RegisterEntryPickerComponent } from '../../components/register-entry-picker/register-entry-picker.component';
import { RegisterFilesComponent } from '../../components/register-files/register-files.component';
import { RegisterFooterComponent } from '../../components/register-footer/register-footer.component';
import { RegisterOrderDataComponent } from '../../components/register-order-data/register-order-data.component';
import { RegisterResultComponent } from '../../components/register-result/register-result.component';
import { RegisterReviewComponent } from '../../components/register-review/register-review.component';
import { RegisterStepperComponent } from '../../components/register-stepper/register-stepper.component';
import { SpecialDocumentDataComponent } from '../../components/special-document-data/special-document-data.component';
import { SpecialDocumentFilesComponent } from '../../components/special-document-files/special-document-files.component';
import { RegisterDocumentFacade } from '../../facades/register-document.facade';

/** Registrar documentos: con orden de compra, sin orden de compra o documento especial. */
@Component({
  selector: 'app-register-document-page',
  imports: [
    PageHeaderComponent,
    RegisterEntryPickerComponent,
    RegisterStepperComponent,
    RegisterResultComponent,
    RegisterReviewComponent,
    SpecialDocumentDataComponent,
    SpecialDocumentFilesComponent,
    RegisterOrderDataComponent,
    RegisterFilesComponent,
    RegisterFooterComponent,
  ],
  providers: [RegisterDocumentFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-document-page.component.html',
})
export class RegisterDocumentPageComponent {
  readonly facade = inject(RegisterDocumentFacade);

  constructor() {
    inject(PageLoadingService).bind(
      computed(() => !!this.facade.progressLabel()),
      this.facade.progressLabel,
    );
    this.facade.start();
  }
}
