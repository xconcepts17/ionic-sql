import { Component } from '@angular/core';
import { AppStorageService } from '../app-storage/app-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  dbName = '';
  constructor(
    public storage: AppStorageService
  ) {

  }


  async addDummyData() {
    const obj = {
      name: "xconcepts"
    };
    await this.storage.setData('sampleData', obj);
  }

}
