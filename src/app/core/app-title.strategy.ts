import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) { super(); }
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    if (pageTitle) this.title.setTitle(`${pageTitle} | SunflowerTrip`);
  }
}
