import { Router, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
// import { AboutComponent } from './components/about/about.component';
// import { ServicesComponent } from './components/services/services.component';
// import { DestinationsComponent } from './components/destinations/destinations.component';
// import { WhyUsComponent } from './components/why-us/why-us.component';
// import { TopPicksComponent } from './components/top-picks/top-picks.component';
// import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { ItineraryComponent } from './pages/itinerary/itinerary.component';
// import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MapComponent } from './components/map/map.component';
import { TravelGuideComponent } from './pages/travel-guide/travel-guide.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { CareersComponent } from './pages/careers/careers.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LoginComponent } from './auth/login/login.component';

import { DashboardComponent } from './admin-layout/dashboard/dashboard.component';
import { RoleGuard } from './guards/role.guard';
import { TourPackageComponent } from './pages/tour-package/tour-package.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { AuthService } from './services/authService/auth.service';
import { inject } from '@angular/core';
import { AuthCallbackComponent } from './auth/auth-callback.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { EnquiryDetailsComponent } from './admin-layout/enquiry-details/enquiry-details.component';
import { DestinationMainComponent } from './pages/destination-main/destination-main.component';
import { TourDetailComponent } from './pages/tour-detail/tour-detail.component';
// import { TripPlannerComponent } from './common/trip-planner/trip-planner.component';
// import { CustomPlannerComponent } from './pages/custom-planner/custom-planner.component';
import { CompanyPortfolioComponent } from './pages/company-portfolio/company-portfolio.component';
import { GroupBrochureComponent } from './pages/group-brochure/group-brochure.component';
import { ServiceComponent } from './pages/services/services.component';
import { TestimonialComponent } from './pages/testimonials/testimonials.component';


export const routes: Routes = [
      {
    path:'customize-planner',
    component: ItineraryComponent
  },
  { path: 'itinerary', component: ItineraryComponent },

  { path: 'contact', component: ContactComponent },
  { path: 'careers', component: CareersComponent },
  { path: 'aboutUs', component: AboutUsComponent },
  { path: 'travelGuide', component: TravelGuideComponent },
  { path: 'privacyPolicy', component: PrivacyPolicyComponent },
  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  // { path: '**', redirectTo: '' },
  { path: 'home', component: HomeComponent },
  {
    path: '',
    component: HomeComponent,
    children: [
      // { path: 'about', component: AboutComponent },
      // { path: 'services', component: ServicesComponent },
      // { path: 'destinations', component: DestinationsComponent },
      // { path: 'why-us', component: WhyUsComponent },
      // { path: 'top-picks', component: TopPicksComponent },
      // { path: 'testimonials', component: TestimonialsComponent },
      // { path: 'itinerary', component: ItineraryComponent },
      // { path: 'newsletter', component: NewsletterComponent },
      // { path: 'contact', component: ContactComponent },
      // { path: 'map', component: MapComponent },
      { path: '', redirectTo: '', pathMatch: 'full' }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [
      () => inject(AuthService).isAuthenticated() || inject(Router).navigate(['/login']),
      RoleGuard
    ],
    data: { roles: ['user', 'manager', 'admin'] }
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-layout/admin-layout.module').then(m => m.AdminLayoutModule),
    // component: AdminLayoutComponent, 
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'manager'] }
  },
  // {
  //   path:'itinerary-admin',
  //   component:ItneraryAdminComponent,
  //    canActivate: [RoleGuard],
  //       data: { roles: ['admin','manager'] }
  // },

  { path: 'auth/:provider/callback', component: AuthCallbackComponent },
  //  {
  //     path: 'manager',
  //     component: TourPackageComponent,
  //     // canActivate: [AuthGuard, RoleGuard],
  //     data: { roles: ['manager', 'admin'] }
  //   },
  {
    path: 'profile',
    component: DashboardComponent,
    // canActivate: [AuthGuard]
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'tours/:slug',
    loadComponent: () => import('./pages/tour-detail/tour-detail.component').then(m => m.TourDetailComponent)
  },
  //   {
  //   path: 'destinations/:id',
  //   loadComponent: () => import('./pages/tour-detail/tour-detail.component').then(m => m.TourDetailComponent)
  // }
  {
    path: 'destination/:title',
    loadComponent: () => import('./pages/destination-main/destination-main.component').then(m => m.DestinationMainComponent)
  },

  {
    path: 'tours',
    component: TourPackageComponent
  },
  {
    path: 'tour/:slug',
    component: TourDetailComponent
  },
  // {
  //   path:'customize-planner',
  //   component: CustomPlannerComponent
  // },
  {
    path: 'company-portfolio',
    component:CompanyPortfolioComponent
  },
  {
    path:'group-brochure',
    component: GroupBrochureComponent
  }, 
  {
    path:'services', 
    component: ServiceComponent
  }, 
  {
    path:'testimonials',
    component: TestimonialComponent
  }
];
