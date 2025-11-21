import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsletterAdminComponent } from './newsletter-admin.component';


const routes: Routes = [
  {
    path: '', component: NewsletterAdminComponent, children: [
      // { path: 'add', component: AddTourComponent },
      // { path: 'edit', component: EditTourComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class newsletterRoutingModule { }
