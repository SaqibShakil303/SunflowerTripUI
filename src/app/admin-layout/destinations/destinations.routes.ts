import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddDestinationComponent } from './add-destination/add-destination.component';
import { EditDestinationComponent } from './edit-destination/edit-destination.component';
import { DestinationsComponent } from './destinations.component';

const routes: Routes = [
  {
    path: '', component: DestinationsComponent, children: [
      {path: 'add', component: AddDestinationComponent}, 
      {path: 'edit', component: EditDestinationComponent}, 
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DestinationsRoutingModule { }
