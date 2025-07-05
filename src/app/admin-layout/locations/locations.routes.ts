import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddLocationComponent } from './add-location/add-location.component';
import { EditLocationComponent } from './edit-location/edit-location.component';
import { LocationsComponent } from './locations.component';

const routes: Routes = [
  {
    path: '', component: LocationsComponent, children: [
      { path: 'add', component: AddLocationComponent },
      { path: 'edit', component: EditLocationComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationsRoutingModule { }
