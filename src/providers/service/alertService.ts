import { Injectable } from '@angular/core';

import {
  Alert,
  AlertController,
} from 'ionic-angular';

@Injectable()
export class AlertService {

  constructor(
    private alertCtrl: AlertController
  ) {

  }

  presentAlert(alertTitle: string, contentTxt: string) {
    let alert: Alert = this.alertCtrl.create({
      title: alertTitle,
      subTitle: contentTxt,
      buttons: ['OK']
    });
    alert.present();
  }


}
