
import { Component } from '@angular/core';
import { ChatbotComponent } from './chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
