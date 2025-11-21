import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaqComponent } from './faq.component';
import { AddFaqComponent } from './add-faq/add-faq.component';
import { EditFaqComponent } from './edit-faq/edit-faq.component';


const routes: Routes = [
  {
    path: '', component: FaqComponent, children: [
      { path: 'add', component: AddFaqComponent },
      { path: 'edit', component: EditFaqComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class faqRoutingModule { }
