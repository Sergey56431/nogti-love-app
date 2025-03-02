import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent, SidebarComponent } from '@shared/components';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, HeaderComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {}
