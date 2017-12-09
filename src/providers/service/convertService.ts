import {
  Element,
  KIND,
  MatchTagTextReg
} from '../../model/declaration';

export class ConvertService {

  public parseXmlToJson(xmlTxt: string) {

    // オブジェクト管理用配列
    let currentObj: Array < object > = [{}];
    // キー名を保持する配列
    let keyNameStack: Array < string > = [];
    // 管理中の深さを表す
    let depth: number = 0;
    // 現要素のひとつ前の要素種別を保持する
    let beforeElementKind: number = 0;

    // 前処理：空タグを開きタグ&閉じタグに置換
    xmlTxt = xmlTxt.replace(MatchTagTextReg.EMPTY_G, '<$1></$1>');
    console.log('xmltxt: ' + xmlTxt);
    // 最初の文字までの空白、改行を削除
    xmlTxt = xmlTxt.replace(/^\s*/, '');
    
    // 変換対象の文字列がなくなるまで
    while (xmlTxt[0] !== undefined && xmlTxt[0] !== null && xmlTxt[0] !== '') {

      let element: Element;

      element = this.getFirstElement(xmlTxt);
      if(element.kind === KIND.TAG_OPEN) {
        xmlTxt = xmlTxt.replace('<' + element.content + '>', '');
      } else if(element.kind === KIND.TAG_CLOSE) {
        xmlTxt = xmlTxt.replace('</' + element.content + '>', '');
      } else {
        xmlTxt = xmlTxt.replace(element.content, '');
      }

      switch (element.kind) {
        // --------------------開きタグの場合--------------------
        case KIND.TAG_OPEN:
          // タグ内の先頭要素がタグ名
          const openTagName = element.content.match(/^\S+/)[0];
          let attrTxt = element.content.replace(/^\S+\s*/, '');
          // キー名をスタックする
          keyNameStack[depth] = openTagName;
          // タグ名を除いてもタグ内文字列が存在する場合→属性要素あり
          let openTagAttr = '';
          while (attrTxt !== '') {
            // 属性を順に取り出す
            let attr = attrTxt.match(/^\S+/)[0];
            attrTxt = attrTxt.replace(/^\S+\s*/, '');
            const attrKey = attr.match(/^[^=]+/)[0];
            const attrItem = attr.replace(/^[^=]+=["'](.*?)["']/, '$1');
            // 属性をタグ要素としてくくる
            openTagAttr += '<-' + attrKey + '>' + attrItem + '</-' + attrKey + '>';
          }
          xmlTxt = openTagAttr + xmlTxt;
          // 階層を次に進める
          depth++;
          // 手前タグ種を「開きタグ」に
          beforeElementKind = KIND.TAG_OPEN;

          break;
          // -----------------------------------------------------

          // --------------------閉じタグの場合-------------------- 
        case KIND.TAG_CLOSE:
          // 深さを下げる
          depth--;
          if (keyNameStack[depth] === element.content) {
            // オブジェクトの階層下げ処理
            // 下げ先のオブジェクトが未定義なら空オブジェクトに
            if (currentObj[depth] === null || currentObj[depth] === undefined) {
              currentObj[depth] = {}
            }
            // 空タグだった場合、valueにあたる空オブジェクトが必要
            if (currentObj[depth + 1] === null || currentObj[depth + 1] === undefined) {
              currentObj[depth + 1] = {}
            }
            this.addKeyAndValue(currentObj, depth, element.content, currentObj[depth + 1]);
            currentObj[depth + 1] = {};
          }
          // 手前タグ種を「閉じタグ」に
          beforeElementKind = KIND.TAG_CLOSE;
          
          break;
          // -----------------------------------------------------

          // --------------------タグ以外の場合-------------------- 
        case KIND.CONTENT:
          if (beforeElementKind === KIND.TAG_OPEN) {
            // 手前タグが開きタグの場合
            const nextTag = this.getFirstElement(xmlTxt)
            if (nextTag.kind === KIND.TAG_CLOSE) {
              // 次のタグが閉じタグなら
              // 要素のキーになる文字列を取り出す
              const stackTop = keyNameStack[depth - 1];
              keyNameStack[depth - 1] = '';
              // 定義先のオブジェクトが未定義なら空オブジェクトに
              if (currentObj[depth - 1] === null || currentObj[depth - 1] === undefined) {
                currentObj[depth - 1] = {}
              }
              // オブジェクト管理配列にキーとバリューを追加する
              this.addKeyAndValue(currentObj, depth - 1, stackTop, element.content);
            } else {
              // 要素を<#text>タグでくくって戻す
              xmlTxt = '<#text>' + element.content + '</#text>' + xmlTxt;
            }
          } else if (beforeElementKind === KIND.TAG_CLOSE) {
            // 手前タグが閉じタグなら
            // 要素を<#text>タグでくくって戻す
            xmlTxt = '<#text>' + element.content + '</#text>' + xmlTxt;
          } else {
            // 処理はなし
            console.log('ERROR: CONTENT -> CONTENT');
          }
          // 手前タグ種をなしに
          beforeElementKind = KIND.CONTENT;

          break;
          // -----------------------------------------------------

          // -----------------------default-----------------------
        default:
          break;
          // -----------------------------------------------------
      }

      // 次の文字までの空白、改行を削除
      xmlTxt = xmlTxt.replace(/^\s*/, '');
    }
    return JSON.stringify(currentObj[0], null, 2);
  }


  //  テキストの先頭の要素を判別して返す
  private getFirstElement(text: string): Element {
    let element: Element = {
      kind: null,
      content: ''
    };

    if (text[0] === '<') {
      // 先頭の要素がタグの場合
      const targetTag = text.match(MatchTagTextReg.OPEN)[0];
      element.kind = this.determineTagKind(targetTag);
      element.content = this.getTagName(targetTag);
    } else {
      // タグ以外の場合
      element.kind = KIND.CONTENT;
      element.content = text.match(/^[^<]+/)[0].trim();
    }
    return element;
  }


  // タグの種別を判別する
  private determineTagKind(tag: string): number {
    if (tag.startsWith('</')) {
      return KIND.TAG_CLOSE; // 閉じタグ
    } else {
      return KIND.TAG_OPEN; // 開きタグ
    }
  }


  // タグの名前部分のみを返す
  private getTagName(tag: string): string {
    let kind: string = '';
    switch (this.determineTagKind(tag)) {
      // 開きタグの場合
      case KIND.TAG_OPEN:
        kind = tag.replace(MatchTagTextReg.OPEN, '$1');
        break;
        // 閉じタグの場合
      case KIND.TAG_CLOSE:
        kind = tag.replace(MatchTagTextReg.CLOSE, '$1');
        break;
      default:
        kind = '';
        break
    }
    return kind;
  }


  // 指定のオブジェクト配列の指定の深さの部分に、キーとバリューのセットを追加する
  private addKeyAndValue(objects: Array < object >, depth: number, key: string, value: string|object) {
    let tmpObj = objects[depth];

    if (tmpObj[key] === null || tmpObj[key] === undefined) {
      // 追加先にキーが未定義ならそのまま追加
      tmpObj[key] = value;
    } else {
      // 追加先にキーの値が定義されている場合
      if (tmpObj[key] instanceof Array) {
        // すでに配列になっていれば、バリューを追加するのみ
        let tmpArray: Array <string|object> = tmpObj[key];
        tmpArray.push(value);
      } else {
        // オブジェクトか文字列の場合
        let tmpArray: Array <string|object> = [];
        tmpArray.push(tmpObj[key]);
        tmpArray.push(value);
        tmpObj[key] = tmpArray;
      }
    }
  }

}
