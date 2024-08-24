import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterLinkWithHref, RouterOutlet} from "@angular/router";
import {MainComponent} from "@views/page";
import {SidebarComponent} from "@shared/components";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    SidebarComponent,
    MainComponent,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterLinkWithHref
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
