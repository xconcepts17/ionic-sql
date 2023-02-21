import { Component } from '@angular/core';
import { format } from 'date-fns';
import { AppStorageService } from '../app-storage/app-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  dbName = '';
  demoData: any = {
    name: "FNPF PF DB Storage",
    date: '',
    storage: 'No Set'
  }
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

  async demoInsert() {
    this.demoData.date = format(new Date(), 'dd/MM/yyyy');
    this.demoData.storage = 'Stored';
    let setData = await this.storage.setData('demoData', this.demoData);
    if (setData) {

    } else {
      this.demoData.storage = 'Stroage Failed';
    }
    // console.log(setData);
  }
  async demoGet() {
    this.demoData = await this.storage.getData('demoData');
    // console.log(setData);
  }
  async demoDelete() {
    await this.storage.eraseDeviseData();
  }

}
