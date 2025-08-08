const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs'); // fs 모듈 추가

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'public', 'dation_logo.icns'), // 아이콘 설정
    show: false, // 초기에 창을 숨김 (로딩 완료 후 표시)
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false,
      enablePreferredSizeMode: false, // Autofill 관련 콘솔 에러 방지를 위해 추가
      // Content Security Policy 설정
      // 개발 환경에서 Vite의 HMR(Hot Module Replacement)을 위해 'unsafe-eval'이 필요합니다.
      // 이 경고는 앱이 패키징된 후에는 나타나지 않습니다.
      contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; connect-src 'self' https://api.banya.ai; font-src 'self' https://fonts.gstatic.com; object-src 'none'; media-src 'none'; child-src 'none';"
    },
  });

  const appPath = path.join(__dirname, 'dist', 'index.html');
  // Electron 메인 프로세스에서 로드하려는 URL을 로깅합니다.
  // console.log(`[Electron Main] Current __dirname: ${__dirname}`); // NEW: __dirname 로깅 추가
  // console.log(`[Electron Main] Attempting to load URL: ${appPath}`);

  // dist/index.html 파일 존재 여부 확인
  if (!fs.existsSync(appPath)) {
    // console.error(`[Electron Main] ERROR: 'dist/index.html' not found at ${appPath}.`);
    // console.error(`[Electron Main] Please ensure 'npm run build' (or 'vite build') was successful.`);
    // 개발자 도구 강제 열기 (파일이 없을 때도) - 주석 처리
    // mainWindow.webContents.openDevTools();
    // 사용자에게 오류 메시지를 표시하는 간단한 HTML을 로드할 수도 있습니다.
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <html>
        <head><title>Loading Error</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1>Application Loading Error</h1>
          <p>The application could not be loaded. This is likely due to missing build files.</p>
          <p>Please ensure you have run <code>npm run electron:dev</code> or <code>npm run build</code> successfully.</p>
          <p>Check the console (Ctrl+Shift+I or Cmd+Option+I) for more details.</p>
        </body>
      </html>
    `)}`);
    return; // 파일이 없으면 더 이상 진행하지 않음
  }

  const appUrl = url.format({
    pathname: appPath,
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(appUrl);

  // 창이 준비되면 표시
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 개발자 도구 열기: 이 줄의 주석을 해제하여 React 앱의 콘솔 로그를 확인할 수 있습니다.
  // mainWindow.webContents.openDevTools();

  // 페이지 로드 실패 시 이벤트 리스너 추가
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // console.error(`[Electron Main] Page failed to load: ${validatedURL}`);
    // console.error(`Error Code: ${errorCode}, Description: ${errorDescription}`);
    // 필요하다면 사용자에게 오류 메시지를 표시하거나 앱을 종료할 수 있습니다.
  });

  // 렌더러 프로세스 충돌 시 이벤트 리스너 추가
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    // console.error(`[Electron Main] Renderer process crashed or was killed:`);
    // console.error(details);
    // 필요하다면 창을 다시 로드하거나 오류 메시지를 표시할 수 있습니다.
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('open-deploy-window', (event, { content, deploymentTime }) => {
  const deployWindow = new BrowserWindow({
    width: 800,
    height: 600,
    parent: BrowserWindow.getFocusedWindow(),
    modal: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      // DeployWindow를 위한 Content Security Policy (data:text/html 로드)
      contentSecurityPolicy: "default-src 'self' data:; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; connect-src 'none'; font-src 'none'; object-src 'none'; media-src 'none'; child-src 'none';"
    }
  });

  deployWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <html>
      <head>
        <title>Deployed App</title>
        <style>
          body { font-family: 'Inter', sans-serif; margin: 20px; background-color: #f0f2f5; color: #333; }
          h1 { color: #007bff; }
          p { line-height: 1.6; }
          strong { color: #0056b3; }
            </style>
          </head>
          <body>
            <h1>App Deployment Simulation</h1>
            ${content}
            <p>Deployment Time: ${deploymentTime}</p>
          </body>
        </html>
      `)}`);

  deployWindow.once('ready-to-show', () => {
    deployWindow.show();
  });
});