import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { PortalFacade } from './core/state/portal.facade';
import { AdminUsersComponent } from './features/administration/users/pages/admin-users.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { RegistrationComponent } from './features/documents/pages/registration/registration.component';
import { DocumentsListComponent } from './features/documents/pages/list/documents-list.component';
import { WorkflowsPageComponent } from './features/workflows/pages/workflows-page.component';
import { ApprovalsPageComponent } from './features/approvals/pages/approvals-page.component';
import { AccountingPageComponent } from './features/accounting/pages/accounting-page.component';
import { PortalShellComponent } from './core/layout/portal-shell.component';
import { LoginComponent } from './features/auth/pages/login/login.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    AdminUsersComponent,
    ProfileComponent,
    DashboardComponent,
    RegistrationComponent,
    DocumentsListComponent,
    WorkflowsPageComponent,
    ApprovalsPageComponent,
    AccountingPageComponent,
    PortalShellComponent,
    LoginComponent,
  ],
  templateUrl: './app.html',
})
export class App {
  readonly auth = inject(AuthService);
  readonly portal = inject(PortalFacade);
}
