import { Component, inject } from '@angular/core';
import { TripPlannerComponent } from "../../common/trip-planner/trip-planner.component";
import { MatDialog } from '@angular/material/dialog';
import { TripPlannerService } from '../../services/TripPlanner/trip-planner.service';

@Component({
  selector: 'app-custom-planner',
  standalone: true,

  templateUrl: './custom-planner.component.html',
  styleUrl: './custom-planner.component.scss'
})
export class CustomPlannerComponent {
     private dialog = inject(MatDialog);

 constructor(private planner: TripPlannerService){}
  ngOnInit() {
    setTimeout(() => this.planner.openModal(), 10000);
  }
 openTripPlanner() {
    this.dialog.open(TripPlannerComponent, {
      width: '600px',
      // height:'500px',
      panelClass: 'trip-modal-panel',
   disableClose: false ,
      backdropClass: 'blur-backdrop'
    });
  }
}
