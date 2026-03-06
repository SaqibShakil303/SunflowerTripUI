import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/authService/auth.service';
import { WishlistService } from '../../../services/wishlist/wishlist.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wishlists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlists.component.html',
  styleUrl: './wishlists.component.scss',
})
export class WishlistsComponent implements OnInit {
  isUserLoggedin: boolean = false;
  user: any = null;
  wishlist: any[] = [];

  constructor(
    private authService: AuthService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isUserLoggedin = this.authService.isAuthenticated();
    this.user = this.authService.getUser();
    this.loadWishlistData();
  }

  loadWishlistData() {
    this.wishlistService.getByUserId(this.user.id).subscribe({
      next: (data: any) => {
        this.wishlist = data.data || [];
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  handleRemoveWishlist(id: number) {
    this.wishlistService.deleteById(id).subscribe({
      next: (data) => {
        this.loadWishlistData();
      },
      error: (error) => console.log(error),
    });
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  gotoTour(url: string) {
    this.router.navigate([`tour/${url}`]);
  }
}
