import {
  Element,
  KIND,
  MatchTagTextReg
} from '../../model/declaration';

export class ConvertService {

  public parseXmlToJson(xmlTxt: string) {

    let currentObj: Array < object > = [{}];
    let keyNameStack: Array < string > = [];
    let depth: number = 0;
    let beforeTagKind: number = 0;

    // 前処理：空タグを開きタグ&閉じタグに置換
    xmlTxt = xmlTxt.replace(MatchTagTextReg.EMPTY_G, '<$1></$1>');
    console.log('xmltxt: ' + xmlTxt);
    // 最初の文字までの空白、改行を削除
    xmlTxt = xmlTxt.replace(/^\s*/, '');
    debugger;
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

      console.log('before switch');
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
          beforeTagKind = KIND.TAG_OPEN;
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

            let tmpObj = currentObj[depth];
            tmpObj[element.content] = currentObj[depth + 1];
            currentObj[depth + 1] = {};
          }
          // 手前タグ種を「閉じタグ」に
          beforeTagKind = KIND.TAG_CLOSE;
          
          break;
          // -----------------------------------------------------


          // --------------------タグ以外の場合-------------------- 
        case KIND.CONTENT:
          // 要素を取得(前後の空白は消去)
          //xmlTxt = xmlTxt.replace(element.content, '').replace(/^\s*/, '');;

          if (beforeTagKind === KIND.TAG_OPEN) {
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
              let tmpObj = currentObj[depth - 1];
              tmpObj[stackTop] = element.content;

            } else {
              // 要素を<#text>タグでくくって戻す
              xmlTxt = '<#text>' + element.content + '</#text>' + xmlTxt;
            }

          } else if (beforeTagKind === KIND.TAG_CLOSE) {
            // 要素を<#text>タグでくくって戻す
            xmlTxt = '<#text>' + element.content + '</#text>' + xmlTxt;

          } else {
            // 処理はなし
            console.log('CONTENT -> CONTENT');
          }

          // 手前タグ種をなしに
          beforeTagKind = KIND.CONTENT;

          break;
          // -----------------------------------------------------


          // -----------------------------------------------------
        default:
          break;
          // -----------------------------------------------------
      }

      // if (xmlTxt[0] === '<') {
      //   // 対象文字列の先頭がタグの場合
      //   const targetTag = xmlTxt.match(/^<[^>]+?>/)[0];
      //   xmlTxt = xmlTxt.replace(/^<[^>]+?>/, '');

      //   if (targetTag.startsWith('</')) {
      // "</"で始まる場合→閉じタグ
      // const closeTagName = targetTag.replace(/^<\/([^>]+?)>/, '$1');
      // // 深さを下げる
      // depth--;

      // if (keyNameStack[depth] === closeTagName) {
      //   // オブジェクトの階層下げ処理
      //   // 下げ先のオブジェクトが未定義なら空オブジェクトに
      //   if (currentObj[depth] === null || currentObj[depth] === undefined) {
      //     currentObj[depth] = {}
      //   }
      //   // 空タグの場合、valueにあたる空オブジェクトが必要
      //   if (currentObj[depth + 1] === null || currentObj[depth + 1] === undefined) {
      //     currentObj[depth + 1] = {}
      //   }

      //   let tmpObj = currentObj[depth];
      //   tmpObj[closeTagName] = currentObj[depth + 1];
      //   currentObj[depth + 1] = {};

      // } else {
      //   // 処理なし
      // }

      // // 手前タグ種を「閉じタグ」に
      // beforeTagKind = KIND.TAG_CLOSE;

      // } else {
      // // 開きタグの場合
      // let openTagContents = targetTag.replace(/^<([^>]+?)>/, '$1');

      // // タグ内の先頭要素がタグ名
      // const openTagName = openTagContents.match(/^\S+/)[0];
      // openTagContents = openTagContents.replace(/^\S+\s*/, '');

      // // キー名をスタックする
      // keyNameStack[depth] = openTagName;

      // // タグ名を除いてもタグ内文字列が存在する場合→属性要素あり
      // let openTagAttr = '';
      // while (openTagContents !== '') {
      //   // 属性を順に取り出す
      //   let attr = openTagContents.match(/^\S+/)[0];
      //   openTagContents = openTagContents.replace(/^\S+\s*/, '');
      //   const attrKey = attr.match(/^[^=]+/)[0];
      //   const attrItem = attr.replace(/^[^=]+=["'](.*?)["']/, '$1');

      //   // 属性をタグ要素としてくくって戻す
      //   openTagAttr += '<-' + attrKey + '>' + attrItem + '</-' + attrKey + '>';
      //   xmlTxt = openTagAttr + xmlTxt;
      // }

      // // 階層を次に進める
      // depth++;

      // // 手前タグ種を「開きタグ」に
      // beforeTagKind = KIND.TAG_OPEN;
      // }

      // } else { // タグ以外の場合
      //   // 要素を取得(前後の空白は消去)
      //   let content = xmlTxt.match(/^[^<]+/)[0].trim();
      //   xmlTxt = xmlTxt.replace(/^[^<]+/, '');

      //   if (beforeTagKind === KIND.TAG_OPEN) {
      //     // 手前タグが開きタグの場合
      //     const nextTag: string = xmlTxt.match(/^<[^>]+?>/)[0];

      //     if (nextTag.startsWith('</')) {
      //       // 次のタグが閉じタグなら

      //       // 要素のキーになる文字列を取り出す
      //       const stackTop = keyNameStack[depth - 1];
      //       keyNameStack[depth - 1] = '';

      //       // 定義先のオブジェクトが未定義なら空オブジェクトに
      //       if (currentObj[depth - 1] === null || currentObj[depth - 1] === undefined) {
      //         currentObj[depth - 1] = {}
      //       }
      //       let tmpObj = currentObj[depth - 1];
      //       tmpObj[stackTop] = content;

      //     } else {
      //       // 要素を<#text>タグでくくって戻す
      //       xmlTxt = '<#text>' + content + '</#text>' + xmlTxt;
      //     }

      //   } else if (beforeTagKind === KIND.TAG_CLOSE) {
      //     // 要素を<#text>タグでくくって戻す
      //     xmlTxt = '<#text>' + content + '</#text>' + xmlTxt;

      //   } else {
      //     // 処理はなし
      //     console.log('CONTENT -> CONTENT');
      //   }

      //   // 手前タグ種をなしに
      //   beforeTagKind = KIND.CONTENT;
      //   // }

      //   console.log(
      //     'currentObj: ' + JSON.stringify(currentObj) + '\n' +
      //     'keyNameStack: ' + keyNameStack + '\n' +
      //     'depth: ' + depth
      //   );

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
    
    console.log(element);
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


}
