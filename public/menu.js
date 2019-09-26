const { app, Menu, shell, BrowserWindow } = require('electron');

const dev = !app.isPackaged;

class MenuBuilder {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    this.subMenuCustom = {
      label: 'POS快捷键',
      submenu: [
        /******************键盘功能键******************/

        // {
        //   label: 'Delete删除',
        //   accelerator: 'Delete',
        //   click() {
        //     mainWindow.webContents.send('Delete');
        //   }
        // },
        {
          label: 'ESC取消',
          accelerator: 'ESC',
          click() {
            mainWindow.webContents.send('ESC');
          }
        },
        {
          label: 'ENTER确定',
          accelerator: 'ENTER',
          click() {
            mainWindow.webContents.send('ENTER');
          }
        },
        {
          label: 'Tab退格',
          accelerator: 'Tab',
          click() {
            mainWindow.webContents.send('Tab');
          }
        },
        {
          label: '会员更换',
          accelerator: 'End',
          click() {
            mainWindow.webContents.send('End');
          }
        },
        {
          label: '电子优惠券支付',
          accelerator: 'PageUp',
          click() {
            mainWindow.webContents.send('PageUp');
          }
        },
        {
          label: '自定义支付',
          accelerator: 'PageDown',
          click() {
            mainWindow.webContents.send('PageDown');
          }
        },
        {
          label: '',
          accelerator: 'Home',
          click() {
            mainWindow.webContents.send('Home');
          }
        },
        {
          label: '',
          accelerator: 'Insert',
          click() {
            mainWindow.webContents.send('Insert');
          }
        },

        /******************上下左右键******************/

        {
          label: '上箭头',
          accelerator: 'Up',
          click() {
            mainWindow.webContents.send('Up');
          }
        },
        {
          label: '下箭头',
          accelerator: 'Down',
          click() {
            mainWindow.webContents.send('Down');
          }
        },
        {
          label: '左箭头',
          accelerator: 'Left',
          click() {
            mainWindow.webContents.send('Left');
          }
        },
        {
          label: '右箭头',
          accelerator: 'Right',
          click() {
            mainWindow.webContents.send('Right');
          }
        },

        /********************A-Z*********************/

        {
          label: '',
          accelerator: 'Shift+A',
          click() {
            mainWindow.webContents.send('A');
          }
        },
        {
          label: '',
          accelerator: 'Shift+B',
          click() {
            mainWindow.webContents.send('B');
          }
        },
        {
          label: '整单折扣',
          accelerator: 'Shift+C',
          click() {
            mainWindow.webContents.send('C');
          }
        },
        {
          label: '团购',
          accelerator: 'Shift+D',
          click() {
            mainWindow.webContents.send('D');
          }
        },
        {
          label: '更正',
          accelerator: 'Shift+E',
          click() {
            mainWindow.webContents.send('E');
          }
        },
        {
          label: '让价换购',
          accelerator: 'Shift+F',
          click() {
            mainWindow.webContents.send('F');
          }
        },
        {
          label: '赠品销售',
          accelerator: 'Shift+G',
          click() {
            mainWindow.webContents.send('G');
          }
        },
        {
          label: '测试打印',
          accelerator: 'Shift+H',
          click() {
            mainWindow.webContents.send('H');
          }
        },
        {
          label: '收银员登录',
          accelerator: 'Shift+I',
          click() {
            mainWindow.webContents.send('I');
          }
        },
        {
          label: '整单计算',
          accelerator: 'Shift+J',
          click() {
            mainWindow.webContents.send('J');
          }
        },
        {
          label: '取消整单',
          accelerator: 'Shift+K',
          click() {
            mainWindow.webContents.send('K');
          }
        },
        {
          label: '会员登录',
          accelerator: 'Shift+L',
          click() {
            mainWindow.webContents.send('L');
          }
        },
        {
          label: '录入促销员编号',
          accelerator: 'Shift+M',
          click() {
            mainWindow.webContents.send('M');
          }
        },
        {
          label: '设置',
          accelerator: 'Shift+N',
          click() {
            mainWindow.webContents.send('N');
          }
        },
        {
          label: '收银员登出',
          accelerator: 'Shift+O',
          click() {
            mainWindow.webContents.send('O');
          }
        },
        {
          label: '修改密码',
          accelerator: 'Shift+P',
          click() {
            mainWindow.webContents.send('P');
          }
        },
        {
          label: '查价',
          accelerator: 'Shift+Q',
          click() {
            mainWindow.webContents.send('Q');
          }
        },
        {
          label: '即更',
          accelerator: 'Shift+R',
          click() {
            mainWindow.webContents.send('R');
          }
        },
        {
          label: '积分换购',
          accelerator: 'Shift+S',
          click() {
            mainWindow.webContents.send('S');
          }
        },
        {
          label: '选中数量',
          accelerator: 'Shift+T',
          click() {
            mainWindow.webContents.send('T');
          }
        },
        {
          label: '出款',
          accelerator: 'Shift+U',
          click() {
            mainWindow.webContents.send('U');
          }
        },
        {
          label: '整单折让',
          accelerator: 'Shift+V',
          click() {
            mainWindow.webContents.send('V');
          }
        },
        {
          label: '变价',
          accelerator: 'Shift+W',
          click() {
            mainWindow.webContents.send('W');
          }
        },
        {
          label: '单品折让',
          accelerator: 'Shift+X',
          click() {
            mainWindow.webContents.send('X');
          }
        },
        {
          label: '入款',
          accelerator: 'Shift+Y',
          click() {
            mainWindow.webContents.send('Y');
          }
        },
        {
          label: '单品折扣',
          accelerator: 'Shift+Z',
          click() {
            mainWindow.webContents.send('Z');
          }
        },

        {
          label: '',
          accelerator: 'A',
          click() {
            mainWindow.webContents.send('A');
          }
        },
        {
          label: '',
          accelerator: 'B',
          click() {
            mainWindow.webContents.send('B');
          }
        },
        {
          label: '整单折扣',
          accelerator: 'C',
          click() {
            mainWindow.webContents.send('C');
          }
        },
        {
          label: '团购',
          accelerator: 'D',
          click() {
            mainWindow.webContents.send('D');
          }
        },
        {
          label: '更正',
          accelerator: 'E',
          click() {
            mainWindow.webContents.send('E');
          }
        },
        {
          label: '让价换购',
          accelerator: 'F',
          click() {
            mainWindow.webContents.send('F');
          }
        },
        {
          label: '赠品销售',
          accelerator: 'G',
          click() {
            mainWindow.webContents.send('G');
          }
        },
        {
          label: '测试打印',
          accelerator: 'H',
          click() {
            mainWindow.webContents.send('H');
          }
        },
        {
          label: '收银员登录',
          accelerator: 'I',
          click() {
            mainWindow.webContents.send('I');
          }
        },
        {
          label: '整单计算',
          accelerator: 'J',
          click() {
            mainWindow.webContents.send('J');
          }
        },
        {
          label: '取消整单',
          accelerator: 'K',
          click() {
            mainWindow.webContents.send('K');
          }
        },
        {
          label: '会员登录',
          accelerator: 'L',
          click() {
            mainWindow.webContents.send('L');
          }
        },
        {
          label: '录入促销员编号',
          accelerator: 'M',
          click() {
            mainWindow.webContents.send('M');
          }
        },
        {
          label: '设置',
          accelerator: 'N',
          click() {
            mainWindow.webContents.send('N');
          }
        },
        {
          label: '收银员登出',
          accelerator: 'O',
          click() {
            mainWindow.webContents.send('O');
          }
        },
        {
          label: '修改密码',
          accelerator: 'P',
          click() {
            mainWindow.webContents.send('P');
          }
        },
        {
          label: '查价',
          accelerator: 'Q',
          click() {
            mainWindow.webContents.send('Q');
          }
        },
        {
          label: '即更',
          accelerator: 'R',
          click() {
            mainWindow.webContents.send('R');
          }
        },
        {
          label: '积分换购',
          accelerator: 'S',
          click() {
            mainWindow.webContents.send('S');
          }
        },
        {
          label: '选中数量',
          accelerator: 'T',
          click() {
            mainWindow.webContents.send('T');
          }
        },
        {
          label: '出款',
          accelerator: 'U',
          click() {
            mainWindow.webContents.send('U');
          }
        },
        {
          label: '整单折让',
          accelerator: 'V',
          click() {
            mainWindow.webContents.send('V');
          }
        },
        {
          label: '变价',
          accelerator: 'W',
          click() {
            mainWindow.webContents.send('W');
          }
        },
        {
          label: '单品折让',
          accelerator: 'X',
          click() {
            mainWindow.webContents.send('X');
          }
        },
        {
          label: '入款',
          accelerator: 'Y',
          click() {
            mainWindow.webContents.send('Y');
          }
        },
        {
          label: '单品折扣',
          accelerator: 'Z',
          click() {
            mainWindow.webContents.send('Z');
          }
        },
        /*******************F1-F12*******************/

        {
          label: '现金支付',
          accelerator: 'F1',
          click() {
            mainWindow.webContents.send('F1');
          }
        },
        {
          label: '积分支付',
          accelerator: 'F2',
          click() {
            mainWindow.webContents.send('F2');
          }
        },
        {
          label: '银联卡支付',
          accelerator: 'F3',
          click() {
            mainWindow.webContents.send('F3');
          }
        },
        {
          label: '线上支付',
          accelerator: 'F4',
          click() {
            mainWindow.webContents.send('F4');
          }
        },
        {
          label: '支票支付',
          accelerator: 'F5',
          click() {
            mainWindow.webContents.send('F5');
          }
        },
        {
          label: '代币券支付',
          accelerator: 'F6',
          click() {
            mainWindow.webContents.send('F6');
          }
        },
        {
          label: '零钱包',
          accelerator: 'F7',
          click() {
            mainWindow.webContents.send('F7');
          }
        },
        {
          label: '预付卡/提货卡支付',
          accelerator: 'F8',
          click() {
            mainWindow.webContents.send('F8');
          }
        },
        {
          label: '锁定POS',
          accelerator: 'F9',
          click() {
            mainWindow.webContents.send('F9');
          }
        },
        {
          label: '取单',
          accelerator: 'F10',
          click() {
            mainWindow.webContents.send('F10');
          }
        },
        {
          label: '挂单',
          accelerator: 'F11',
          click() {
            mainWindow.webContents.send('F11');
          }
        },
        {
          label: '',
          accelerator: 'F12',
          click() {
            mainWindow.webContents.send('F12');
          }
        },
        {
          label: '退货',
          accelerator: 'CommandOrControl+1',
          click() {
            mainWindow.webContents.send('CommandOrControl+1');
          }
        },
        {
          label: '知而行',
          accelerator: 'CommandOrControl+3',
          click() {
            mainWindow.webContents.send('CommandOrControl+3');
          }
        },
        {
          label: '换购',
          accelerator: 'CommandOrControl+2',
          click() {
            mainWindow.webContents.send('CommandOrControl+2');
          }
        },
        /*******************标点符号*******************/

        {
          label: '!',
          accelerator: '!',
          click() {
            mainWindow.webContents.send('!');
          }
        },
        {
          label: '@',
          accelerator: '@',
          click() {
            mainWindow.webContents.send('@');
          }
        },
        {
          label: '#',
          accelerator: '#',
          click() {
            mainWindow.webContents.send('#');
          }
        },
        {
          label: '$',
          accelerator: '$',
          click() {
            mainWindow.webContents.send('$');
          }
        },
        {
          label: '',
          accelerator: '%',
          click() {
            mainWindow.webContents.send('%');
          }
        },
        {
          label: '',
          accelerator: '^',
          click() {
            mainWindow.webContents.send('^');
          }
        },
        {
          label: '',
          accelerator: '&',
          click() {
            mainWindow.webContents.send('&');
          }
        },
        {
          label: '',
          accelerator: '*',
          click() {
            mainWindow.webContents.send('*');
          }
        },
        {
          label: '',
          accelerator: '(',
          click() {
            mainWindow.webContents.send('(');
          }
        },
        {
          label: '',
          accelerator: ')',
          click() {
            mainWindow.webContents.send(')');
          }
        },
        {
          label: '小结',
          accelerator: '[',
          click() {
            mainWindow.webContents.send('[');
          }
        },
        {
          label: '总结',
          accelerator: ']',
          click() {
            mainWindow.webContents.send(']');
          }
        },
        {
          label: '',
          accelerator: '{',
          click() {
            mainWindow.webContents.send('{');
          }
        },
        {
          label: '',
          accelerator: 'Shift+{',
          click() {
            mainWindow.webContents.send('{');
          }
        },
        {
          label: '',
          accelerator: '}',
          click() {
            mainWindow.webContents.send('}');
          }
        },
        {
          label: '',
          accelerator: 'Shift+}',
          click() {
            mainWindow.webContents.send('}');
          }
        },
        {
          label: '重打上一单',
          accelerator: ',',
          click() {
            mainWindow.webContents.send(',');
          }
        },
        {
          label: '重打任意单',
          accelerator: '.',
          click() {
            mainWindow.webContents.send('.');
          }
        },
        {
          label: '',
          accelerator: '-',
          click() {
            mainWindow.webContents.send('-');
          }
        },
        {
          label: '',
          accelerator: '=',
          click() {
            mainWindow.webContents.send('=');
          }
        },
        {
          label: '',
          accelerator: '/',
          click() {
            mainWindow.webContents.send('/');
          }
        },

        {
          label: '\\',
          accelerator: '\\',
          click() {
            mainWindow.webContents.send('\\');
          }
        },
        {
          label: '退货',
          accelerator: ';',
          click() {
            mainWindow.webContents.send(';');
          }
        },

        {
          label: '',
          accelerator: "'",
          click() {
            mainWindow.webContents.send("'");
          }
        },
        {
          label: '',
          accelerator: 'Left Arrow',
          click() {
            mainWindow.webContents.send('Left Arrow');
          }
        },

        {
          label: '',
          accelerator: '<',
          click() {
            mainWindow.webContents.send('<');
          }
        },
        {
          label: '',
          accelerator: 'Shift+<',
          click() {
            mainWindow.webContents.send('<');
          }
        },
        {
          label: '',
          accelerator: '>',
          click() {
            mainWindow.webContents.send('>');
          }
        },
        {
          label: '',
          accelerator: 'Shift+>',
          click() {
            mainWindow.webContents.send('>');
          }
        },
        {
          label: '',
          accelerator: ':',
          click() {
            mainWindow.webContents.send(':');
          }
        },
        {
          label: '',
          accelerator: 'Shift+:',
          click() {
            mainWindow.webContents.send(':');
          }
        },
        {
          label: '',
          accelerator: '"',
          click() {
            mainWindow.webContents.send('"');
          }
        },
        {
          label: '',
          accelerator: 'Shift+"',
          click() {
            mainWindow.webContents.send('"');
          }
        },
        {
          label: '',
          accelerator: '|',
          click() {
            mainWindow.webContents.send('|');
          }
        },
        {
          label: '',
          accelerator: 'Shift+|',
          click() {
            mainWindow.webContents.send('|');
          }
        },

        {
          label: '',
          accelerator: '?',
          click() {
            mainWindow.webContents.send('?');
          }
        },
        {
          label: '',
          accelerator: 'Shift+?',
          click() {
            mainWindow.webContents.send('?');
          }
        },

        {
          label: '',
          accelerator: '_',
          click() {
            mainWindow.webContents.send('_');
          }
        },
        {
          label: '',
          accelerator: 'Shift+_',
          click() {
            mainWindow.webContents.send('_');
          }
        },
        {
          label: '',
          accelerator: '+',
          click() {
            mainWindow.webContents.send('+');
          }
        },
        /*******************数字*******************/
        {
          label: '数字0',
          accelerator: '0',
          click() {
            mainWindow.webContents.send('0');
          }
        },
        {
          label: '数字1',
          accelerator: '1',
          click() {
            mainWindow.webContents.send('1');
          }
        },
        {
          label: '数字2',
          accelerator: '2',
          click() {
            mainWindow.webContents.send('2');
          }
        },
        {
          label: '数字3',
          accelerator: '3',
          click() {
            mainWindow.webContents.send('3');
          }
        },
        {
          label: '数字4',
          accelerator: '4',
          click() {
            mainWindow.webContents.send('4');
          }
        },
        {
          label: '数字5',
          accelerator: '5',
          click() {
            mainWindow.webContents.send('5');
          }
        },
        {
          label: '数字6',
          accelerator: '6',
          click() {
            mainWindow.webContents.send('6');
          }
        },
        {
          label: '数字7',
          accelerator: '7',
          click() {
            mainWindow.webContents.send('7');
          }
        },
        {
          label: '数字8',
          accelerator: '8',
          click() {
            mainWindow.webContents.send('8');
          }
        },
        {
          label: '数字9',
          accelerator: '9',
          click() {
            mainWindow.webContents.send('9');
          }
        }
      ]
    };
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    if (dev) {
      this.setContextMenu();
    }

    const menu = Menu.buildFromTemplate(this.buildDefaultTemplate());
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setContextMenu() {
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: '调试模式',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        },
        {
          label: '最大化',
          click: () => {
            this.mainWindow.maximize();
          }
        },
        {
          label: '最小化',
          click: () => {
            this.mainWindow.minimize();
          }
        },
        {
          label: '还原',
          click: () => {
            this.mainWindow.restore();
          }
        },
        {
          label: '关闭',
          click: () => {
            app.quit();
          }
        },
        {
          label: '全屏切换',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]).popup(this.mainWindow);
    });
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
  }

  buildDefaultTemplate() {
    const subMenuFile = {
      label: '&File',
      submenu: [
        {
          label: '&Open',
          accelerator: 'Ctrl+O'
        },
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => {
            this.mainWindow.close();
          }
        }
      ]
    };

    //开发测试阶段使用
    const subMenuView = {
      label: '&View',
      submenu: [
        {
          label: '&重载',
          accelerator: 'Ctrl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: '全屏切换',
          accelerator: 'F11',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: '开发者工具',
          accelerator: 'Alt+Ctrl+I',
          click: () => {
            if (!this.mainWindow.isMaximized()) {
              this.mainWindow.maximize();
            }
            this.mainWindow.toggleDevTools();
          }
        }
      ]
    };

    const subMenuHelp = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('http://electron.atom.io');
          }
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/atom/electron/tree/master/docs#readme'
            );
          }
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://discuss.atom.io/c/electron');
          }
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/atom/electron/issues');
          }
        }
      ]
    };

    return [subMenuFile, subMenuView, subMenuHelp];
  }
}

module.exports = MenuBuilder;