import { Component } from '@angular/core';
import { HeaderComponent } from "../../common/header/header.component";
import { FooterComponent } from "../../common/footer/footer.component";
import { ServicesComponent } from "../../components/services/services.component";

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, ServicesComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServiceComponent {

}
