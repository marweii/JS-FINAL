
const electron = require('electron');

// ����Ӧ���������ڵ�ģ��

const {app} = electron;

// ����������������ڵ�ģ��

const {BrowserWindow} = electron;

 

// ָ�򴰿ڶ����һ��ȫ�����ã����û��������ã���ô����javascript�����������յ�

// ʱ��ô��ڽ����Զ��ر�

let win;

 

function createWindow() {

  // ����һ���µ����������

  win = new BrowserWindow({width: 1920, height: 1080});

 

  // ����װ��Ӧ�õ�index.htmlҳ��

  win.loadURL(`file://${__dirname}/index.html`);

 

  // �򿪿�������ҳ��

  //win.webContents.openDevTools();

 

  // �����ڹر�ʱ���õķ���

  win.on('closed', () => {

    // ������ڶ�������ã�ͨ���������Ӧ��֧�ֶ�����ڵĻ��������һ��������

    // ��Ŵ��ڶ����ڴ��ڹرյ�ʱ��Ӧ��ɾ����Ӧ��Ԫ�ء�

    win = null;

  });

}

 

// ��Electron��ɳ�ʼ�������Ѿ���������������ڣ���÷������ᱻ���á�

// ��ЩAPIֻ���ڸ��¼���������ܱ�ʹ�á�

app.on('ready', createWindow);

/* var mainWindow = new BrowserWindow({

  webPreferences: {

    nodeIntegration: false

  }

}); */

// �����еĴ��ڱ��رպ��˳�Ӧ��

app.on('window-all-closed', () => {

  // ����OS Xϵͳ��Ӧ�ú���Ӧ�Ĳ˵�����һֱ����ֱ���û�ͨ��Cmd + Q��ʽ�˳�

  if (process.platform !== 'darwin') {

    app.quit();

  }

});

 

app.on('activate', () => {

  // ����OS Xϵͳ����dockͼ�걻���������´���һ��app���ڣ����Ҳ���������

  // ���ڴ�

  if (win === null) {

    createWindow();

  }

});

 

// ������ļ����������ֱ�Ӱ�����Ӧ���ض��������������еĴ��롣

// Ҳ���԰���Щ���������һ���ļ���Ȼ�������ﵼ�롣