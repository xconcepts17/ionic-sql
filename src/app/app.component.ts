import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { AppStorageService } from './app-storage/app-storage.service';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    public platform: Platform,
    public storage: AppStorageService
  ) { }


  ngOnInit(): void {
    this.initializeApp();
    // throw new Error('Method not implemented.');
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      const setStatusBarStyleDark = async () => {
        await StatusBar.setStyle({ style: Style.Light });
      };
      this.storage.init();
      SplashScreen.hide();
    });
  }
}
