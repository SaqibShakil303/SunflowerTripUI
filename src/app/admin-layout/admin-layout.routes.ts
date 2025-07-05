import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';

import { UsersComponent } from './users/users.component';
import { EnquiriesComponent } from './enquiries/enquiries.component';
import { DestinationsComponent } from './destinations/destinations.component';
import { ItneraryAdminComponent } from './itnerary/itnerary-admin/itnerary-admin.component';
import { BookingsComponent } from './bookings/bookings.component';
// import { DestinationFormComponent } from './destination-management/destination-form/destination-form.component';

const routes: Routes = [
  //   {
  //   path: 'destination/add',
  //   component: DestinationFormComponent,
  //   data: { mode: 'add' }
  // },
  // {
  //   path: 'destination/edit/:id',
  //   component: DestinationFormComponent,
  //   data: { mode: 'edit' }
  // },
  {
    path: '', component: AdminLayoutComponent, children: [
      { path: 'users', component: UsersComponent },
      { path: 'enquiries', component: EnquiriesComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'destinations', loadChildren: () => import('./destinations/destinations.module').then(m => m.DestinationsModule) },
      { path: 'locations', loadChildren: () => import('./locations/locations.module').then(m => m.LocationsModule) },
      { path: 'tours', loadChildren: () => import('./tours/tours.module').then(m => m.ToursModule) },
      { path: 'itinerary-admin', component: ItneraryAdminComponent },
    ]
  },
  //   {
  //   path: 'destinations-admin',
  //   loadChildren: () =>
  //     import('./destination-management/destination-management.module').then(
  //       (m) => m.DestinationManagementModule
  //     )
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminLayoutRoutingModule { }
