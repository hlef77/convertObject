import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { AlertService } from '../../providers/service/alertService';
import { ConvertService } from '../../providers/service/convertService';

import { defaultXml } from '../../model/declaration';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private xmlTxt: string;
  private jsonTxt: string;

  constructor(
    public navCtrl: NavController,
    private convertService: ConvertService,
    private alertService: AlertService
  ) {
    this.xmlTxt = defaultXml;
  }

  private onConvert() {
    if (this.xmlTxt === undefined || this.xmlTxt === '') {
      this.alertService.presentAlert('警告', '変換前テキストを入力してください');
      return;
    }
    let cnvText = this.convertService.parseXmlToJson(this.xmlTxt);
    this.jsonTxt = cnvText;
  }

}
