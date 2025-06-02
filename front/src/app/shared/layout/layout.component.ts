import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent, SidebarComponent } from '@shared/components';

@Component({
    selector: 'app-layout',
    imports: [SidebarComponent, RouterOutlet, HeaderComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent {}
